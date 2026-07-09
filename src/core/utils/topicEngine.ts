/**
 * topicEngine.ts
 * Topic Practice Engine — supports instructor-led training (ILT).
 *
 * A Topic is a pure practice unit: no videos, no PDFs, no notes.
 * The instructor teaches live. HackerPlus provides labs, quizzes, and
 * challenges for structured practice and assessment.
 *
 * Architecture:
 *   SessionEngine → TopicEngine
 *                       │
 *                       ├── data/topics.json     (track + topic catalog)
 *                       ├── data/labs.json        (lab hydration)
 *                       ├── data/challenges.json  (challenge hydration)
 *                       ├── HP-027 lessonPracticeMappings (quiz bank)
 *                       └── localStorage: hp_topic_progress (isolated key)
 *
 * Unlock rule:   Topic N is locked until Topic N-1 in the same track is complete.
 *                The first topic of every track is always unlocked.
 *                Tracks are independent of each other.
 *
 * Completion:    A topic is complete when all items in requiredItems[] are fulfilled.
 *                Topics with requiredItems:[] are completable via "Mark Complete".
 */
import topicsConfig from '../../../data/topics.json';
import labsConfig from '../../../data/labs.json';
import challengesConfig from '../../../data/challenges.json';
import { lessonPracticeMappings } from '../../data/lessonPracticeMappings';
import { loadProgress, updateXp, saveProgress } from './progressEngine';
import type { QuizQuestion } from '../../data/lessonPracticeMappings';
import type { PracticeLabRef, PracticeChallengeRef } from './practiceEngine';

export type { QuizQuestion } from '../../data/lessonPracticeMappings';

// ── Public interfaces ────────────────────────────────────────────────────────

export interface TrackInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  /** Total XP available across all topics in this track */
  xpTotal: number;
  topicCount: number;
  /** Number of topics the current user has completed in this track */
  completedCount: number;
  /** 0-100 percentage */
  progressPercentage: number;
}

export interface TopicProgress {
  topicId: string;
  completed: boolean;
  completedAt: string | null;
  labCompleted: boolean;
  quizPassed: boolean;
  /** 0-100, null if not yet attempted */
  quizScore: number | null;
  challengeCompleted: boolean;
}

export type RequiredItem = 'lab' | 'quiz' | 'challenge';

export interface TopicInfo {
  id: string;
  slug: string;
  title: string;
  trackId: string;
  order: number;
  difficulty: string;
  xp: number;
  estimatedMinutes: number;
  vulnerabilitySlug: string;
  /** Which items must be completed for the topic to count as done */
  requiredItems: RequiredItem[];
  labs: PracticeLabRef[];
  challenges: PracticeChallengeRef[];
  quiz: QuizQuestion[];
  /** False = student can access; True = previous topic not yet completed */
  locked: boolean;
  /** True when all requiredItems are satisfied */
  completed: boolean;
  progress: TopicProgress;
}

export interface CompleteTopicResult {
  xpAwarded: number;
  nextTopicId: string | null;
  leveledUp: boolean;
}

// ── localStorage progress store ──────────────────────────────────────────────

const TOPIC_PROGRESS_KEY = 'hp_topic_progress';

type TopicProgressStore = { [topicId: string]: TopicProgress };

function loadTopicProgress(): TopicProgressStore {
  try {
    const raw = localStorage.getItem(TOPIC_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as TopicProgressStore) : {};
  } catch {
    return {};
  }
}

function saveTopicProgress(store: TopicProgressStore): void {
  try {
    localStorage.setItem(TOPIC_PROGRESS_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('[TopicEngine] Failed to save topic progress.', err);
  }
}

function getOrInitProgress(topicId: string, store: TopicProgressStore): TopicProgress {
  return (
    store[topicId] ?? {
      topicId,
      completed: false,
      completedAt: null,
      labCompleted: false,
      quizPassed: false,
      quizScore: null,
      challengeCompleted: false,
    }
  );
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Collects quiz questions from lessonPracticeMappings for a given vulnerability slug.
 * Reuses the HP-027 quiz bank — no duplication of question content.
 * Returns up to 5 deduplicated questions.
 */
function getQuizForSlug(slug: string): QuizQuestion[] {
  const seen = new Set<string>();
  const questions: QuizQuestion[] = [];

  for (const mapping of lessonPracticeMappings) {
    if (mapping.vulnerabilitySlugs.includes(slug)) {
      for (const q of mapping.quiz) {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          questions.push(q);
        }
      }
    }
  }

  return questions.slice(0, 5);
}

/** Hydrates raw lab IDs to PracticeLabRef objects. */
function hydrateLabs(labIds: string[]): PracticeLabRef[] {
  return labIds
    .map(id => (labsConfig as any[]).find(l => l.id === id))
    .filter(Boolean)
    .map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      difficulty: l.difficulty,
      duration: l.duration,
      xp: l.xp,
    }));
}

