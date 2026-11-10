import { UserProgress, DialogueResult, DifficultyLevel } from './types';
import { ALL_DIALOGUES } from './dialoguesData';

const STORAGE_KEY = 'habla_espanol_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  completedDialogues: {},
  draftAnswers: {},
  soundEnabled: true,
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch (e) {
    console.error('Error loading progress from localStorage:', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage:', e);
  }
}

export function recordDialogueCompletion(
  dialogueId: string,
  result: DialogueResult,
  topicId?: string,
  level?: DifficultyLevel
): UserProgress {
  const current = loadProgress();
  const existing = current.completedDialogues[dialogueId];

  // Keep the best score if already completed before
  const bestScore = existing
    ? Math.max(existing.firstAttemptScore, result.firstAttemptScore)
    : result.firstAttemptScore;

  const updated: UserProgress = {
    ...current,
    completedDialogues: {
      ...current.completedDialogues,
      [dialogueId]: {
        ...result,
        firstAttemptScore: bestScore,
      },
    },
    // Clear draft answers for this dialogue on completion
    draftAnswers: {
      ...current.draftAnswers,
      [dialogueId]: {},
    },
    lastDialogueId: dialogueId,
    ...(topicId ? { lastTopicId: topicId } : {}),
    ...(level ? { lastLevel: level } : {}),
  };

  saveProgress(updated);
  return updated;
}

export function saveDraftAnswers(
  dialogueId: string,
  answers: Record<string, string>,
  topicId?: string,
  level?: DifficultyLevel
): void {
  const current = loadProgress();
  const updated: UserProgress = {
    ...current,
    draftAnswers: {
      ...current.draftAnswers,
      [dialogueId]: answers,
    },
    lastDialogueId: dialogueId,
    ...(topicId ? { lastTopicId: topicId } : {}),
    ...(level ? { lastLevel: level } : {}),
  };
  saveProgress(updated);
}

export function getDraftAnswers(dialogueId: string): Record<string, string> {
  const current = loadProgress();
  return current.draftAnswers[dialogueId] || {};
}

export function resetAllProgress(): UserProgress {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting progress:', e);
  }
  return DEFAULT_PROGRESS;
}

export function getOverallProgressStats(progress: UserProgress) {
  const total = ALL_DIALOGUES.length;
  const completed = Object.keys(progress.completedDialogues).filter(
    (id) => progress.completedDialogues[id]?.completed
  ).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export function getTopicStats(topicId: string, progress: UserProgress) {
  const topicDialogues = ALL_DIALOGUES.filter((d) => d.topicId === topicId);
  const total = topicDialogues.length;
  const completed = topicDialogues.filter(
    (d) => progress.completedDialogues[d.id]?.completed
  ).length;
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    isComplete: completed === total && total > 0,
  };
}
