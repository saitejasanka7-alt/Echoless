import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const LearningEvolutionView: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);

  const evolutionMilestones = [
    {
      id: 1,
      tag: 'INTERACTION 1',
      stage: 'Cold Start / Baseline',
      title: 'Generic Standard Response',
      description:
        'Without prior organizational memory, reasoning is restricted to general computer science best practices and basic checklists. No historical institutional awareness exists.',
      outputSample:
        '“Ensure database indexing is optimized. Configure CPU and memory alerts. Verify rollback scripts exist. Ensure team on-call engineers are available during release window.”',
      hindsightState:
        'Bank initialized: 0 historical near-misses recorded. Relying purely on baseline prompt instructions.',
      precision: 'Baseline (Generic)',
    },
    {
      id: 5,
      tag: 'INTERACTION 5',
      stage: 'Historical Context Discovered',
      title: 'First Cross-Project Memory Attribution',
      description:
        'As initial project postmortems and warnings are retained, ECHOLESS discovers the first correlations between separate service teams and shared infrastructure.',
      outputSample:
        '“Historical memory notes that Project Orion experienced connection pool bottlenecks during its launch. Consider checking if today\'s traffic profile shares the same database instances.”',
      hindsightState:
        '5 experiences retained. Hindsight recall surfaces similarity embeddings matching database connection spikes.',
      precision: 'Moderate (Associative)',
    },
    {
      id: 10,
      tag: 'INTERACTION 10',
      stage: 'Recurring Risk Pattern Found',
      title: 'Systemic Vulnerability Detection',
      description:
        'With multiple postmortems indexed, the memory agent identifies systemic patterns — recognizing that 30-minute canary rollouts repeatedly mask upstream retry amplification cascades.',
      outputSample:
        '“ECHOLESS identified a recurring warning pattern across Valkyrie and Boreas: Short 30-minute canary gates failed to catch client retry amplification. Extend canary to 90 minutes with p99 latency gates.”',
      hindsightState:
        '10+ experiences retained. Hindsight reflect extracts multi-incident themes across disparate teams.',
      precision: 'High (Pattern Recognition)',
    },
    {
      id: 20,
      tag: 'INTERACTION 20+',
      stage: 'Deep Institutional Foresight',
      title: 'Richer Organization-Specific Reasoning',
      description:
        'ECHOLESS synthesizes the complete chain: Warning → Decision → Action → Outcome → Lesson → Future Risk. It pinpoints the exact tradeoff decisions that previously led to outages and provides proactive guardrails.',
      outputSample:
        '“Historical evidence demonstrates that deploying 70,000 req/hr against the shared core PostgreSQL without pgBouncer transaction pooling mirrors the exact warning ignored before the 87-minute P0 outage in INC-2025-089. Mandatory mitigation: enforce 150-connection ceiling and two-phase Expand-Contract schema compatibility.”',
      hindsightState:
        'Mature organizational bank. Active recall & reflection synthesize cross-temporal causal chains.',
      precision: 'Autonomous Institutional Intelligence',
    },
  ];

  const current = evolutionMilestones[selectedMilestone];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                Institutional Memory Accumulation
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-slate-400">
                Cognitive Evolution Curve
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
              How Organizational Memory Deepens Over Time
            </h2>
          </div>
          <span className="font-mono text-xs text-cyan-400/80">
            Interactive Progression Model
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Observe how ECHOLESS transitions from generic boilerplate checklists (Interaction 1) to profound institutional foresight and proactive incident prevention as near-misses and postmortems are continuously retained in Hindsight.
        </p>

        {/* Demo Notice */}
        <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-900/50 p-2 rounded border border-slate-800">
          <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>Notice: Illustrative demo progression representing organizational memory accumulation over time.</span>
        </div>
      </div>

      {/* Stepper / Timeline Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {evolutionMilestones.map((milestone, idx) => {
          const isSelected = selectedMilestone === idx;
          return (
            <button
              key={milestone.id}
              onClick={() => setSelectedMilestone(idx)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-cyan-500/70 bg-[#0e1628] shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50'
                  : 'border-slate-800 bg-[#0a0f19] hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${
                    isSelected ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  {milestone.tag}
                </span>
                <h4 className="text-xs font-semibold text-slate-200 mt-1">
                  {milestone.stage}
                </h4>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{milestone.precision}</span>
                {isSelected && <span className="text-cyan-400 font-bold">● Active</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep Dive into Selected Milestone */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 shadow-xl space-y-5 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
              {current.tag} · {current.stage}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-0.5">
              {current.title}
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Memory Depth: {current.precision}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {current.description}
        </p>

        {/* Output Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-800 bg-[#080d17] p-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 block mb-2">
              Reasoning Output at this stage:
            </span>
            <blockquote className="text-xs text-slate-200 font-mono leading-relaxed italic">
              {current.outputSample}
            </blockquote>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#080d17] p-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-2">
              Hindsight Cognitive State:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {current.hindsightState}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Grounded in actual organizational history</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
