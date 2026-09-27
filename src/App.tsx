import React, { useState, useEffect } from 'react';
import { HealthStatus, HistoricalMemory, ProjectInput, AnalysisResult, LessonInput } from './types';
import { SAMPLE_PROJECT_INPUTS, ALL_HISTORICAL_MEMORIES } from './lib/demo-data';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { AnalyzeView } from './components/AnalyzeView';
import { MemoryBrowserView } from './components/MemoryBrowserView';
import { LearningEvolutionView } from './components/LearningEvolutionView';
import { DemoJudgesView } from './components/DemoJudgesView';
import { VoiceAdvisorModal } from './components/VoiceAdvisorModal';
import { ShieldAlert, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [memories, setMemories] = useState<HistoricalMemory[]>(ALL_HISTORICAL_MEMORIES);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [selectedSampleForAnalyze, setSelectedSampleForAnalyze] = useState<ProjectInput | undefined>(undefined);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth({
          status: 'unavailable',
          configured: false,
          baseUrl: 'https://api.hindsight.vectorize.io',
          bankId: 'echoless-org-memory',
          message: 'Server health check returned non-200 status.',
          memoryCount: memories.length,
        });
      }
    } catch (err) {
      setHealth({
        status: 'unavailable',
        configured: false,
        baseUrl: 'https://api.hindsight.vectorize.io',
        bankId: 'echoless-org-memory',
        message: 'Could not contact server health endpoint.',
        memoryCount: memories.length,
      });
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      if (res.ok) {
        const data = await res.json();
        if (data.memories && Array.isArray(data.memories) && data.memories.length > 0) {
          setMemories(data.memories);
        }
      }
    } catch (err) {
      console.warn('[ECHOLESS] Failed to fetch memories from server, using local store:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchMemories();
  }, []);

  const handleSeedBank = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || '12+ near-miss memories indexed into Hindsight bank.');
        await fetchHealth();
        await fetchMemories();
      } else {
        showToast('Memory bank re-indexed locally.', 'info');
      }
    } catch (err) {
      showToast('Completed local memory bank re-indexing.', 'info');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAnalyze = async (
    project: ProjectInput,
    memoryMode: 'on' | 'off'
  ): Promise<AnalysisResult> => {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project, memoryMode }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Risk analysis failed. Please verify server status.');
    }

    return await res.json();
  };

  const handleSaveLesson = async (lessonInput: LessonInput): Promise<boolean> => {
    try {
      const res = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonInput),
      });

      if (res.ok) {
        showToast('Lesson retained in organizational memory.');
        await fetchHealth();
        await fetchMemories();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ECHOLESS] Failed to save lesson:', err);
      return false;
    }
  };

  const handleRetainMemory = async (
    content: string,
    context?: string,
    tags?: string[]
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/memories/retain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, context, tags }),
      });

      if (res.ok) {
        showToast('Experience successfully retained into Hindsight bank.');
        await fetchHealth();
        await fetchMemories();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ECHOLESS] Failed to retain memory:', err);
      return false;
    }
  };

  const handleSelectSampleForAnalysis = (sampleKey: string) => {
    if (SAMPLE_PROJECT_INPUTS[sampleKey]) {
      setSelectedSampleForAnalyze(SAMPLE_PROJECT_INPUTS[sampleKey]);
      setActiveTab('analyze');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-[#0d1424] px-4 py-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md animate-fadeIn">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <Database className="h-4 w-4 text-cyan-400 shrink-0" />
          )}
          <span className="font-mono">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onRefreshHealth={fetchHealth}
        onSeedBank={handleSeedBank}
        isSeeding={isSeeding}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
      />

      {/* Voice Advisor Modal (gemini-3.8-live) */}
      <VoiceAdvisorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        initialContext={
          selectedSampleForAnalyze
            ? `${selectedSampleForAnalyze.name}: ${selectedSampleForAnalyze.description}`
            : undefined
        }
      />

      {/* Main View Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewView
            health={health}
            memories={memories}
            onNavigate={setActiveTab}
            onSelectSampleForAnalysis={handleSelectSampleForAnalysis}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeView
            onAnalyze={handleAnalyze}
            onSaveLesson={handleSaveLesson}
            initialProject={selectedSampleForAnalyze}
            initialMemoryMode="on"
            onOpenVoice={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryBrowserView
            memories={memories}
            onRetainMemory={handleRetainMemory}
            onRefresh={fetchMemories}
            bankId={health?.bankId || 'echoless-org-memory'}
          />
        )}

        {activeTab === 'learning' && <LearningEvolutionView />}

        {activeTab === 'demo' && (
          <DemoJudgesView
            onAnalyze={handleAnalyze}
            onSaveLesson={handleSaveLesson}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060910] py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <span className="font-mono font-semibold text-slate-300">ECHOLESS</span>
            <span className="text-slate-600 mx-2">·</span>
            <span className="italic">“Don't learn only from failures. Learn from the warnings you almost ignored.”</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Memory: Hindsight Cloud</span>
            <span className="text-slate-700">|</span>
            <span>Bank: {health?.bankId || 'echoless-org-memory'}</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400">Near-Miss Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
