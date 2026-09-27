import React, { useState } from 'react';
import { LessonInput } from '../types';
import { BookmarkPlus, Check, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

interface SaveLessonFormProps {
  currentProject: string;
  onSaveLesson: (lesson: LessonInput) => Promise<boolean>;
  onRunAnotherCheck: () => void;
}

export const SaveLessonForm: React.FC<SaveLessonFormProps> = ({
  currentProject,
  onSaveLesson,
  onRunAnotherCheck,
}) => {
  const [warning, setWarning] = useState('');
  const [decision, setDecision] = useState('');
  const [action, setAction] = useState('');
  const [outcome, setOutcome] = useState('');
  const [lesson, setLesson] = useState('');
  const [mitigation, setMitigation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson.trim() || !warning.trim()) {
      setError('Please provide at least the Warning and the Lesson Learned.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const success = await onSaveLesson({
        project: currentProject,
        warning,
        decision,
        action,
        outcome,
        lesson,
        mitigation,
        tags: [currentProject.toLowerCase().replace(/\s+/g, '-'), 'postmortem', 'user-retained'],
      });

      if (success) {
        setIsSaved(true);
      } else {
        setError('Failed to retain lesson in Hindsight memory.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSaved) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-6 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-500/40 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Check className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-emerald-300 font-mono tracking-wide uppercase">
          LESSON ADDED TO ORGANIZATIONAL MEMORY
        </h4>
        <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
          The warning, decision, and postmortem mitigations for <span className="font-semibold text-white">{currentProject}</span> have been retained in the Hindsight bank. Subsequent risk checks will now draw upon this institutional memory.
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={onRunAnotherCheck}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            RUN ANOTHER CHECK
          </button>
          <button
            onClick={() => {
              setIsSaved(false);
              setWarning('');
              setDecision('');
              setAction('');
              setOutcome('');
              setLesson('');
              setMitigation('');
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Add Another Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
            Institutional Memory Retention
          </span>
          <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
            Save This Lesson to Organizational Bank
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <BookmarkPlus className="h-3.5 w-3.5 text-cyan-400" />
          <span>Retain for Future Proposals</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Record what your team almost missed or learned during this project review. Once retained into Hindsight, future engineers will be alerted whenever their proposals match this pattern.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Warning Raised (What was almost missed?)
            </label>
            <input
              type="text"
              value={warning}
              onChange={(e) => setWarning(e.target.value)}
              placeholder="e.g. DBA warned connection pool would saturate during peak billing."
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Decision & Rationale (What was decided?)
            </label>
            <input
              type="text"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Proceeded without proxy pooling to meet launch date."
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Production Action
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Cutover 100% traffic via canary without dedicated pool ceiling."
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Outcome / Incident Impact
            </label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. Cascading 504 timeouts across core billing for 87 minutes."
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Postmortem Lesson Learned <span className="text-cyan-400">*</span>
          </label>
          <textarea
            rows={2}
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            placeholder="e.g. Never launch a high-throughput tier sharing core database instances without dedicated pgBouncer transaction pooling."
            className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Future Mitigation / Guardrail
          </label>
          <input
            type="text"
            value={mitigation}
            onChange={(e) => setMitigation(e.target.value)}
            placeholder="e.g. Require pgBouncer transaction mode and synthetic burst drill before production canary promotion."
            className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Writes to server-side memory bank: echoless-org-memory
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Retaining into Memory...
              </>
            ) : (
              <>
                <BookmarkPlus className="h-3.5 w-3.5" />
                SAVE THIS LESSON
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
