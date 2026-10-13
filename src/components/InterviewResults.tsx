import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react';
import { InterviewConfig, InterviewEvaluation, InterviewSession } from '../types/interview';

interface InterviewResultsProps {
  session: InterviewSession;
  onStartAnother: () => void;
  onReviewTranscript: () => void;
  onBackToDashboard: () => void;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({
  session,
  onStartAnother,
  onReviewTranscript,
  onBackToDashboard,
}) => {
  const evaluation = session.evaluation;
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0); // First question expanded by default

  if (!evaluation) {
    return (
      <div className="py-16 text-center text-neutral-400">
        Evaluation is currently being processed...
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'Strong Hire':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'Hire':
        return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
      case 'Developing':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      default:
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    }
  };

  const handleCopySummary = () => {
    const text = `Intervue AI - Performance Evaluation
Subject: ${session.config.subject}
Role: ${session.config.jobRole || 'General'}
Overall Score: ${evaluation.overallScore}/100 (${evaluation.scoreGrade})
Technical Knowledge: ${evaluation.breakdown.technicalKnowledge.score}/100
Factual Accuracy: ${evaluation.breakdown.factualAccuracy.score}/100
Reasoning: ${evaluation.breakdown.reasoningAndProblemSolving.score}/100
Clarity: ${evaluation.breakdown.clarityAndStructure.score}/100

Key Strengths:
${evaluation.strengths.map((s) => '- ' + s).join('\n')}

Areas for Improvement:
${evaluation.areasForImprovement.map((a) => '- ' + a).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-950 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation & Actions Top Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="capitalize">{session.config.interviewType} Interview</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{session.config.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>{new Date(session.startedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Evaluation Report: {session.config.subject}
            </h1>
            {session.config.jobRole && (
              <div className="text-xs text-neutral-400">Target Role: {session.config.jobRole}</div>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-850 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={onStartAnother}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Practice Again</span>
            </button>
          </div>
        </div>

        {/* Reliability Alert if user answered few questions */}
        {evaluation.evaluationReliability === 'limited_data' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              This session was concluded with limited responses. Scores reflect early baseline indicators rather than a comprehensive full round.
            </span>
          </div>
        )}

        {/* Hero Scorecard Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-neutral-800">
            <div className="text-xs font-medium text-neutral-400 mb-2">Overall Candidate Score</div>
            <div className="text-5xl sm:text-6xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {evaluation.overallScore}
              <span className="text-xl text-neutral-400 font-sans font-normal">/100</span>
            </div>
            <div className="mt-4">
              <span className={`inline-block rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${getGradeBadge(evaluation.scoreGrade)}`}>
                {evaluation.scoreGrade}
              </span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Dimension Rubric Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Technical Knowledge */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">Subject Knowledge</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-400">
                    {evaluation.breakdown.technicalKnowledge.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {evaluation.breakdown.technicalKnowledge.comment}
                </p>
              </div>

              {/* Factual Accuracy */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">Factual Accuracy</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-400">
                    {evaluation.breakdown.factualAccuracy.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {evaluation.breakdown.factualAccuracy.comment}
                </p>
              </div>

              {/* Reasoning */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">Reasoning & Logic</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-400">
                    {evaluation.breakdown.reasoningAndProblemSolving.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {evaluation.breakdown.reasoningAndProblemSolving.comment}
                </p>
              </div>

              {/* Clarity */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">Clarity & Structure</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-400">
                    {evaluation.breakdown.clarityAndStructure.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {evaluation.breakdown.clarityAndStructure.comment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-2">
          <h3 className="text-sm font-bold text-white tracking-tight">Interviewer Assessment Summary</h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {evaluation.summary}
          </p>
        </div>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Demonstrated Strengths</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">·</span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Priority Areas for Growth</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              {evaluation.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">·</span>
                  <span className="leading-relaxed">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Deep Dive */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Question-by-Question Audit & Model Answers
            </h2>
            <span className="text-xs text-neutral-400">
              {evaluation.questionEvaluations.length} responses evaluated
            </span>
          </div>

          <div className="space-y-3">
            {evaluation.questionEvaluations.map((qEval, idx) => {
              const isExpanded = expandedQuestion === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden transition-all"
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left hover:bg-neutral-900 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="font-mono font-semibold text-white">Q{qEval.questionNumber}</span>
                        {qEval.isFollowUp && (
                          <span className="text-indigo-400 font-medium">(Follow-up)</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-neutral-300">{qEval.score}/100</span>
                      </div>
                      <div className="text-sm font-semibold text-white leading-snug">
                        {qEval.question}
                      </div>
                    </div>

                    <div className="shrink-0 pt-1 text-neutral-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-neutral-800/80 bg-neutral-950/60 space-y-5 text-xs">
                      {/* Candidate Response */}
                      <div className="space-y-1.5">
                        <div className="text-neutral-400 font-medium">Your Submitted Response:</div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3.5 text-neutral-200 leading-relaxed italic">
                          "{qEval.candidateAnswer}"
                        </div>
                      </div>

                      {/* Critique & Factual Accuracy */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-neutral-400 font-medium">Factual Accuracy & Soundness:</div>
                          <p className="text-neutral-300 leading-relaxed">{qEval.factualCorrectness}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="text-neutral-400 font-medium">Interviewer Feedback:</div>
                          <p className="text-neutral-300 leading-relaxed">{qEval.feedback}</p>
                        </div>
                      </div>

                      {/* Exemplary Model Answer */}
                      <div className="space-y-1.5 rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-4">
                        <div className="text-indigo-300 font-semibold flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Exemplary Model Answer Structure:</span>
                        </div>
                        <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                          {qEval.modelAnswer}
                        </p>
                      </div>

                      {/* Key Takeaway */}
                      <div className="flex items-start gap-2 pt-1 text-neutral-400">
                        <Target className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-neutral-300">Key Takeaway:</strong> {qEval.keyTakeaway}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Revision Topics & 3-Step Action Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Study Topics */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Recommended Revision Topics</span>
            </h3>

            <div className="space-y-3">
              {evaluation.recommendedTopics.map((topic, idx) => (
                <div key={idx} className="border-b border-neutral-800 last:border-0 pb-3 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{topic.topic}</span>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                      {topic.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-normal">{topic.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span>Personalized Preparation Plan</span>
            </h3>

            <div className="space-y-3">
              {evaluation.preparationPlan.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {step.step}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{step.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400">({step.timeframe})</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-normal">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation Strip */}
        <div className="pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onReviewTranscript}
              className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Review Full Transcript
            </button>
            <button
              onClick={onStartAnother}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <span>Start New Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
