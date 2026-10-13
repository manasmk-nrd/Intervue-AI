import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Cpu, Target, Award, Sparkles, BookOpen, Clock, Users } from 'lucide-react';
import { InterviewConfig } from '../types/interview';

interface LandingPageProps {
  onStartConfig: (preset?: Partial<InterviewConfig>) => void;
  onNavigateToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartConfig,
  onNavigateToDashboard,
}) => {
  const exampleCategories = [
    {
      subject: 'Data Structures & Algorithms',
      role: 'Software Engineer',
      type: 'technical' as const,
      difficulty: 'intermediate' as const,
      description: 'Dynamic programming, trees, graph traversals, complexity trade-offs.',
    },
    {
      subject: 'Machine Learning & PyTorch',
      role: 'Junior AI Engineer',
      type: 'technical' as const,
      difficulty: 'intermediate' as const,
      description: 'Backpropagation, transformer architectures, evaluation metrics, overfitting.',
    },
    {
      subject: 'HR & Behavioral Competencies',
      role: 'Product / Tech Intern',
      type: 'behavioral' as const,
      difficulty: 'beginner' as const,
      description: 'Conflict resolution, leadership, failure management, STAR framework.',
    },
    {
      subject: 'System Design & Scalability',
      role: 'Backend Developer',
      type: 'technical' as const,
      difficulty: 'advanced' as const,
      description: 'Sharding, caching, message queues, rate limiting, consistency models.',
    },
    {
      subject: 'Electrical Engineering & Circuits',
      role: 'Hardware / Embedded Engineer',
      type: 'academic' as const,
      difficulty: 'intermediate' as const,
      description: 'Semiconductor physics, Ohm/Kirchhoff laws, microcontrollers, signal noise.',
    },
    {
      subject: 'Financial Modeling & Valuation',
      role: 'Investment Analyst',
      type: 'technical' as const,
      difficulty: 'intermediate' as const,
      description: 'Discounted cash flows, financial statements, multiples, sensitivity analysis.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-800/80 bg-neutral-950 py-16 sm:py-24">
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                <span>Adaptive AI Mock Interviews</span>
                <span aria-hidden="true">·</span>
                <span>Placement & Career Readiness</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Simulate realistic interviews for <span className="text-indigo-400">any subject</span> and role.
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed">
                Intervue AI acts as your senior technical or behavioral interviewer. It asks one question at a time, listens to your answers, probes deeper with contextual follow-ups, and produces evidence-backed evaluation reports.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartConfig()}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  <span>Start Mock Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onNavigateToDashboard}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 border border-neutral-800 px-5 py-3.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-850 hover:text-white transition-colors whitespace-nowrap"
                >
                  <span>Go to Dashboard</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 border-t border-neutral-900 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Real-time follow-up logic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Zero fabricated answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Free-text custom topics</span>
                </div>
              </div>
            </div>

            {/* Visual Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2 shadow-2xl overflow-hidden">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 relative">
                  <img
                    src="/src/assets/images/interview_room_bg_1791880648583.jpg"
                    alt="Intervue AI mock interview room"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback container if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('bg-gradient-to-br', 'from-neutral-900', 'to-indigo-950/40');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-neutral-200">
                    <span className="font-medium">Active AI Evaluation Session</span>
                    <span className="font-mono tabular-nums text-indigo-300">00:09:42 / 10:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism & Pillars */}
      <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built like a genuine hiring panel, not a casual chat.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400">
              Unlike generic chatbots that give away solutions or wander off topic, Intervue AI rigorously evaluates you against strict professional criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">One Question at a Time</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                The interviewer asks one primary question, lets you structure your complete answer, and probes with relevant follow-ups before advancing.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Adaptive Difficulty Engine</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Calibrates to your demonstrated competence. If your answer reveals strong depth, it tests higher-order architectural tradeoffs.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Evidence-Based Evaluation</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Provides a detailed scorecard: factual accuracy, reasoning, problem solving, exemplary model answers, and a 3-step study roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Topics Grid */}
      <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs text-indigo-400 font-medium">Any Subject · Any Role</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Explore Popular Mock Tracks
              </h2>
            </div>
            <button
              onClick={() => onStartConfig()}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Custom topic configuration</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleCategories.map((item, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="capitalize">{item.type}</span>
                    <span className="capitalize font-mono">{item.difficulty}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {item.subject}
                  </h3>
                  <div className="text-xs text-neutral-300 font-medium">
                    Target Role: {item.role}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() =>
                      onStartConfig({
                        subject: item.subject,
                        jobRole: item.role,
                        interviewType: item.type,
                        difficulty: item.difficulty,
                      })
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-800 hover:bg-indigo-600 px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>Launch Track</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How Intervue AI Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400">
              Three seamless steps from configuration to actionable career improvement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-sm font-mono text-indigo-400 font-bold">01. Setup Session</div>
              <h3 className="text-lg font-semibold text-white">Define Your Target Track</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Provide your subject, optional job role, experience level, and desired style. Choose between timed Interview Mode or guided Practice Mode.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-mono text-indigo-400 font-bold">02. Interview Live</div>
              <h3 className="text-lg font-semibold text-white">Answer Adaptive Questions</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Type or speak your answers into the interview room. The AI tracks primary question count, initiates incisive follow-ups, and stays on topic.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-mono text-indigo-400 font-bold">03. Study Results</div>
              <h3 className="text-lg font-semibold text-white">Review Detailed Feedback</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Get an objective score out of 100, read question-by-question model answers, and follow your prioritized revision roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 sm:py-20 bg-neutral-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to ace your upcoming interview?
          </h2>
          <p className="text-neutral-300 max-w-xl mx-auto text-sm sm:text-base">
            No signup required to start practicing immediately. Pick any subject, customize your settings, and begin your session in seconds.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onStartConfig()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
            >
              <span>Configure Your First Interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
