import { ChatMessage, InterviewConfig, InterviewEvaluation } from '../types/interview';

export interface StartInterviewResponse {
  message: string;
  questionNumber: number;
  isFollowUp: boolean;
  isDemoMode?: boolean;
}

export interface TurnResponse {
  message: string;
  isInterviewComplete: boolean;
  nextQuestionNumber: number;
  isFollowUp: boolean;
  isDemoMode?: boolean;
}

export async function checkServerStatus(): Promise<{ hasKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch (err) {
    console.warn('Status check failed, assuming fallback:', err);
    return { hasKey: false, model: 'demo-mode' };
  }
}

export async function apiStartInterview(config: InterviewConfig): Promise<StartInterviewResponse> {
  const res = await fetch('/api/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to start interview');
  }

  return await res.json();
}

export async function apiSubmitTurn(
  config: InterviewConfig,
  messages: ChatMessage[],
  candidateAnswer: string,
  currentQuestionNumber: number,
  isFollowUp: boolean,
  timeRemainingSec: number
): Promise<TurnResponse> {
  const res = await fetch('/api/interview/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config,
      messages,
      candidateAnswer,
      currentQuestionNumber,
      isFollowUp,
      timeRemainingSec,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to process answer');
  }

  return await res.json();
}

export async function apiRequestHint(config: InterviewConfig, currentQuestion: string): Promise<{ hint: string }> {
  const res = await fetch('/api/interview/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, currentQuestion }),
  });

  if (!res.ok) {
    throw new Error('Failed to request hint');
  }

  return await res.json();
}

export async function apiGenerateTTS(text: string, voiceName: string = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
  const res = await fetch('/api/interview/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName }),
  });

  if (!res.ok) {
    throw new Error('TTS generation failed');
  }

  return await res.json();
}


export async function apiEvaluateInterview(
  config: InterviewConfig,
  messages: ChatMessage[]
): Promise<InterviewEvaluation> {
  const res = await fetch('/api/interview/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to evaluate interview');
  }

  return await res.json();
}
