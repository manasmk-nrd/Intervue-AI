import React, { useState } from 'react';
import { ArrowLeft, Play, Sparkles, HelpCircle, Check, AlertCircle } from 'lucide-react';
import {
  DifficultyLevel,
  DurationMinutes,
  ExperienceLevel,
  InterviewConfig,
  InterviewMode,
  InterviewStyle,
  InterviewType,
  QuestionCount,
} from '../types/interview';

interface InterviewConfigPageProps {
  initialConfig?: Partial<InterviewConfig>;
  onStartInterview: (config: InterviewConfig) => void;
  onBack: () => void;
}

export const InterviewConfigPage: React.FC<InterviewConfigPageProps> = ({
  initialConfig,
  onStartInterview,
  onBack,
}) => {
  const [subject, setSubject] = useState(initialConfig?.subject || '');
  const [jobRole, setJobRole] = useState(initialConfig?.jobRole || '');
  const [interviewType, setInterviewType] = useState<InterviewType>(initialConfig?.interviewType || 'technical');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialConfig?.difficulty || 'intermediate');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialConfig?.experienceLevel || 'student');
  const [questionCount, setQuestionCount] = useState<QuestionCount>(initialConfig?.questionCount || 5);
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(initialConfig?.durationMinutes || 10);
  const [style, setStyle] = useState<InterviewStyle>(initialConfig?.style || 'professional');
  const [mode, setMode] = useState<InterviewMode>(initialConfig?.mode || 'interview');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const popularSubjects = [
    'Python & Backend Architecture',
    'Data Structures & Algorithms',
    'Machine Learning & Deep Learning',
    'HR & Situational Competencies',
    'Operating Systems & Networking',
    'DBMS & SQL Optimization',
    'React & Frontend Engineering',
    'Thermodynamics & Heat Transfer',
    'Corporate Finance & Valuation',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMessage('Please enter a subject or academic topic.');
      return;
    }

    setErrorMessage(null);

    const config: InterviewConfig = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      subject: subject.trim(),
      jobRole: jobRole.trim(),
      interviewType,
      difficulty,
      experienceLevel,
      questionCount,
      durationMinutes,
      style,
      mode,
      createdAt: new Date().toISOString(),
    };

    onStartInterview(config);
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-950 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </button>

        <div className="space-y-2 mb-8">
          <div className="text-xs text-indigo-400 font-medium">Session Setup</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Configure Your Mock Interview
          </h1>
          <p className="text-sm text-neutral-400">
            Tailor the topic, target role, evaluation depth, and interviewer personality.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Subject & Role */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
            <h2 className="text-base font-semibold text-white">1. Core Topic & Role Alignment</h2>

            {/* Subject Input */}
            <div className="space-y-2">
              <label htmlFor="subject-input" className="block text-xs font-medium text-neutral-300">
                Subject or Topic <span className="text-rose-400">*</span>
              </label>
              <input
                id="subject-input"
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. Machine Learning, Distributed Systems, Organic Chemistry, Spring Boot"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Suggestions */}
              <div className="pt-2">
                <div className="text-[11px] text-neutral-400 mb-2">Quick suggestions:</div>
                <div className="flex flex-wrap gap-1.5">
                  {popularSubjects.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSubject(s)}
                      className="rounded bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-750 px-2 py-1 text-[11px] text-neutral-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Input */}
            <div className="space-y-2">
              <label htmlFor="role-input" className="block text-xs font-medium text-neutral-300">
                Target Job Role <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                id="role-input"
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Junior AI Engineer, Graduate Software Trainee, Quantitative Analyst"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-neutral-400">
                Helps the interviewer frame realistic real-world job scenarios and responsibilities.
              </p>
            </div>
          </div>

          {/* Card 2: Interview Classification */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
            <h2 className="text-base font-semibold text-white">2. Interview Classification</h2>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">Interview Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['technical', 'hr', 'behavioral', 'academic', 'custom'] as InterviewType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInterviewType(t)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                      interviewType === t
                        ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300 shadow-sm'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                        difficulty === d
                          ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'fresher', 'experienced'] as ExperienceLevel[]).map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperienceLevel(exp)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                        experienceLevel === exp
                          ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Session Constraints & Style */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-5">
            <h2 className="text-base font-semibold text-white">3. Constraints, Style & Mode</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Question Count */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300">Primary Questions</label>
                <div className="grid grid-cols-2 gap-2">
                  {([5, 10] as QuestionCount[]).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold font-mono transition-all ${
                        questionCount === count
                          ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300">Session Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {([5, 10, 15] as DurationMinutes[]).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold font-mono transition-all ${
                        durationMinutes === mins
                          ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      {mins} Mins
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interviewer Style */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-neutral-300">Interviewer Demeanor</label>
              <div className="grid grid-cols-3 gap-2">
                {(['friendly', 'professional', 'challenging'] as InterviewStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStyle(st)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                      style === st
                        ? 'border-indigo-500 bg-indigo-600/15 text-indigo-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode: Interview vs Practice */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-neutral-300">Interview Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('interview')}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    mode === 'interview'
                      ? 'border-indigo-500 bg-indigo-600/10 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Interview Mode</span>
                    {mode === 'interview' && <Check className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                    Realistic simulation. No hints, no immediate feedback. Evaluation is generated only after concluding.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('practice')}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    mode === 'practice'
                      ? 'border-indigo-500 bg-indigo-600/10 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Practice Mode</span>
                    {mode === 'practice' && <Check className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                    Interactive learning. Request hints, see coaching guidance, and refine your answers as you go.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Launch Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg bg-neutral-900 border border-neutral-800 px-5 py-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-850 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Enter Interview Room</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
