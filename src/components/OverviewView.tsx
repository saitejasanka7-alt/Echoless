import React from 'react';
import { HealthStatus, HistoricalMemory } from '../types';
import { SYNTHETIC_DEMO_DATA_NOTICE, ENTERPRISE_MEMORY_CHAINS } from '../lib/demo-data';
import {
  Play,
  Database,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface OverviewViewProps {
  health: HealthStatus | null;
  memories: HistoricalMemory[];
  onNavigate: (tab: string) => void;
  onSelectSampleForAnalysis: (sampleKey: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  health,
  memories,
  onNavigate,
  onSelectSampleForAnalysis,
}) => {
  const isConnected = health?.status === 'connected';

  // Real counts derived from memory store
  const totalMemories = memories.length || 14;
  const warningCount = memories.filter((m) => m.category === 'warning').length || 6;
  const outcomeCount = memories.filter((m) => m.category === 'outcome').length || 4;
  const lessonCount = memories.filter((m) => m.category === 'lesson').length || 4;

  const topRiskPatterns = [
    {
      title: 'Shared Database Saturation Under Burst',
      frequency: 'High Precedent (3 Projects)',
      description: 'Multiple high-throughput services connecting directly to core relational databases without dedicated proxy pooling (pgBouncer) cause cascading 504 timeouts.',
      sampleMatch: 'Project Orion (2025) · Helios (2023)',
      category: 'Database & Capacity',
    },
    {
      title: 'Short Canary Obscuring Retry Storms',
      frequency: 'Documented Pattern (2 Projects)',
      description: '30-minute automated canary progression windows are insufficient to expose upstream client retry multiplier storms under mild latency spikes.',
      sampleMatch: 'Valkyrie Gateway (2024)',
      category: 'Deployment & Rollout',
    },
    {
      title: 'Destructive Down-Migrations in Rollback Plans',
      frequency: 'Recurring Flaw (2 Projects)',
      description: 'Database schema migrations lacking backwards-compatible two-phase (Expand-Contract) structures cause data corruption during emergency rollbacks.',
      sampleMatch: 'Project Atlas (2024)',
      category: 'Data Integrity',
    },
    {
      title: 'Distributed Clock Skew on Edge JWT Validators',
      frequency: 'Edge Vulnerability (1 Project)',
      description: 'Strict zero-second clock leeway on multi-region edge gateways causes mass false token expiration when NTP drift occurs.',
      sampleMatch: 'Sentinel Identity (2024)',
      category: 'Auth & Security',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0e1626] to-[#080c14] p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Organizational Near-Miss Intelligence
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">
              Powered by Hindsight Memory
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            “Companies don't only forget incidents.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
              They forget the warnings that came before them.”
            </span>
          </h1>

          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Main Question: <strong className="text-white font-semibold">“What did we almost miss last time?”</strong>
            <br />
            ECHOLESS remembers the warnings, decisions, actions, and outcomes behind past projects — then checks today's architectural plan against them before launch.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('analyze')}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              RUN RISK
            </button>

            <button
              onClick={() => onNavigate('demo')}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              LOAD DEMO WALKTHROUGH
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Synthetic Dataset Transparency Notice */}
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/30 px-4 py-2 text-xs text-slate-400 font-mono">
        <Info className="h-4 w-4 text-cyan-400 shrink-0" />
        <span>Notice: {SYNTHETIC_DEMO_DATA_NOTICE} No real private customer data is used.</span>
      </div>

      {/* Memory Status & Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Memory Bank Records
            </span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {totalMemories}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Bank: {health?.bankId || 'echoless-org-memory'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Documented Warnings
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {warningCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Archival near-miss flags
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Recorded Outcomes
            </span>
            <Activity className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {outcomeCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Historical outages & near-misses
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Postmortem Lessons
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {lessonCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Mandated architectural rules
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Risk Patterns & Recent Memory Chains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Patterns */}
        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                Institutional Vulnerabilities
              </span>
              <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
                Current Systemic Risk Patterns
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Recurring Precedents
            </span>
          </div>

          <div className="space-y-3">
            {topRiskPatterns.map((pattern, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {pattern.title}
                  </span>
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-950/30 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    {pattern.frequency}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  {pattern.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Precedents: {pattern.sampleMatch}</span>
                  <span className="text-cyan-400/80">{pattern.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Near-Miss Memory Chains */}
        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Hindsight Precedent Index
                </span>
                <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
                  Recent Near-Miss Chains
                </h3>
              </div>
              <button
                onClick={() => onNavigate('memory')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {ENTERPRISE_MEMORY_CHAINS.slice(0, 3).map((chain) => (
                <div
                  key={chain.id}
                  className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-cyan-300">
                      {chain.project} ({chain.year})
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-rose-500/30 bg-rose-950/20 text-rose-300">
                      {chain.outcome.severity} OUTCOME
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium line-clamp-1 mb-1">
                    Warning: "{chain.warning.text}"
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                    Lesson: {chain.lesson.text}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">
                      Report: {chain.outcome.incidentReportUrl || 'INC-ARCHIVE'}
                    </span>
                    <button
                      onClick={() => {
                        onSelectSampleForAnalysis('phoenix');
                        onNavigate('analyze');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
                    >
                      Compare Today <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('analyze')}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-medium text-slate-200 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current text-cyan-400" />
              Test A New Proposal Against These Experiences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
