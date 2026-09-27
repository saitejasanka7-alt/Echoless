import React, { useState } from 'react';
import { HealthStatus } from '../types';
import { RefreshCw, Database, ShieldAlert, Cpu, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus | null;
  onRefreshHealth: () => void;
  onSeedBank: () => void;
  isSeeding: boolean;
  onOpenVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  health,
  onRefreshHealth,
  onSeedBank,
  isSeeding,
  onOpenVoice,
}) => {
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  const isConnected = health?.status === 'connected';

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'memory', label: 'Memory' },
    { id: 'learning', label: 'Learning' },
    { id: 'demo', label: 'Demo' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Cpu className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isConnected ? 'bg-cyan-400 opacity-75' : 'bg-slate-400 opacity-40'}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-cyan-400' : 'bg-slate-500'}`} />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold tracking-wider text-slate-100">
                  ECHOLESS
                </span>
                <span className="text-[11px] font-medium text-cyan-400/80">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Organizational Near-Miss Memory
              </p>
            </div>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Hindsight Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDetails(!showStatusDetails)}
              className="group flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-slate-700"
              title="Click to view Hindsight cluster details"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isConnected ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-500'
                }`}
              />
              <span className="font-mono text-[11px] tracking-wide text-slate-300 group-hover:text-white">
                {isConnected ? 'HINDSIGHT CONNECTED' : 'HINDSIGHT READY'}
              </span>
            </button>

            {/* Status Dropdown */}
            {showStatusDetails && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-800 bg-[#0d131f] p-4 text-xs text-slate-300 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="font-medium text-slate-100 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-cyan-400" />
                    Hindsight Memory Cluster
                  </span>
                  <button
                    onClick={onRefreshHealth}
                    className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                    title="Refresh status"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={isConnected ? 'text-emerald-400 font-mono' : 'text-slate-300 font-mono'}>
                      {isConnected ? '● Connected (Live Cloud)' : '○ Local Memory Engine'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank ID</span>
                    <span className="font-mono text-slate-300">{health?.bankId || 'echoless-org-memory'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Memories Indexed</span>
                    <span className="font-mono text-cyan-400">{health?.memoryCount || 12} records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Endpoint</span>
                    <span className="font-mono text-slate-400 truncate max-w-[150px]">{health?.baseUrl || 'https://api.hindsight...'}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                    {health?.message || 'Ready to analyze organizational proposals with long-term near-miss recall.'}
                  </p>
                  <button
                    onClick={() => {
                      onSeedBank();
                      setShowStatusDetails(false);
                    }}
                    disabled={isSeeding}
                    className="w-full flex items-center justify-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-[11px] font-medium text-slate-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSeeding ? 'animate-spin' : ''}`} />
                    {isSeeding ? 'Seeding Hindsight Memory...' : 'Re-index Synthetic Enterprise Dataset'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Advisor Button (gemini-3.8-live) */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all"
            title="Start real-time voice conversation with gemini-3.8-live"
          >
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Voice Advisor</span>
            <span className="sm:hidden">Voice</span>
          </button>

          {/* Quick Seed Action */}
          <button
            onClick={onSeedBank}
            disabled={isSeeding}
            className="hidden lg:flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-50"
            title="Index 12+ enterprise near-miss chains into memory"
          >
            <Database className="h-3 w-3 text-cyan-400" />
            <span>{isSeeding ? 'Indexing...' : 'Sync Memory'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-[#080c14] px-4 py-2 justify-between">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`text-xs font-medium px-2 py-1 ${
              activeTab === item.id ? 'text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
