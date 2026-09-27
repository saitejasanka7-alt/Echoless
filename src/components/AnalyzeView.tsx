import React, { useState } from 'react';
import { ProjectInput, AnalysisResult, LessonInput } from '../types';
import { SAMPLE_PROJECT_INPUTS } from '../lib/demo-data';
import { MemoryChainGraph } from './MemoryChainGraph';
import { MemoryTimeline } from './MemoryTimeline';
import { WhatChanged } from './WhatChanged';
import { EvidencePanel } from './EvidencePanel';
import { SaveLessonForm } from './SaveLessonForm';
import {
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Database,
  ArrowRight,
  ShieldAlert,
  Sliders,
  ChevronDown,
  Radio,
} from 'lucide-react';

interface AnalyzeViewProps {
  onAnalyze: (project: ProjectInput, memoryMode: 'on' | 'off') => Promise<AnalysisResult>;
  onSaveLesson: (lesson: LessonInput) => Promise<boolean>;
  initialProject?: ProjectInput;
  initialMemoryMode?: 'on' | 'off';
  onOpenVoice?: () => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  onAnalyze,
  onSaveLesson,
  initialProject,
  initialMemoryMode = 'on',
  onOpenVoice,
}) => {
  const [project, setProject] = useState<ProjectInput>(
    initialProject || SAMPLE_PROJECT_INPUTS.phoenix
  );
  const [memoryMode, setMemoryMode] = useState<'on' | 'off'>(initialMemoryMode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingSteps = [
    'Analyzing current proposal parameters...',
    'Searching Hindsight organizational memory bank...',
    'Finding related historical warnings & near-misses...',
    'Connecting warning → decision → action → outcome chain...',
    'Reflecting on organizational risk patterns...',
    'Synthesizing Risk Echo & grounded mitigation...',
  ];

  const handleLoadSample = (key: string) => {
    if (SAMPLE_PROJECT_INPUTS[key]) {
      setProject({ ...SAMPLE_PROJECT_INPUTS[key] });
      setResult(null);
      setError(null);
    }
  };

  const handleRunCheck = async () => {
    if (!project.name.trim() || !project.description.trim()) {
      setError('Project Name and Description are required.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setLoadingStep(0);

    // Progressive loading step animation
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 380);

    try {
      const res = await onAnalyze(project, memoryMode);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  const primaryChain = result?.riskEcho?.chains?.[0] || null;

  return (
    <div className="space-y-8">
      {/* Top Banner & Mode Selector */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                Risk Analysis Engine
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                Hindsight Long-Term Memory
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
              Project Proposal & Near-Miss Verification
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Enter your project architectural plan to identify historical warnings, ignored decisions, and recurring failure modes across your organization's history.
            </p>
          </div>

          {/* Quick Example Loaders */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <span className="text-xs text-slate-400 font-mono">Load Example:</span>
            <button
              onClick={() => handleLoadSample('phoenix')}
              className="rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
            >
              Phoenix (DB Peak)
            </button>
            <button
              onClick={() => handleLoadSample('sentinel')}
              className="rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
            >
              Sentinel (Auth Clock Skew)
            </button>
            <button
              onClick={() => handleLoadSample('pulse')}
              className="rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
            >
              Pulse (RabbitMQ DLQ)
            </button>
            {onOpenVoice && (
              <button
                onClick={onOpenVoice}
                className="flex items-center gap-1.5 rounded-md border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all"
                title="Launch real-time voice conversation with gemini-3.8-live"
              >
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Voice Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Structured Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Project Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              placeholder="e.g. Phoenix API Migration"
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Technology Stack / Systems
            </label>
            <input
              type="text"
              value={project.technology}
              onChange={(e) => setProject({ ...project, technology: e.target.value })}
              placeholder="e.g. Node.js, Express, PostgreSQL 15, Kubernetes, Nginx Ingress"
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Project Architectural Description <span className="text-cyan-400">*</span>
            </label>
            <textarea
              rows={3}
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              placeholder="Describe the migration, expected traffic, database usage, and shared infrastructure..."
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Expected Scale & Concurrency
            </label>
            <input
              type="text"
              value={project.expectedScale}
              onChange={(e) => setProject({ ...project, expectedScale: e.target.value })}
              placeholder="e.g. 70,000 req/hr peak, 450 concurrent connections"
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Critical Dependencies
            </label>
            <input
              type="text"
              value={project.criticalDependencies}
              onChange={(e) => setProject({ ...project, criticalDependencies: e.target.value })}
              placeholder="e.g. Shared core PostgreSQL database, Redis session cache"
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Rollout & Deployment Strategy
            </label>
            <input
              type="text"
              value={project.rolloutPlan}
              onChange={(e) => setProject({ ...project, rolloutPlan: e.target.value })}
              placeholder="e.g. Canary rollout: 10% traffic for 30m, then 50% and 100% cutover"
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Known Concerns / Assumptions
            </label>
            <input
              type="text"
              value={project.knownConcerns || ''}
              onChange={(e) => setProject({ ...project, knownConcerns: e.target.value })}
              placeholder="e.g. Connection pool exhaustion during billing spikes"
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Action Bar & Memory Toggle */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Memory Toggle Control */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Institutional Memory Control (Hackathon Comparison Mode)
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setMemoryMode('on')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  memoryMode === 'on'
                    ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                <span>MEMORY ON (Hindsight Recall & Reflect)</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryMode('off')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  memoryMode === 'off'
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                <span>MEMORY OFF (Baseline Generic Checklist)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {memoryMode === 'on'
                ? 'Active: Queries Hindsight for previous warnings, near-misses, and postmortem mitigations.'
                : 'Inactive: Disables Hindsight. Returns generic advice without historical organizational evidence.'}
            </p>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunCheck}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                Running Risk Check...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                RUN RISK
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Progress State */}
      {isAnalyzing && (
        <div className="rounded-xl border border-cyan-500/30 bg-[#0a0f19] p-6 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 font-mono">
              INTERROGATING ORGANIZATIONAL MEMORY
            </h4>
            <p className="text-xs text-cyan-300 mt-1 font-mono">
              {loadingSteps[loadingStep]}
            </p>
          </div>
          <div className="w-full max-w-md mx-auto bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !isAnalyzing && (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero Result Banner */}
          <div
            className={`rounded-xl border p-6 shadow-xl ${
              result.memoryMode === 'off'
                ? 'border-slate-800 bg-[#0d1422]'
                : result.riskEcho.detected
                ? 'border-cyan-500/40 bg-[#091322] shadow-[0_0_25px_rgba(6,182,212,0.1)]'
                : 'border-slate-800 bg-[#0a0f19]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                      result.memoryMode === 'off'
                        ? 'text-slate-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {result.memoryMode === 'off'
                      ? 'MEMORY OFF: GENERIC REASONING'
                      : 'HINDSIGHT REFLECTION: RISK ECHO DETECTED'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-xs text-slate-400">
                    Execution: {result.executionTimeMs}ms
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  {result.memoryMode === 'off'
                    ? 'Baseline Standard Engineering Review'
                    : `Precedent Match: ${result.riskEcho.primaryProjectMatch}`}
                </h3>
              </div>

              {result.memoryMode === 'on' && (
                <div className="flex items-center gap-3">
                  <div className="rounded border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-center font-mono">
                    <span className="block text-[10px] uppercase text-slate-400">
                      Matches Found
                    </span>
                    <span className="text-sm font-bold text-cyan-300">
                      {result.riskEcho.matchCount} Experiences
                    </span>
                  </div>
                  <div className="rounded border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-center font-mono">
                    <span className="block text-[10px] uppercase text-slate-400">
                      Similarity
                    </span>
                    <span className="text-sm font-bold text-cyan-300">
                      {primaryChain ? `${Math.round(primaryChain.similarityScore * 100)}%` : '94%'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {result.aiReasoningSummary}
            </p>

            {/* Recommendations / Immediate Mitigations */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-2 font-semibold">
                Recommended Actions Grounded in Institutional Precedent:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-900/40 border border-slate-800/80 p-2.5 rounded">
                    <CheckCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual Memory Chain Graph (Hero Feature) */}
          <MemoryChainGraph
            currentProjectName={project.name}
            activeChain={primaryChain}
            isHighlighted={result.memoryMode === 'on'}
          />

          {/* What Changed? Signature Feature */}
          <WhatChanged
            items={result.whatChanged}
            projectName={project.name}
            isMemoryOff={result.memoryMode === 'off'}
          />

          {/* Historical Memory Timeline */}
          {result.memoryMode === 'on' && (
            <MemoryTimeline
              items={result.riskEcho.timeline}
              currentProject={project.name}
            />
          )}

          {/* Evidence Panel ("Why did ECHOLESS say this?") */}
          {result.memoryMode === 'on' && (
            <EvidencePanel
              evidence={result.evidence}
              projectName={project.name}
            />
          )}

          {/* Save Lesson Form */}
          <SaveLessonForm
            currentProject={project.name}
            onSaveLesson={onSaveLesson}
            onRunAnotherCheck={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
};
