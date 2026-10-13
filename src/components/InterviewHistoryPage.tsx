import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  PlusCircle,
  Award,
  Clock,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { InterviewSession } from '../types/interview';
import { clearAllSessions, deleteSession, getSavedSessions } from '../utils/storage';

interface InterviewHistoryPageProps {
  onOpenSessionReport: (session: InterviewSession) => void;
  onStartNewConfig: () => void;
}

export const InterviewHistoryPage: React.FC<InterviewHistoryPageProps> = ({
  onOpenSessionReport,
  onStartNewConfig,
}) => {
  const [sessions, setSessions] = useState<InterviewSession[]>(getSavedSessions());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(getSavedSessions());
  };

  const handleClearAll = () => {
    clearAllSessions();
    setSessions([]);
    setShowClearConfirm(false);
  };

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.config.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.config.jobRole && s.config.jobRole.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff = filterDifficulty === 'all' || s.config.difficulty === filterDifficulty;

    return matchesSearch && matchesDiff;
  });

  return (
    <div className="py-8 sm:py-12 bg-neutral-950 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="text-xs text-indigo-400 font-medium">Session Archives</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Interview History & Reports
            </h1>
            <p className="text-xs text-neutral-400">
              Review completed mock interviews, performance scorecards, and AI evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {sessions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            )}
            <button
              onClick={onStartNewConfig}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by subject or role..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl shrink-0 self-start sm:self-auto">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterDifficulty(lvl)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  filterDifficulty === lvl
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 border-dashed bg-neutral-900/30 p-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
              <History className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No interview records found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {sessions.length === 0
                ? 'You have not conducted any mock interviews yet. Launch your first session to establish your performance record.'
                : 'No sessions matched your filter criteria. Try resetting the search or difficulty filter.'}
            </p>
            <div className="pt-3">
              <button
                onClick={onStartNewConfig}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <span>Launch Mock Interview</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const dateStr = new Date(s.startedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const score = s.evaluation?.overallScore;
              const grade = s.evaluation?.scoreGrade;

              return (
                <div
                  key={s.id}
                  onClick={() => onOpenSessionReport(s)}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 hover:border-neutral-700 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="capitalize text-neutral-300 font-medium">
                        {s.config.interviewType}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{s.config.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{s.config.mode} mode</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{dateStr}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {s.config.subject}
                    </h3>

                    {s.config.jobRole && (
                      <div className="text-xs text-neutral-400">Target Role: {s.config.jobRole}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    {score !== undefined ? (
                      <div className="text-right">
                        <div className="text-xs text-neutral-400">Score & Grade</div>
                        <div className="text-base font-bold font-mono tabular-nums text-indigo-400">
                          {score}/100{' '}
                          {grade && (
                            <span className="text-xs font-sans text-neutral-300 font-normal">
                              ({grade})
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 font-mono">Partial Session</div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(s.id, e)}
                        title="Delete session record"
                        className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Clear All History?</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This will permanently remove all previous interview transcripts and evaluation scorecards from this browser. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-750"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
