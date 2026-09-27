export type MemoryCategory = 
  | 'warning' 
  | 'decision' 
  | 'action' 
  | 'outcome' 
  | 'lesson' 
  | 'mitigation';

export interface ProjectInput {
  name: string;
  description: string;
  technology: string;
  expectedScale: string;
  criticalDependencies: string;
  rolloutPlan: string;
  knownConcerns?: string;
}

export interface HistoricalMemory {
  id: string;
  project: string;
  year: number;
  date: string;
  category: MemoryCategory;
  title: string;
  text: string;
  impact?: string;
  tags: string[];
  relatedIds?: string[];
  author?: string;
}

export interface MemoryChain {
  id: string;
  project: string;
  year: number;
  similarityScore: number;
  matchReason: string;
  warning: {
    text: string;
    date: string;
    raisedBy?: string;
  };
  decision: {
    text: string;
    rationale?: string;
  };
  action: {
    text: string;
  };
  outcome: {
    text: string;
    severity: 'critical' | 'high' | 'medium' | 'near-miss';
    incidentReportUrl?: string;
  };
  lesson: {
    text: string;
    postmortemDate?: string;
  };
  futureRisk: {
    text: string;
    recommendation: string;
  };
}

export interface TimelineItem {
  id: string;
  year: number;
  date: string;
  project: string;
  type: MemoryCategory | 'near-miss' | 'risk-echo';
  title: string;
  description: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface WhatChangedItem {
  aspect: string;
  past: string;
  today: string;
  status: 'still_similar' | 'changed' | 'improved' | 'diverged';
  analysis: string;
}

export type EvidenceClassification = 'HISTORICAL_FACT' | 'CURRENT_INPUT' | 'AI_INTERPRETATION';

export interface EvidenceItem {
  id: string;
  project: string;
  year: number;
  type: string;
  memoryText: string;
  whyItMatters: string;
  classification: EvidenceClassification;
}

export interface RiskEcho {
  detected: boolean;
  matchCount: number;
  primaryProjectMatch: string;
  summary: string;
  chains: MemoryChain[];
  timeline: TimelineItem[];
}

export interface AnalysisResult {
  id: string;
  projectName: string;
  memoryMode: 'on' | 'off';
  timestamp: string;
  riskEcho: RiskEcho;
  whatChanged: WhatChangedItem[];
  evidence: EvidenceItem[];
  aiReasoningSummary: string;
  recommendations: string[];
  memorySource: 'hindsight' | 'hindsight_synthesized' | 'baseline_no_memory';
  executionTimeMs: number;
}

export interface HealthStatus {
  status: 'connected' | 'unavailable' | 'configured';
  configured: boolean;
  baseUrl: string;
  bankId: string;
  message: string;
  memoryCount: number;
  version?: string;
}

export interface LessonInput {
  project: string;
  warning: string;
  decision: string;
  action: string;
  outcome: string;
  lesson: string;
  mitigation: string;
  tags?: string[];
}
