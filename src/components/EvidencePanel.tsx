import React from 'react';
import { EvidenceItem } from '../types';
import { ShieldCheck, BookOpen, User, Cpu } from 'lucide-react';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
  projectName: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence, projectName }) => {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'HISTORICAL_FACT':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-300">
            <BookOpen className="h-3 w-3" />
            HISTORICAL FACT
          </span>
        );
      case 'CURRENT_INPUT':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/30 text-cyan-300">
            <User className="h-3 w-3" />
            CURRENT INPUT
          </span>
        );
      case 'AI_INTERPRETATION':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border border-purple-500/40 bg-purple-950/30 text-purple-300">
            <Cpu className="h-3 w-3" />
            AI INTERPRETATION
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 mb-5 gap-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            Verifiable Attribution
          </span>
          <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
            Why Did ECHOLESS Say This?
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Audit Trail: Historical Memory → Current Synthesis
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidence.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {item.project}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-xs text-slate-400">
                    {item.year}
                  </span>
                </div>
                {getClassificationBadge(item.classification)}
              </div>

              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-tight mb-1.5">
                {item.type}
              </div>

              <blockquote className="rounded border-l-2 border-slate-700 bg-[#080d17] p-2.5 text-xs text-slate-300 italic mb-3 font-mono leading-relaxed">
                "{item.memoryText}"
              </blockquote>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-1">
                Why It Matters Today
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.whyItMatters}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Transparency Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Strict Non-Hallucination Policy: All risk echoes grounded in persistent Hindsight memory.
        </span>
        <span className="hidden sm:inline">Bank: echoless-org-memory</span>
      </div>
    </div>
  );
};
