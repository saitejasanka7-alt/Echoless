import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Square,
  Bot,
  User,
} from 'lucide-react';

interface VoiceAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

interface TranscriptTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const VoiceAdvisorModal: React.FC<VoiceAdvisorModalProps> = ({
  isOpen,
  onClose,
  initialContext,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Ready to connect');
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      text: 'Hello. I am the ECHOLESS Live Voice Memory Advisor, running on gemini-3.8-live. Speak to me about your proposed architecture or ask what warnings we almost missed in past projects like Orion or Valkyrie.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [textInput, setTextInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Keep isMutedRef in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Float32Array to 16-bit PCM Base64
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Base64 to Float32Array PCM
  const base64ToPcm = (base64: string): Float32Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
    }
    return float32Array;
  };

  // Play audio chunk at 24kHz with gapless scheduling
  const playAudioChunk = (base64Pcm: string) => {
    if (!outputAudioCtxRef.current) return;
    const audioCtx = outputAudioCtxRef.current;
    const float32Data = base64ToPcm(base64Pcm);
    const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now;
    }
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;

    setIsAssistantSpeaking(true);
    activeSourcesRef.current.push(source);

    source.onended = () => {
      const idx = activeSourcesRef.current.indexOf(source);
      if (idx !== -1) activeSourcesRef.current.splice(idx, 1);
      if (activeSourcesRef.current.length === 0) {
        setIsAssistantSpeaking(false);
      }
    };
  };

  // Stop scheduled playback on interruption
  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsAssistantSpeaking(false);
  };

  const startVoiceSession = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    setStatusText('Connecting to Gemini Live API...');

    try {
      // 1. Setup AudioContexts
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      inputAudioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;

      // 2. Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Setup WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusText('Listening · Speak now');

        // Optional: send initial project context
        if (initialContext) {
          ws.send(JSON.stringify({ text: `Current proposal context: ${initialContext}` }));
        }

        // 4. Connect microphone processing
        if (inputAudioCtxRef.current && mediaStreamRef.current) {
          const source = inputAudioCtxRef.current.createMediaStreamSource(mediaStreamRef.current);
          const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              setVolumeLevel(0);
              return;
            }

            const inputData = e.inputBuffer.getChannelData(0);

            // Compute volume level for visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setVolumeLevel(Math.min(1, rms * 6));

            const base64Audio = pcmToBase64(inputData);
            wsRef.current.send(JSON.stringify({ audio: base64Audio }));
          };

          source.connect(processor);
          processor.connect(inputAudioCtxRef.current.destination);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            setErrorMessage(msg.error);
            setStatusText('Error in Live API session');
          }

          if (msg.status === 'connected') {
            setStatusText('Connected · Speak to ECHOLESS');
          }

          if (msg.audio) {
            playAudioChunk(msg.audio);
            setStatusText('ECHOLESS Speaking...');
          }

          if (msg.text) {
            setTranscripts((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}-${Math.random()}`,
                role: msg.role || 'assistant',
                text: msg.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }

          if (msg.interrupted) {
            stopAllPlayback();
            setStatusText('Interrupted · Listening');
          }
        } catch (err) {
          console.error('[ECHOLESS/Voice] Error parsing message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[ECHOLESS/Voice] WebSocket error:', err);
        setErrorMessage('Failed to connect to the Live API WebSocket. Check server connection.');
        setIsConnecting(false);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setStatusText('Session disconnected');
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Microphone access or connection failed: ${msg}`);
      setIsConnecting(false);
      setIsConnected(false);
      setStatusText('Connection failed');
    }
  };

  const stopVoiceSession = () => {
    stopAllPlayback();

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setStatusText('Session ended');
    setVolumeLevel(0);
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userText = textInput.trim();
    setTextInput('');

    // Append to transcript
    setTranscripts((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: userText }));
    } else {
      setErrorMessage('Voice session is not active. Click "Connect Voice" to start conversing.');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setTextInput(prompt);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setTranscripts((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          text: prompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      wsRef.current.send(JSON.stringify({ text: prompt }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[720px] rounded-2xl border border-slate-800 bg-[#080d17] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0a101d]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Radio className={`h-4 w-4 ${isConnected ? 'animate-pulse text-cyan-300' : 'text-slate-400'}`} />
              {isConnected && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-100">
                  ECHOLESS Voice Memory Advisor
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/50 text-cyan-300">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-Time Voice Architecture Review & Near-Miss Consultation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopVoiceSession();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audio Visualizer & Connection State */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-[#060a12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Visualizer bars */}
            <div className="flex items-center gap-1 h-8 px-2 bg-slate-900/60 rounded-md border border-slate-800">
              {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3].map((multiplier, idx) => {
                const height = isConnected
                  ? isAssistantSpeaking
                    ? 10 + Math.sin(Date.now() / 100 + idx) * 12 + multiplier * 10
                    : Math.max(4, volumeLevel * 28 * multiplier)
                  : 4;
                return (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isAssistantSpeaking
                        ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                        : volumeLevel > 0.05
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                        : 'bg-slate-700'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>

            <div>
              <span className="font-mono text-xs text-slate-200 block">
                {statusText}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {isConnected
                  ? isAssistantSpeaking
                    ? 'Model generating 24kHz audio'
                    : isMuted
                    ? 'Microphone muted'
                    : '16kHz PCM audio stream active'
                  : 'Click connect to initiate Live session'}
              </span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isMuted
                      ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                      : 'border-slate-700 bg-slate-800 text-slate-200 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-cyan-400" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                {isAssistantSpeaking && (
                  <button
                    onClick={stopAllPlayback}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 text-xs font-medium hover:bg-purple-900/40 transition-colors"
                    title="Interrupt assistant speaking"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>Interrupt</span>
                  </button>
                )}

                <button
                  onClick={stopVoiceSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={startVoiceSession}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Connect Voice Advisor</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-3 rounded-lg border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {transcripts.map((turn) => {
            const isUser = turn.role === 'user';
            return (
              <div
                key={turn.id}
                className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-mono ${
                    isUser
                      ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-700 bg-slate-800 text-slate-300'
                  }`}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-cyan-400" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-xl p-3.5 border ${
                    isUser
                      ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-100'
                      : 'border-slate-800 bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-slate-500 mb-1">
                    <span>{isUser ? 'You' : 'ECHOLESS Advisor'}</span>
                    <span>{turn.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={transcriptEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 border-t border-slate-800/60 bg-[#070b14] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-mono shrink-0">Try asking:</span>
          <button
            onClick={() => handleQuickPrompt('What did we almost miss in Project Orion?')}
            className="shrink-0 px-2.5 py-1 rounded border border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300 transition-colors"
          >
            "What did we almost miss in Project Orion?"
          </button>
          <button
            onClick={() => handleQuickPrompt('Why did Valkyrie Gateway have a retry storm near-miss?')}
            className="shrink-0 px-2.5 py-1 rounded border border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300 transition-colors"
          >
            "Why did Valkyrie have a retry storm?"
          </button>
          <button
            onClick={() => handleQuickPrompt('We are migrating to PostgreSQL with 70,000 req/hr. What historical warnings apply?')}
            className="shrink-0 px-2.5 py-1 rounded border border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300 transition-colors"
          >
            "70k req/hr DB migration risks"
          </button>
        </div>

        {/* Text Fallback Input Bar */}
        <form onSubmit={handleSendText} className="p-4 border-t border-slate-800 bg-[#0a101d] flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={isConnected ? 'Speak via mic or type a message...' : 'Connect voice advisor or type a question...'}
            className="flex-1 rounded-lg border border-slate-800 bg-[#080d17] px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