/** Hydrates raw challenge IDs to PracticeChallengeRef objects. */
function hydrateChallenges(challengeIds: string[]): PracticeChallengeRef[] {
  return challengeIds
    .map(id => (challengesConfig as any[]).find(c => c.id === id))
    .filter(Boolean)
    .map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      difficulty: c.difficulty,
      xp: c.xp,
      duration: c.duration,
    }));
}

/**
 * Evaluates whether a topic's completion criteria are met.
 * Topics with empty requiredItems are always completable (mark-complete flow).
 */
function isProgressComplete(
  progress: TopicProgress,
  requiredItems: RequiredItem[],
): boolean {
  if (requiredItems.length === 0) return true;
  return requiredItems.every(item => {
    if (item === 'lab') return progress.labCompleted;
    if (item === 'quiz') return progress.quizPassed;
    if (item === 'challenge') return progress.challengeCompleted;
    return false;
  });
}

/** Returns the raw topic record from topics.json by ID. */
function getRawTopic(topicId: string): any | null {
  return (topicsConfig.topics as any[]).find(t => t.id === topicId) ?? null;
}

// ── TopicEngine ──────────────────────────────────────────────────────────────

export const TopicEngine = {
  /**
   * Returns all tracks with live completion counts from localStorage.
   */
  getTracks(): TrackInfo[] {
    const store = loadTopicProgress();

    return (topicsConfig.tracks as any[]).map(track => {
      const trackTopics = (topicsConfig.topics as any[]).filter(
        t => t.trackId === track.id,
      );
      const completedCount = trackTopics.filter(
        t => store[t.id]?.completed === true,
      ).length;
      const total = trackTopics.length;
      const progressPercentage =
        total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        id: track.id,
        title: track.title,
        description: track.description,
        category: track.category,
        difficulty: track.difficulty,
        xpTotal: track.xpTotal,
        topicCount: total,
        completedCount,
        progressPercentage,
      };
    });
  },

  /**
   * Returns all topics in a track, each fully enriched with labs, challenges,
   * quiz questions, unlock state, and completion state.
   */
  getTopics(trackId: string): TopicInfo[] {
    const store = loadTopicProgress();
    const rawTopics = (topicsConfig.topics as any[])
      .filter(t => t.trackId === trackId)
      .sort((a, b) => a.order - b.order);

    return rawTopics.map(raw => this._enrichTopic(raw, store));
  },

  /**
   * Returns a single enriched topic by its ID.
   * Returns null if the topic does not exist.
   */
  getTopicById(topicId: string): TopicInfo | null {
    const raw = getRawTopic(topicId);
    if (!raw) return null;
    return this._enrichTopic(raw, loadTopicProgress());
  },

  /**
   * Marks a topic as complete, awards XP, and returns the result.
   * Validates that the topic is unlocked before completing.
   * Called by SessionEngine which then calls notifyChange().
   */
  completeTopic(topicId: string): CompleteTopicResult {
    const raw = getRawTopic(topicId);
    if (!raw) return { xpAwarded: 0, nextTopicId: null, leveledUp: false };

    if (!this.isTopicUnlocked(topicId)) {
      console.warn(`[TopicEngine] Topic ${topicId} is locked — cannot complete.`);
      return { xpAwarded: 0, nextTopicId: null, leveledUp: false };
    }

    const store = loadTopicProgress();
    const progress = getOrInitProgress(topicId, store);

    // Idempotent — do not double-award XP
    if (progress.completed) {
      const next = this.getNextTopic(topicId);
      return { xpAwarded: 0, nextTopicId: next?.id ?? null, leveledUp: false };
    }

    // Mark the topic done
    const updated: TopicProgress = {
      ...progress,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    store[topicId] = updated;
    saveTopicProgress(store);

    // Award XP through progressEngine (same path as courses/challenges)
    const prevProgress = loadProgress();
    const prevLevel = prevProgress.level;
    const newProgress = updateXp(prevProgress, raw.xp);
    saveProgress(newProgress);
    const leveledUp = newProgress.level > prevLevel;

    const next = this.getNextTopic(topicId);
    return {
      xpAwarded: raw.xp,
      nextTopicId: next?.id ?? null,
      leveledUp,
    };
  },

  /**
   * Records that the lab for a topic has been completed.
   * If all requiredItems are now met, automatically completes the topic.
   */
  markLabComplete(topicId: string): void {
    const store = loadTopicProgress();
    const progress = getOrInitProgress(topicId, store);
    store[topicId] = { ...progress, labCompleted: true };
    saveTopicProgress(store);
  },

  /**
   * Records a quiz result for a topic. Marks quizPassed if score >= 70.
   */
  recordQuizResult(topicId: string, score: number): void {
    const store = loadTopicProgress();
    const progress = getOrInitProgress(topicId, store);
    store[topicId] = {
      ...progress,
      quizScore: score,
      quizPassed: score >= 70,
    };
    saveTopicProgress(store);
  },

  /**
   * Records that the challenge for a topic has been completed.
   */
  markChallengeComplete(topicId: string): void {
    const store = loadTopicProgress();
    const progress = getOrInitProgress(topicId, store);
    store[topicId] = { ...progress, challengeCompleted: true };
    saveTopicProgress(store);
  },

  /**
   * Returns detailed progress for a single topic.
   */
  getTopicProgress(topicId: string): TopicProgress {
    const store = loadTopicProgress();
    return getOrInitProgress(topicId, store);
  },

  /**
   * Returns the next topic in the same track (by order), or null if at the end.
   */
  getNextTopic(topicId: string): TopicInfo | null {
    const raw = getRawTopic(topicId);
    if (!raw) return null;

    const nextRaw = (topicsConfig.topics as any[]).find(
      t => t.trackId === raw.trackId && t.order === raw.order + 1,
    );
    if (!nextRaw) return null;

    return this._enrichTopic(nextRaw, loadTopicProgress());
  },

  /**
   * Returns true if the topic can be accessed by the student.
   * First topic in any track: always unlocked.
   * Subsequent topics: previous topic must be marked complete.
   */
  isTopicUnlocked(topicId: string): boolean {
    const raw = getRawTopic(topicId);
    if (!raw) return false;
    if (raw.order === 1) return true;

    const prevRaw = (topicsConfig.topics as any[]).find(
      t => t.trackId === raw.trackId && t.order === raw.order - 1,
    );
    if (!prevRaw) return true;

    const store = loadTopicProgress();
    return store[prevRaw.id]?.completed === true;
  },

  /**
   * Returns completion stats for a track: completed, total, and percentage.
   */
  getTrackProgress(trackId: string): { completed: number; total: number; percentage: number } {
    const store = loadTopicProgress();
    const trackTopics = (topicsConfig.topics as any[]).filter(t => t.trackId === trackId);
    const completed = trackTopics.filter(t => store[t.id]?.completed === true).length;
    const total = trackTopics.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  // ── Private ─────────────────────────────────────────────────────────────────

  /**
   * Builds a fully-enriched TopicInfo from a raw topics.json entry.
   */
  _enrichTopic(raw: any, store: TopicProgressStore): TopicInfo {
    const progress = getOrInitProgress(raw.id, store);
    const locked = !this.isTopicUnlocked(raw.id);
    const completed =
      progress.completed || isProgressComplete(progress, raw.requiredItems as RequiredItem[]);

    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      trackId: raw.trackId,
      order: raw.order,
      difficulty: raw.difficulty,
      xp: raw.xp,
      estimatedMinutes: raw.estimatedMinutes,
      vulnerabilitySlug: raw.vulnerabilitySlug,
      requiredItems: raw.requiredItems as RequiredItem[],
      labs: hydrateLabs(raw.labIds as string[]),
      challenges: hydrateChallenges(raw.challengeIds as string[]),
      quiz: getQuizForSlug(raw.vulnerabilitySlug),
      locked,
      completed,
      progress,
    };
  },
};

export default TopicEngine;
