import React, { useState } from 'react';
import { WhatChangedItem } from '../types';
import { AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

interface WhatChangedProps {
  items: WhatChangedItem[];
  projectName: string;
  isMemoryOff?: boolean;
}

export const WhatChanged: React.FC<WhatChangedProps> = ({
  items,
  projectName,
  isMemoryOff = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'similar' | 'changed'>('all');

  if (isMemoryOff || !items || items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 text-center shadow-lg">
        <HelpCircle className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-60" />
        <h4 className="text-sm font-semibold text-slate-300">
          Not enough historical evidence to compare.
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          When organizational memory is disabled or no historical records exist, ECHOLESS cannot substantiate a comparative analysis between past and present proposals.
        </p>
      </div>
    );
  }

  const stillSimilar = items.filter((i) => i.status === 'still_similar');
  const whatChanged = items.filter((i) => i.status !== 'still_similar');

  const filteredItems =
    activeTab === 'all'
      ? items
      : activeTab === 'similar'
      ? stillSimilar
      : whatChanged;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            Comparative Institutional Analysis
          </span>
          <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
            What Changed vs. What Remains Similar
          </h3>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Aspects ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'similar'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Still Similar ({stillSimilar.length})
          </button>
          <button
            onClick={() => setActiveTab('changed')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'changed'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            What Changed ({whatChanged.length})
          </button>
        </div>
      </div>

      {/* Grid of structured comparison cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredItems.map((item, idx) => {
          const isSimilar = item.status === 'still_similar';
          const isImproved = item.status === 'improved';

          return (
            <div
              key={idx}
              className={`rounded-lg border p-4 transition-colors ${
                isSimilar
                  ? 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50'
                  : isImproved
                  ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
                  {item.aspect}
                </span>

                <span
                  className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border ${
                    isSimilar
                      ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                      : isImproved
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                  }`}
                >
                  {isSimilar ? (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      STILL SIMILAR
                    </>
                  ) : isImproved ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      IMPROVED
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      DIVERGED / CHANGED
                    </>
                  )}
                </span>
              </div>

              {/* Side-by-side PAST vs TODAY comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 mb-3 border-b border-slate-800/80">
                <div className="rounded border border-slate-800/90 bg-[#080d17] p-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    PAST HISTORICAL EXPERIENCE
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-mono">
                    {item.past}
                  </div>
                </div>

                <div className="rounded border border-slate-800/90 bg-[#080d17] p-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 mb-1">
                    TODAY: {projectName}
                  </div>
                  <div className="text-xs text-cyan-100 leading-relaxed font-mono">
                    {item.today}
                  </div>
                </div>
              </div>

              {/* Analytical reasoning */}
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <span className="font-mono text-[11px] text-slate-500 uppercase shrink-0 mt-0.5">
                  ECHOLESS Finding:
                </span>
                <p className="leading-relaxed text-slate-300">{item.analysis}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
