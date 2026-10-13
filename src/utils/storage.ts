import { InterviewSession } from '../types/interview';

const STORAGE_KEY = 'intervue_ai_sessions_v1';
const DRAFT_KEY = 'intervue_ai_draft_session_v1';

export function getSavedSessions(): InterviewSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }
    return [];
  } catch (err) {
    console.error('Failed to load sessions from localStorage:', err);
    return [];
  }
}

export function saveSession(session: InterviewSession): void {
  try {
    const current = getSavedSessions();
    const existingIndex = current.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      current[existingIndex] = session;
    } else {
      current.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
}

export function getSessionById(id: string): InterviewSession | undefined {
  const sessions = getSavedSessions();
  return sessions.find((s) => s.id === id);
}

export function deleteSession(id: string): void {
  try {
    const current = getSavedSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to delete session:', err);
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error('Failed to clear sessions:', err);
  }
}

export function getPerformanceStats(): {
  totalInterviews: number;
  averageScore: number | null;
  bestScore: number | null;
  recentTopics: string[];
} {
  const sessions = getSavedSessions().filter((s) => s.status === 'completed' && s.evaluation);
  if (sessions.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: null,
      bestScore: null,
      recentTopics: [],
    };
  }

  const scores = sessions.map((s) => s.evaluation!.overallScore);
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round(sum / scores.length);
  const max = Math.max(...scores);
  const recentTopics = Array.from(new Set(sessions.map((s) => s.config.subject))).slice(0, 5);

  return {
    totalInterviews: sessions.length,
    averageScore: avg,
    bestScore: max,
    recentTopics,
  };
}

export function saveActiveSessionDraft(session: InterviewSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to save draft session:', err);
  }
}

export function getActiveSessionDraft(): InterviewSession | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}
