import React, { useState } from 'react';
import { MemoryChain } from '../types';
import { AlertTriangle, Compass, Play, Zap, BookOpen, ShieldAlert, ArrowDown } from 'lucide-react';

interface MemoryChainGraphProps {
  currentProjectName: string;
  activeChain?: MemoryChain | null;
  isHighlighted?: boolean;
}

export const MemoryChainGraph: React.FC<MemoryChainGraphProps> = ({
  currentProjectName,
  activeChain,
  isHighlighted = true,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'current',
      label: 'CURRENT PROJECT',
      sublabel: currentProjectName || 'Proposed Architecture',
      icon: Compass,
      color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300',
      activeColor: 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      detail: `Current incoming proposal: ${currentProjectName}. Evaluated against Hindsight organizational memory.`,
    },
    {
      id: 'warning',
      label: 'HISTORICAL WARNING',
      sublabel: activeChain?.warning.raisedBy || 'Ignored Technical Warning',
      icon: AlertTriangle,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      activeColor: 'border-amber-400 bg-amber-950/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      detail: activeChain?.warning.text || 'Early architectural or operational warning raised by engineering staff prior to incident.',
    },
    {
      id: 'decision',
      label: 'MANAGEMENT DECISION',
      sublabel: activeChain ? `Tradeoff in ${activeChain.project}` : 'Schedule Tradeoff',
      icon: Play,
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      activeColor: 'border-purple-400 bg-purple-950/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
      detail: activeChain?.decision.text || 'Decision to proceed despite the warning due to schedule pressure or assumed mitigation.',
    },
    {
      id: 'action',
      label: 'PRODUCTION ACTION',
      sublabel: 'Deployment Execution',
      icon: Zap,
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      activeColor: 'border-blue-400 bg-blue-950/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
      detail: activeChain?.action.text || 'The actual rollout executed in production without defensive isolation.',
    },
    {
      id: 'outcome',
      label: 'INCIDENT / NEAR-MISS',
      sublabel: activeChain ? `${activeChain.outcome.severity.toUpperCase()} Degradation` : 'Service Impact',
      icon: ShieldAlert,
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      activeColor: 'border-rose-400 bg-rose-950/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      detail: activeChain?.outcome.text || 'The resulting operational disruption, near-miss, or cascading failure.',
    },
    {
      id: 'lesson',
      label: 'POSTMORTEM LESSON',
      sublabel: 'Institutional Rule',
      icon: BookOpen,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      activeColor: 'border-emerald-400 bg-emerald-950/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      detail: activeChain?.lesson.text || 'Mandatory procedural or architectural rule documented following the incident.',
    },
    {
      id: 'futureRisk',
      label: 'FUTURE RISK ECHO',
      sublabel: 'Averted Blind Spot',
      icon: AlertTriangle,
      color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
      activeColor: 'border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      detail: activeChain?.futureRisk.text || 'Synthesized foresight: How applying the lesson prevents repeating the exact near-miss pattern today.',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            Organizational Memory Chain
          </span>
          <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
            Warning → Decision → Action → Outcome → Lesson → Future Risk
          </h3>
        </div>
        {activeChain && (
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="text-slate-500">Historical Precedent:</span>
            <span className="text-cyan-400 font-semibold">{activeChain.project} ({activeChain.year})</span>
          </div>
        )}
      </div>

      {/* Graph Visual Nodes Flow */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 items-stretch relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          const isFinal = index === nodes.length - 1;

          return (
            <React.Fragment key={node.id}>
              <div
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                className={`group relative flex flex-col justify-between rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
                  isSelected || isHighlighted ? node.activeColor : node.color
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider opacity-75">
                      0{index + 1}
                    </span>
                    <Icon className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100" />
                  </div>
                  <div className="font-mono text-[10px] font-semibold tracking-tight uppercase line-clamp-1">
                    {node.label}
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 mt-0.5 line-clamp-1">
                    {node.sublabel}
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 opacity-90 line-clamp-2">
                  {node.detail}
                </div>

                {/* Subtle active glow indicator */}
                {isSelected && (
                  <div className="absolute -inset-px rounded-lg ring-1 ring-cyan-400/60 pointer-events-none" />
                )}
              </div>

              {/* Connecting arrow for larger screens */}
              {!isFinal && (
                <div className="hidden md:flex items-center justify-center -mx-2 z-10 text-slate-600">
                  <span className="text-xs font-mono opacity-50">→</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Node Detail Drawer / Inspection */}
      {selectedNode && (
        <div className="mt-4 p-3.5 rounded-lg border border-slate-800 bg-[#0d1424] text-xs text-slate-200 transition-all">
          <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400 mb-1">
            <span>INSPECTING NODE: {nodes.find(n => n.id === selectedNode)?.label}</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {nodes.find(n => n.id === selectedNode)?.detail}
          </p>
          {selectedNode === 'futureRisk' && activeChain?.futureRisk?.recommendation && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-emerald-400 font-medium text-xs">
              Direct Action: {activeChain.futureRisk.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
