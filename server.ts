import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { hindsightService } from './src/services/hindsight.service';
import { analysisService } from './src/services/analysis.service';
import { ProjectInput, LessonInput } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Endpoints

// 1. GET /api/health
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const health = await hindsightService.getHealth();
    res.json(health);
  } catch (err: unknown) {
    res.status(500).json({
      status: 'unavailable',
      configured: false,
      baseUrl: process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io',
      bankId: hindsightService.getBankId(),
      message: 'Hindsight memory is currently unavailable. Check the server configuration and try again.',
      memoryCount: 0,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// 2. POST /api/setup
app.post('/api/setup', async (_req: Request, res: Response) => {
  const isConfigured = hindsightService.isConfigured();
  res.json({
    success: true,
    bankId: hindsightService.getBankId(),
    isConfigured,
    message: isConfigured
      ? 'Hindsight bank configuration verified.'
      : 'HINDSIGHT_API_KEY not set. Ready in local organizational memory mode.',
  });
});

// 3. POST /api/seed
app.post('/api/seed', async (_req: Request, res: Response) => {
  try {
    const seedResult = await hindsightService.seedBank();
    res.json({
      success: true,
      message: `Successfully indexed ${seedResult.seededCount} organizational near-miss memory records.`,
      details: seedResult,
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed memory bank.',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// 4. POST /api/analyze
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const project = req.body?.project as ProjectInput;
    const memoryMode = (req.body?.memoryMode || 'on') as 'on' | 'off';

    if (!project || !project.name || !project.description) {
      return res.status(400).json({
        error: 'Project Name and Description are required for risk analysis.',
      });
    }

    const result = await analysisService.analyzeProject(project, memoryMode);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown analysis error';
    res.status(500).json({
      error: msg,
      message: 'Failed to complete risk analysis. Please verify inputs.',
    });
  }
});

// 5. GET /api/memories
app.get('/api/memories', async (_req: Request, res: Response) => {
  try {
    const memories = await hindsightService.listMemories();
    res.json({
      memories,
      total: memories.length,
      bankId: hindsightService.getBankId(),
    });
  } catch (err: unknown) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to retrieve memories',
      memories: [],
    });
  }
});

// 6. POST /api/memories/retain
app.post('/api/memories/retain', async (req: Request, res: Response) => {
  try {
    const { content, context, tags, metadata } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for memory retention.' });
    }

    const result = await hindsightService.retain(content, {
      context,
      tags,
      metadata,
      timestamp: new Date(),
    });

    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to retain memory',
    });
  }
});

// 7. POST /api/lesson
app.post('/api/lesson', async (req: Request, res: Response) => {
  try {
    const lessonInput = req.body as LessonInput;
    if (!lessonInput.project || !lessonInput.lesson) {
      return res.status(400).json({ error: 'Project and Lesson are required fields.' });
    }

    const result = await analysisService.saveLesson(lessonInput);
    res.json({
      success: true,
      message: 'Lesson successfully added to organizational memory.',
      memoryId: result.memoryId,
    });
  } catch (err: unknown) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to save lesson',
    });
  }
});

// Dev or Production Serving
async function startServer() {
  const server = http.createServer(app);

  // Initialize Gemini AI Client for Live Voice API
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  // Create WebSocket Server on /live path
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[ECHOLESS/Live] Client connected to voice advisor WebSocket');

    if (!ai) {
      clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }));
      clientWs.close();
      return;
    }

    let session: any = null;
    let isClosed = false;

    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are ECHOLESS Voice Memory Advisor — an expert enterprise AI agent specializing in organizational near-miss memory.
Your role is to help software engineers, architects, and engineering managers evaluate their project proposals against previous technical warnings, management tradeoffs, and postmortems.
You possess institutional memory of historical near-miss incidents:
- Project Orion (2025): Shared PostgreSQL connection pool saturation (>400 connections alongside billing) caused an 87-minute P0 outage. Lesson: enforce pgBouncer transaction pooling.
- Valkyrie Gateway (2024): 30-minute canary promotion window hid upstream client retry storm amplification (4.2x). Lesson: 90-minute canaries with p99 latency promotion gates.
- Project Atlas (2024): Destructive down-migration script prevented safe rollback. Lesson: expand-contract two-phase migrations only.
- Sentinel Identity (2024): Strict zero-second clock leeway on multi-region edge JWT dropped 14,000 sessions. Lesson: 60s clock skew tolerance.
- Boreas Event Stream (2023): Missing poison-pill quarantine flooded dead-letter queue with 3.2M events.
- Helios Platform (2023): Synchronous foreign-key table lock on 40M-row tables took down portal for 14 mins.
When users speak to you, keep your responses concise, insightful, conversational, and direct. Act like a seasoned principal engineer who helps them catch architectural blind spots before production cutover.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ status: 'connected' }));
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

            // Audio output from model
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ text: part.text, role: 'assistant' }));
                }
              }
            }

            // Output audio transcription
            const outputText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (outputText && !parts?.some(p => p.text === outputText)) {
              clientWs.send(JSON.stringify({ text: outputText, role: 'assistant' }));
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onerror: (err) => {
            console.error('[ECHOLESS/Live] Gemini Live session error:', err);
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: 'Live API session error occurred' }));
            }
          },
          onclose: () => {
            if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ status: 'closed' }));
            }
          },
        },
      });

      clientWs.on('message', (rawData) => {
        if (!session || isClosed) return;
        try {
          const payload = JSON.parse(rawData.toString());
          if (payload.audio) {
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
          if (payload.text) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          }
        } catch (err) {
          console.error('[ECHOLESS/Live] Error processing client audio frame:', err);
        }
      });

      clientWs.on('close', () => {
        isClosed = true;
        if (session) {
          try {
            session.close();
          } catch {
            // ignore
          }
        }
      });

      clientWs.on('error', (err) => {
        console.warn('[ECHOLESS/Live] Client WebSocket error:', err);
        isClosed = true;
        if (session) {
          try {
            session.close();
          } catch {
            // ignore
          }
        }
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[ECHOLESS/Live] Failed to connect to Gemini Live session:', errorMsg);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: `Failed to initialize Live voice session: ${errorMsg}` }));
      }
    }
  });

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[ECHOLESS] Server listening on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'}) [Gemini Live: /live]`);
  });
}

startServer().catch(err => {
  console.error('[ECHOLESS] Fatal startup error:', err);
  process.exit(1);
});
