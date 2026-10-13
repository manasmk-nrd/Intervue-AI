import React from 'react';
import { PlusCircle, Play, History, ArrowRight, Award, Clock, BookOpen, AlertCircle, ChevronRight, BarChart3, CheckCircle } from 'lucide-react';
import { InterviewConfig, InterviewSession } from '../types/interview';
import { getPerformanceStats, getSavedSessions } from '../utils/storage';

interface DashboardProps {
  onStartConfig: (preset?: Partial<InterviewConfig>) => void;
  onViewSession: (session: InterviewSession) => void;
  onNavigateToHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartConfig,
  onViewSession,
  onNavigateToHistory,
}) => {
  const stats = getPerformanceStats();
  const recentSessions = getSavedSessions().slice(0, 4);

  const quickTracks: Array<{
    title: string;
    role: string;
    type: 'technical' | 'hr' | 'behavioral' | 'academic' | 'custom';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    questions: 5 | 10;
    time: 5 | 10 | 15;
  }> = [
    {
      title: 'Python Core & Concurrency',
      role: 'Backend Engineer',
      type: 'technical',
      difficulty: 'intermediate',
      questions: 5,
      time: 10,
    },
    {
      title: 'DSA & Complexity Analysis',
      role: 'Software Engineer Intern',
      type: 'technical',
      difficulty: 'intermediate',
      questions: 5,
      time: 10,
    },
    {
      title: 'Machine Learning & PyTorch',
      role: 'Junior ML Engineer',
      type: 'technical',
      difficulty: 'intermediate',
      questions: 5,
      time: 10,
    },
    {
      title: 'HR & Behavioral (STAR Method)',
      role: 'Fresher / Placement',
      type: 'behavioral',
      difficulty: 'beginner',
      questions: 5,
      time: 5,
    },
    {
      title: 'System Design Fundamentals',
      role: 'Full Stack Developer',
      type: 'technical',
      difficulty: 'advanced',
      questions: 5,
      time: 15,
    },
    {
      title: 'React & Modern Frontend',
      role: 'Frontend Engineer',
      type: 'technical',
      difficulty: 'intermediate',
      questions: 5,
      time: 10,
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-neutral-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="text-xs text-indigo-400 font-medium">Candidate Dashboard</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back to Intervue AI
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl">
              Sharpen your responses, discover your weak areas with objective metrics, and prepare for high-stakes interviews.
            </p>
          </div>

          <button
            onClick={() => onStartConfig()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:bg-indigo-700 transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start New Interview</span>
          </button>
        </div>

        {/* Real Performance Metrics Strip (No fabricated data) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <div className="text-xs text-neutral-400 font-medium">Completed Sessions</div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.totalInterviews}
            </div>
            <p className="text-xs text-neutral-400">Total recorded mock evaluations</p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <div className="text-xs text-neutral-400 font-medium">Average Performance Score</div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.averageScore !== null ? `${stats.averageScore}/100` : '—'}
            </div>
            <p className="text-xs text-neutral-400">
              {stats.averageScore !== null ? 'Calculated from completed sessions' : 'Complete a session to establish score baseline'}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
            <div className="text-xs text-neutral-400 font-medium">Personal Best</div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.bestScore !== null ? `${stats.bestScore}/100` : '—'}
            </div>
            <p className="text-xs text-neutral-400">
              {stats.bestScore !== null ? 'Highest score achieved so far' : 'Awaiting first completed report'}
            </p>
          </div>
        </div>

        {/* Quick Start Tracks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Quick Start Tracks</h2>
              <p className="text-xs text-neutral-400">Launch standard calibrated interview tracks in one click.</p>
            </div>
            <button
              onClick={() => onStartConfig()}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Custom Configuration</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickTracks.map((trk, i) => (
              <div
                key={i}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="capitalize">{trk.type}</span>
                    <span className="capitalize font-mono">{trk.difficulty}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {trk.title}
                  </h3>
                  <div className="text-xs text-neutral-400">Role: {trk.role}</div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-neutral-850 mt-4">
                  <span className="text-xs font-mono text-neutral-400">
                    {trk.questions} Qs · {trk.time}m
                  </span>
                  <button
                    onClick={() =>
                      onStartConfig({
                        subject: trk.title,
                        jobRole: trk.role,
                        interviewType: trk.type,
                        difficulty: trk.difficulty,
                        questionCount: trk.questions,
                        durationMinutes: trk.time,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Launch</span>
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Interview Sessions & Recommended Practice */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Sessions */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Mock Sessions</h2>
                <p className="text-xs text-neutral-400">Completed and evaluated interview transcripts.</p>
              </div>
              {recentSessions.length > 0 && (
                <button
                  onClick={onNavigateToHistory}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  <span>View All History</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {recentSessions.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 border-dashed bg-neutral-900/30 p-8 text-center space-y-3">
                <div className="mx-auto h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">No interview history yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Take your first mock interview to receive real scores, strengths analysis, and personalized study roadmaps.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onStartConfig()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    <span>Start First Interview</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const dateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const score = session.evaluation?.overallScore;

                  return (
                    <div
                      key={session.id}
                      onClick={() => onViewSession(session)}
                      className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span className="capitalize">{session.config.interviewType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{session.config.difficulty}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{dateStr}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {session.config.subject}
                        </h4>
                        {session.config.jobRole && (
                          <div className="text-xs text-neutral-400">Role: {session.config.jobRole}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        {score !== undefined ? (
                          <div className="text-right">
                            <div className="text-xs text-neutral-400">Overall Score</div>
                            <div className="text-base font-bold font-mono tabular-nums text-indigo-400">
                              {score}/100
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-400 font-mono">In Progress / Partial</div>
                        )}
                        <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommendations Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Study Recommendations</h2>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
              {recentSessions.length > 0 && recentSessions[0].evaluation?.recommendedTopics ? (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400">
                    Derived from your latest mock session on{' '}
                    <span className="text-white font-medium">{recentSessions[0].config.subject}</span>:
                  </div>
                  {recentSessions[0].evaluation.recommendedTopics.slice(0, 3).map((rec, i) => (
                    <div key={i} className="border-b border-neutral-800 last:border-0 pb-3 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{rec.topic}</span>
                        <span className="text-[11px] font-mono text-indigo-400 uppercase">{rec.priority}</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-normal">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400">General Candidate Guidance:</div>
                  <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside">
                    <li>Practice framing answers using structured frameworks (STAR for behavioral, Definition-Architecture-Tradeoffs for technical).</li>
                    <li>Avoid premature optimization; state assumptions explicitly.</li>
                    <li>Quantify scale, latency, and reliability requirements upfront.</li>
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800">
                <button
                  onClick={() => onStartConfig()}
                  className="w-full text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-1"
                >
                  Configure Tailored Drill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
