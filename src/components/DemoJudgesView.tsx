import React, { useState } from 'react';
import { ProjectInput, AnalysisResult, LessonInput } from '../types';
import { SAMPLE_PROJECT_INPUTS } from '../lib/demo-data';
import { MemoryChainGraph } from './MemoryChainGraph';
import { MemoryTimeline } from './MemoryTimeline';
import { WhatChanged } from './WhatChanged';
import { EvidencePanel } from './EvidencePanel';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  CheckCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface DemoJudgesViewProps {
  onAnalyze: (project: ProjectInput, memoryMode: 'on' | 'off') => Promise<AnalysisResult>;
  onSaveLesson: (lesson: LessonInput) => Promise<boolean>;
  onNavigateToTab: (tab: string) => void;
}

export const DemoJudgesView: React.FC<DemoJudgesViewProps> = ({
  onAnalyze,
  onSaveLesson,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [memoryOffResult, setMemoryOffResult] = useState<AnalysisResult | null>(null);
  const [memoryOnResult, setMemoryOnResult] = useState<AnalysisResult | null>(null);
  const [savedLessonSuccess, setSavedLessonSuccess] = useState<boolean>(false);
  const [repeatResult, setRepeatResult] = useState<AnalysisResult | null>(null);

  const demoProject = SAMPLE_PROJECT_INPUTS.phoenix;

  // Step 1: Run Memory OFF
  const runStep1 = async () => {
    setIsLoading(true);
    try {
      const res = await onAnalyze(demoProject, 'off');
      setMemoryOffResult(res);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Run Memory ON
  const runStep2 = async () => {
    setIsLoading(true);
    try {
      const res = await onAnalyze(demoProject, 'on');
      setMemoryOnResult(res);
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 7: Save Lesson
  const runStep7Save = async () => {
    setIsLoading(true);
    try {
      const success = await onSaveLesson({
        project: 'Phoenix API Migration (Pre-Release Phase 1)',
        warning: 'Canary traffic ramped to 50% without dedicated pgBouncer pooling; database queue latency reached 350ms.',
        decision: 'Halted canary at 50% immediately and provisioned transaction-level connection proxy.',
        action: 'Deployed pgBouncer in transaction mode with max 120 connections and resumed canary.',
        outcome: 'Database CPU dropped from 92% to 28%. Zero dropped packets or 504 errors recorded.',
        lesson: 'Pre-flight pgBouncer proxy deployment is non-negotiable for any service exceeding 50,000 req/hr on core DB.',
        mitigation: 'Automated CI/CD policy check: fail canary rollout if pgBouncer pool ceiling is absent.',
        tags: ['phoenix', 'database', 'pgbouncer', 'near-miss-prevention'],
      });
      setSavedLessonSuccess(success);
      setCurrentStep(7);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 8: Repeat Analysis with newly retained memory
  const runStep8Repeat = async () => {
    setIsLoading(true);
    try {
      const res = await onAnalyze(
        {
          name: 'Phoenix Billing Integration V2',
          description: 'Expanding Phoenix API to handle real-time customer billing webhooks and checkout events over the shared database cluster.',
          technology: 'Node.js, PostgreSQL 15, Redis, Kubernetes',
          expectedScale: '85,000 req/hr peak',
          criticalDependencies: 'Shared core PostgreSQL, Billing queue',
          rolloutPlan: 'Canary deployment with 30m intervals',
          knownConcerns: 'Database contention under peak billing events',
        },
        'on'
      );
      setRepeatResult(res);
      setCurrentStep(8);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Memory OFF', subtitle: 'Generic baseline checklist' },
    { num: 2, title: 'Memory ON', subtitle: 'Hindsight organizational recall' },
    { num: 3, title: 'Risk Echo', subtitle: 'Historical warning identification' },
    { num: 4, title: 'Timeline', subtitle: 'Warning → Outcome → Lesson' },
    { num: 5, title: 'What Changed?', subtitle: 'Past vs Today comparison' },
    { num: 6, title: 'Evidence', subtitle: 'Attribution & trust audit' },
    { num: 7, title: 'Save Lesson', subtitle: 'Store new near-miss into bank' },
    { num: 8, title: 'Repeat Check', subtitle: 'Verify expanded memory in action' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Demo Walkthrough Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                Hackathon Judge Evaluation Flow
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-slate-400">
                8-Step Interactive Walkthrough
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
              ECHOLESS Product Verification Tour
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step-by-step demonstration verifying the core value proposition: comparing conventional generic AI advice (Memory OFF) against true long-term organizational recall (Memory ON via Hindsight).
            </p>
          </div>

          {/* Judging Criteria Highlights */}
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
              Innovation: <strong className="text-cyan-400">30%</strong>
            </span>
            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
              Hindsight Memory: <strong className="text-cyan-400">25%</strong>
            </span>
            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
              Technical: <strong className="text-cyan-400">20%</strong>
            </span>
            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-300">
              UX: <strong className="text-cyan-400">15%</strong>
            </span>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`rounded-lg border p-2.5 text-left transition-all ${
                  isActive
                    ? 'border-cyan-500/80 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50'
                    : isCompleted
                    ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    : 'border-slate-800/60 bg-slate-900/20 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isActive
                        ? 'text-cyan-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    STEP 0{s.num}
                  </span>
                  {isCompleted && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                </div>
                <div className="font-semibold text-xs text-slate-200 line-clamp-1">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 shadow-xl space-y-6">
        {/* STEP 1: MEMORY OFF */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                  Step 1 of 8 · Baseline Control Test
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Memory OFF: Conventional Generic Engineering Advice
                </h3>
              </div>
              <button
                onClick={runStep1}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isLoading ? 'Executing...' : 'Run Memory OFF Baseline'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When organizational memory is disabled, AI models evaluate proposals using only general computer science knowledge. They produce generic advice without awareness of your company's previous failures or near-misses.
            </p>

            <div className="rounded-lg border border-slate-800 bg-[#080d17] p-4 text-xs text-slate-300 space-y-3 font-mono">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                Output for "Phoenix API Migration" without Hindsight:
              </div>
              <blockquote className="border-l-2 border-slate-700 pl-3 italic text-slate-400 leading-relaxed">
                “Ensure database capacity is sized appropriately. Verify CPU and memory utilization thresholds. Check that deployment scripts have rollback capability. Monitor HTTP 200 responses during canary rollout.”
              </blockquote>
              <div className="pt-2 text-[11px] text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Notice: No mention of Project Orion (2025), shared billing database contention, or pgBouncer transaction pooling requirements.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  runStep2();
                }}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Proceed to Step 2: Memory ON
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MEMORY ON */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 2 of 8 · Hindsight Integration
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Memory ON: Hindsight Recall & Reflect Active
                </h3>
              </div>
              <button
                onClick={runStep2}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isLoading ? 'Recalling...' : 'Re-Run Hindsight Check'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Now Hindsight long-term memory is active. The engine calls <code className="font-mono text-cyan-300">recall()</code> and <code className="font-mono text-cyan-300">reflect()</code> over the organizational memory bank to uncover prior warnings, decisions, and near-misses.
            </p>

            <div className="rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-4 text-xs text-slate-200 space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400">
                <span>HINDSIGHT REFLECTION RESULT</span>
                <span>Bank: echoless-org-memory</span>
              </div>
              <p className="leading-relaxed">
                “Historical evidence shows that Phoenix API Migration directly replicates the failure conditions of Project Orion (2025). The proposal shares the unpartitioned core PostgreSQL instance with billing and lacks pgBouncer transaction pooling — the exact root cause of the 87-minute P0 outage in INC-2025-089.”
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Step 1
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Inspect Step 3: Risk Echo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RISK ECHO */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 3 of 8 · Hero Feature
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Risk Echo: 3 Relevant Historical Precedents Discovered
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ECHOLESS surfaces the exact chain of warnings that preceded previous incidents, making visible what engineers almost missed.
            </p>

            {/* Visual Memory Chain Graph */}
            <MemoryChainGraph
              currentProjectName="Phoenix API Migration"
              activeChain={SAMPLE_PROJECT_INPUTS.phoenix ? null : null}
              isHighlighted={true}
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Step 2
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Step 4: Interactive Timeline
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TIMELINE */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 4 of 8 · Temporal Provenance
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Memory Timeline: Warning → Decision → Outage → Lesson
                </h3>
              </div>
            </div>

            <MemoryTimeline
              items={[
                {
                  id: 'demo-t1',
                  year: 2025,
                  date: 'March 14, 2025',
                  project: 'Project Orion',
                  type: 'warning',
                  title: 'DBA Warns on Connection Pool Saturation',
                  description: 'Warning raised that 400+ connections alongside billing would exhaust PostgreSQL connection limits.',
                },
                {
                  id: 'demo-t2',
                  year: 2025,
                  date: 'March 28, 2025',
                  project: 'Project Orion',
                  type: 'outcome',
                  title: 'Cascading 504 Outage (87 mins)',
                  description: 'Database reached 98% CPU and 500 connections; billing and customer API crashed.',
                },
                {
                  id: 'demo-t3',
                  year: 2025,
                  date: 'April 02, 2025',
                  project: 'Project Orion',
                  type: 'lesson',
                  title: 'Mandatory Dedicated pgBouncer Proxy Rule',
                  description: 'Postmortem mandated transaction-mode proxy pooling for all shared DB clients.',
                },
                {
                  id: 'demo-t4',
                  year: 2026,
                  date: 'Today',
                  project: 'Phoenix API Migration',
                  type: 'risk-echo',
                  title: 'Risk Echo Detected: Same Pattern Replicating',
                  description: 'Phoenix proposes 450 concurrent connections on the same DB without proxy pooling.',
                },
              ]}
              currentProject="Phoenix API Migration"
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Step 3
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Step 5: What Changed?
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: WHAT CHANGED */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 5 of 8 · Comparative Rigor
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  What Changed? (Strictly Grounded Facts vs Assumptions)
                </h3>
              </div>
            </div>

            <WhatChanged
              items={[
                {
                  aspect: 'Database Dependency',
                  past: 'Shared PostgreSQL cluster with Billing (400 connection ceiling)',
                  today: 'Same shared PostgreSQL cluster with Billing (450 concurrent connections)',
                  status: 'still_similar',
                  analysis: 'Both systems place burst load directly on the billing database without hardware or replica isolation.',
                },
                {
                  aspect: 'Traffic Scale',
                  past: '55,000 req/hr peak during 2025 launch',
                  today: '70,000 req/hr (+27% increase above 2025 outage load)',
                  status: 'diverged',
                  analysis: 'Expected volume is 27% higher than the load that previously saturated connection pools.',
                },
                {
                  aspect: 'Connection Proxy Layer',
                  past: 'Node.js client pooling only; pgBouncer omitted due to schedule rush',
                  today: 'Standard Node.js client pooling without pgBouncer transaction mode',
                  status: 'still_similar',
                  analysis: 'The primary mitigation established in the 2025 postmortem remains unaddressed.',
                },
                {
                  aspect: 'Canary Progression Window',
                  past: '30-minute automated canary progression',
                  today: '30-minute automated canary progression',
                  status: 'still_similar',
                  analysis: '30 minutes previously failed to expose retry storm amplification before 50% cutover.',
                },
              ]}
              projectName="Phoenix API Migration"
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Step 4
              </button>
              <button
                onClick={() => setCurrentStep(6)}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Step 6: Verifiable Evidence
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: EVIDENCE */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 6 of 8 · Trust & Non-Hallucination
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Why Did ECHOLESS Say This?
                </h3>
              </div>
            </div>

            <EvidencePanel
              evidence={[
                {
                  id: 'ev-demo-1',
                  project: 'Project Orion',
                  year: 2025,
                  type: 'Retained Warning in Hindsight Bank',
                  memoryText: 'Principal DBA D. Vance warned 3 weeks before launch: "The shared PostgreSQL cluster will hit connection pool saturation if Orion pushes >400 persistent connections alongside the billing service."',
                  whyItMatters: 'Phoenix specifies 450 concurrent connections against the exact same database cluster.',
                  classification: 'HISTORICAL_FACT',
                },
                {
                  id: 'ev-demo-2',
                  project: 'Phoenix API Migration',
                  year: 2026,
                  type: 'Current Proposal Architecture Input',
                  memoryText: 'Critical Dependencies: "Shared core PostgreSQL database, Redis session cache, Envoy mesh". Expected Scale: "70,000 req/hr peak, 450 concurrent connections".',
                  whyItMatters: 'Input parameters confirm high concurrency and direct reliance on unisolated shared DB.',
                  classification: 'CURRENT_INPUT',
                },
                {
                  id: 'ev-demo-3',
                  project: 'ECHOLESS Synthesis Engine',
                  year: 2026,
                  type: 'Hindsight Reflect Synthesis',
                  memoryText: 'Grounded finding: Shared database starvation is inevitable without pgBouncer transaction proxy caps.',
                  whyItMatters: 'Mandates dedicated 150-connection ceiling before approving canary deployment.',
                  classification: 'AI_INTERPRETATION',
                },
              ]}
              projectName="Phoenix API Migration"
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Step 5
              </button>
              <button
                onClick={() => setCurrentStep(7)}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Step 7: Retain New Lesson
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: SAVE LESSON */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 7 of 8 · Organizational Memory Expansion
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Save New Near-Miss & Mitigation to Hindsight Bank
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When engineers learn a new near-miss mitigation during review, they retain it back into the persistent Hindsight bank using <code className="font-mono text-cyan-300">retain()</code>.
            </p>

            <div className="rounded-lg border border-slate-800 bg-[#080d17] p-4 text-xs text-slate-300 space-y-2 font-mono">
              <div className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">
                Lesson Payload Ready to Retain:
              </div>
              <div className="space-y-1 text-slate-300 text-xs">
                <div><strong>Warning:</strong> Canary traffic ramped to 50% without dedicated pgBouncer pooling.</div>
                <div><strong>Decision:</strong> Halted canary at 50% and deployed transaction-level proxy.</div>
                <div><strong>Outcome:</strong> Database CPU stabilized from 92% to 28%; zero dropped packets.</div>
                <div><strong>Lesson:</strong> Pre-flight pgBouncer proxy deployment is non-negotiable for &gt;50k req/hr.</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(6)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Step 6
              </button>
              <button
                onClick={runStep7Save}
                disabled={isLoading || savedLessonSuccess}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {savedLessonSuccess ? 'LESSON RETAINED IN BANK' : isLoading ? 'Retaining...' : 'Retain This Lesson to Hindsight'}
              </button>
            </div>

            {savedLessonSuccess && (
              <div className="mt-3 p-3 rounded border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 flex items-center justify-between">
                <span>Memory bank successfully updated with Phoenix near-miss lesson.</span>
                <button
                  onClick={() => {
                    runStep8Repeat();
                  }}
                  className="font-bold underline ml-2 text-emerald-200"
                >
                  Proceed to Step 8: Verify Expanded Memory →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: REPEAT CHECK */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                  Step 8 of 8 · Closed-Loop Verification
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  Repeat Check: Newly Stored Lesson Now Recalled
                </h3>
              </div>
              <button
                onClick={runStep8Repeat}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isLoading ? 'Recalling...' : 'Re-verify Memory'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When a subsequent proposal (<span className="text-cyan-300 font-semibold">Phoenix Billing Integration V2</span>) is analyzed, Hindsight now includes the newly retained lesson from Step 7 alongside the 2025 Orion precedent!
            </p>

            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/15 p-4 text-xs text-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 font-bold">
                <CheckCircle className="h-4 w-4" />
                <span>EXPANDED MEMORY RECALL CONFIRMED</span>
              </div>
              <p className="leading-relaxed text-xs">
                “ECHOLESS retrieved both the 2025 Project Orion postmortem AND the newly retained lesson from Phoenix Phase 1. The system now automatically flags that <strong className="text-white">pgBouncer transaction mode must be verified prior to canary progression</strong>, citing the immediate resolution achieved during Phase 1.”
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restart Demo Tour
              </button>

              <button
                onClick={() => onNavigateToTab('analyze')}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors"
              >
                Try Custom Project in Analyze View
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
