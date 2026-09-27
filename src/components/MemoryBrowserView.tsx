import React, { useState } from 'react';
import { HistoricalMemory, MemoryCategory } from '../types';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Play,
  Zap,
  Tag,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';

interface MemoryBrowserViewProps {
  memories: HistoricalMemory[];
  onRetainMemory: (content: string, context?: string, tags?: string[]) => Promise<boolean>;
  onRefresh: () => void;
  bankId: string;
}

export const MemoryBrowserView: React.FC<MemoryBrowserViewProps> = ({
  memories,
  onRetainMemory,
  onRefresh,
  bankId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isRetaining, setIsRetaining] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // Extract unique projects
  const uniqueProjects = Array.from(new Set(memories.map((m) => m.project))).sort();

  // Filter memories
  const filteredMemories = memories.filter((mem) => {
    const matchesSearch =
      searchQuery === '' ||
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      mem.category === selectedCategory ||
      (selectedCategory === 'near-miss' && (mem.category === 'outcome' || mem.tags.includes('near-miss')));

    const matchesProject =
      selectedProject === 'all' || mem.project === selectedProject;

    return matchesSearch && matchesCategory && matchesProject;
  });

  const handleRetainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsRetaining(true);
    setModalMessage(null);

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      const success = await onRetainMemory(newContent, newContext, tagsArray);
      if (success) {
        setModalMessage('Memory retained into Hindsight bank successfully.');
        setTimeout(() => {
          setShowAddModal(false);
          setNewContent('');
          setNewContext('');
          setNewTags('');
          setModalMessage(null);
          onRefresh();
        }, 1200);
      } else {
        setModalMessage('Failed to retain memory.');
      }
    } catch (err: unknown) {
      setModalMessage(err instanceof Error ? err.message : 'Error retaining memory.');
    } finally {
      setIsRetaining(false);
    }
  };

  const getCategoryIcon = (category: MemoryCategory) => {
    switch (category) {
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case 'outcome':
        return <Activity className="h-3.5 w-3.5 text-rose-400" />;
      case 'lesson':
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case 'decision':
        return <Play className="h-3.5 w-3.5 text-purple-400" />;
      case 'action':
        return <Zap className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                Institutional Memory Catalog
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-slate-400">
                Bank: {bankId}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
              Organizational Experiences & Near-Misses
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Inspect all documented warnings, management decisions, production outages, and postmortems retained in the organizational memory bank.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onRefresh}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white transition-colors"
              title="Refresh memories"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Retain Experience
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search warnings, systems, lessons..."
              className="w-full rounded-md border border-slate-800 bg-[#080d17] pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Memory Categories</option>
              <option value="warning">Warnings Only</option>
              <option value="decision">Decisions Only</option>
              <option value="outcome">Outcomes & Incidents</option>
              <option value="lesson">Postmortem Lessons</option>
              <option value="near-miss">Near-Misses</option>
            </select>
          </div>

          {/* Project filter */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Projects ({uniqueProjects.length})</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memory Cards Count / Empty State */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
        <span>
          Showing {filteredMemories.length} of {memories.length} experiences
        </span>
        {(searchQuery || selectedCategory !== 'all' || selectedProject !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedProject('all');
            }}
            className="text-cyan-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredMemories.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0a0f19] p-12 text-center shadow-lg">
          <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-semibold text-slate-300">
            No memories match the current filter.
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0a0f19] p-4.5 hover:border-slate-700 transition-colors shadow-md"
            >
              <div>
                {/* Zero-Pill Quiet Inline Metadata */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">{mem.project}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">{mem.year}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono text-slate-500 text-[11px]">{mem.date}</span>
                  </div>

                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-cyan-400/90">
                    {getCategoryIcon(mem.category)}
                    {mem.category}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 mb-2 leading-snug">
                  {mem.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-[#080d17] p-2.5 rounded border border-slate-800/80 mb-3">
                  {mem.text}
                </p>

                {mem.impact && (
                  <div className="text-xs text-slate-400 mb-2">
                    <span className="font-mono text-[10px] uppercase text-slate-500 block mb-0.5">
                      Operational Consequence / Rule:
                    </span>
                    <p className="text-slate-300">{mem.impact}</p>
                  </div>
                )}
              </div>

              {/* Tags & Author */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="h-3 w-3 text-slate-600" />
                  {mem.tags.map((tag) => (
                    <span key={tag} className="text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                {mem.author && (
                  <span className="text-slate-500">By: {mem.author}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Retain Experience Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0d1424] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                Retain Experience into Hindsight
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalMessage && (
              <div className="mb-4 rounded border border-cyan-500/40 bg-cyan-950/40 p-2.5 text-xs text-cyan-300 font-mono">
                {modalMessage}
              </div>
            )}

            <form onSubmit={handleRetainSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Memory Experience Content <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Record the warning, decision, or near-miss experience in detail..."
                  className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Context / Project Description
                </label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="e.g. Migration of billing database tier under peak load"
                  className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="database, canary, near-miss, postmortem"
                  className="w-full rounded-md border border-slate-800 bg-[#080d17] px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRetaining}
                  className="rounded-md bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md disabled:opacity-50"
                >
                  {isRetaining ? 'Retaining...' : 'Retain to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
