import React, { useState } from 'react';
import { TimelineItem } from '../types';
import { Clock, AlertTriangle, ShieldCheck, AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface MemoryTimelineProps {
  items: TimelineItem[];
  currentProject: string;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ items, currentProject }) => {
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case 'outcome':
      case 'near-miss':
        return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
      case 'lesson':
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case 'risk-echo':
        return <Clock className="h-3.5 w-3.5 text-cyan-400" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'outcome':
      case 'near-miss':
        return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
      case 'lesson':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'risk-echo':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            Historical Memory Timeline
          </span>
          <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
            Institutional Evolution & Warning Precedents
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Click any milestone to inspect
        </div>
      </div>

      {/* Timeline items list */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-800">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const isCurrentProject = item.type === 'risk-echo';

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(isSelected ? null : item)}
              className={`group relative cursor-pointer rounded-lg border p-3.5 transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-500/70 bg-[#0e1626] shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : isCurrentProject
                  ? 'border-cyan-500/40 bg-cyan-950/15 hover:border-cyan-500/60'
                  : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              {/* Dot on timeline line */}
              <div
                className={`absolute -left-[27px] top-4 h-3 w-3 rounded-full border-2 ${
                  isCurrentProject
                    ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : item.type === 'outcome' || item.type === 'near-miss'
                    ? 'border-rose-400 bg-rose-950'
                    : item.type === 'warning'
                    ? 'border-amber-400 bg-amber-950'
                    : 'border-emerald-400 bg-emerald-950'
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-300">
                    {item.year}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-medium text-slate-300">
                    {item.project}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${getBadgeColor(item.type)}`}>
                    {getIcon(item.type)}
                    {item.type.toUpperCase()}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </div>

              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Interactive Detail Modal / Drawer */}
      {selectedItem && (
        <div className="mt-6 rounded-lg border border-cyan-500/30 bg-[#0d1526] p-4 text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-mono text-[11px] text-cyan-400 flex items-center gap-1.5 font-semibold">
              MILESTONE DETAILS: {selectedItem.project} ({selectedItem.year})
            </span>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-1.5">
            <p className="font-medium text-slate-200">{selectedItem.title}</p>
            <p className="text-slate-400 leading-relaxed">{selectedItem.description}</p>
            <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span>Category: {selectedItem.type}</span>
              <span>·</span>
              <span>Relevance to {currentProject}: High Precedent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
