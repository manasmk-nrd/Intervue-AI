import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InterviewConfigPage } from './components/InterviewConfigPage';
import { InterviewRoom } from './components/InterviewRoom';
import { InterviewResults } from './components/InterviewResults';
import { InterviewHistoryPage } from './components/InterviewHistoryPage';
import { TranscriptModal } from './components/TranscriptModal';
import { ChatMessage, InterviewConfig, InterviewSession } from './types/interview';
import { apiEvaluateInterview, apiStartInterview, checkServerStatus } from './services/api';
import {
  getActiveSessionDraft,
  getSavedSessions,
  saveActiveSessionDraft,
  saveSession,
} from './utils/storage';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'setup' | 'room' | 'results' | 'history'>('landing');
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [configPreset, setConfigPreset] = useState<Partial<InterviewConfig> | undefined>(undefined);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<{ hasKey: boolean; model: string } | null>(null);

  // Check server status and restore any draft on mount
  useEffect(() => {
    checkServerStatus().then((status) => {
      setServerStatus(status);
    });

    const draft = getActiveSessionDraft();
    if (draft && draft.status === 'active') {
      setCurrentSession(draft);
    }
  }, []);

  // Handlers for Navigation
  const handleNavigate = (tab: 'landing' | 'dashboard' | 'setup' | 'history') => {
    setActiveTab(tab);
  };

  const handleStartConfig = (preset?: Partial<InterviewConfig>) => {
    setConfigPreset(preset);
    setActiveTab('setup');
  };

  const handleStartInterview = async (config: InterviewConfig) => {
    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const startRes = await apiStartInterview(config);

      const initialMessage: ChatMessage = {
        id: 'msg_start_' + Date.now(),
        sender: 'interviewer',
        text: startRes.message,
        timestamp: new Date().toISOString(),
        questionIndex: 1,
        isFollowUp: false,
        isGreeting: true,
      };

      const newSession: InterviewSession = {
        id: config.id,
        config,
        messages: [initialMessage],
        currentQuestionNumber: 1,
        status: 'active',
        startedAt: new Date().toISOString(),
        durationSecondsTaken: 0,
        isDemoMode: startRes.isDemoMode,
      };

      setCurrentSession(newSession);
      saveActiveSessionDraft(newSession);
      setActiveTab('room');
    } catch (err: any) {
      console.error('Failed to launch interview session:', err);
      setEvaluationError('Could not start interview: ' + (err.message || 'Please try again.'));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleConcludeInterview = async (updatedMessages: ChatMessage[], durationSeconds: number) => {
    if (!currentSession) return;

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const evaluation = await apiEvaluateInterview(currentSession.config, updatedMessages);

      const finishedSession: InterviewSession = {
        ...currentSession,
        messages: updatedMessages,
        status: 'completed',
        completedAt: new Date().toISOString(),
        durationSecondsTaken: durationSeconds,
        evaluation,
      };

      setCurrentSession(finishedSession);
      saveSession(finishedSession);
      saveActiveSessionDraft(null);
      setActiveTab('results');
    } catch (err: any) {
      console.error('Evaluation error:', err);
      setEvaluationError('Failed to generate full evaluation report. You can review your transcript.');
      setActiveTab('results');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAbortInterview = () => {
    saveActiveSessionDraft(null);
    setCurrentSession(null);
    setActiveTab('dashboard');
  };

  const handleViewPastSession = (session: InterviewSession) => {
    setCurrentSession(session);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Demo Mode Notice if API key is not present in development */}
      {serverStatus && !serverStatus.hasKey && (
        <div className="bg-indigo-950/70 border-b border-indigo-900/50 px-4 py-2 text-center text-xs text-indigo-300 flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span>
            <strong>Simulated Engine Active:</strong> Connect your Gemini API Key in AI Studio Secrets for live multi-turn model generation.
          </span>
        </div>
      )}

      {/* Error Notification Banner */}
      {evaluationError && (
        <div className="bg-red-950/80 border-b border-red-800/60 px-4 py-2.5 text-xs text-red-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{evaluationError}</span>
          </div>
          <button
            onClick={() => setEvaluationError(null)}
            className="text-red-400 hover:text-red-200 font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Evaluating Loading Overlay */}
      {isEvaluating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Analyzing Your Mock Performance</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              Cross-referencing factual accuracy, structural clarity, and problem-solving reasoning against industry standards...
            </p>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      {activeTab !== 'room' && (
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          isSessionActive={!!currentSession && currentSession.status === 'active'}
          onReturnToRoom={() => setActiveTab('room')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartConfig={handleStartConfig}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onStartConfig={handleStartConfig}
            onViewSession={handleViewPastSession}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'setup' && (
          <InterviewConfigPage
            initialConfig={configPreset}
            onStartInterview={handleStartInterview}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'room' && currentSession && (
          <InterviewRoom
            session={currentSession}
            onConcludeInterview={handleConcludeInterview}
            onAbortInterview={handleAbortInterview}
          />
        )}

        {activeTab === 'results' && currentSession && (
          <InterviewResults
            session={currentSession}
            onStartAnother={() => handleStartConfig({ subject: currentSession.config.subject, jobRole: currentSession.config.jobRole })}
            onReviewTranscript={() => setShowTranscriptModal(true)}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'history' && (
          <InterviewHistoryPage
            onOpenSessionReport={handleViewPastSession}
            onStartNewConfig={() => handleStartConfig()}
          />
        )}
      </main>

      {/* Full Transcript Review Modal */}
      {showTranscriptModal && currentSession && (
        <TranscriptModal
          session={currentSession}
          onClose={() => setShowTranscriptModal(false)}
        />
      )}
    </div>
  );
}
