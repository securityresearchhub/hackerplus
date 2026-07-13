/**
 * instructorEngine.ts
 * Facade for instructor-led training (ILT) workflows.
 *
 * Integrates BatchEngine, TopicUnlockEngine, and TopicEngine to resolve
 * batch-specific unlocked topics, curriculum schedules, and today's practice.
 */
import { BatchEngine, type BatchInfo } from './batchEngine';
import { TopicUnlockEngine } from './topicUnlockEngine';
import { TopicEngine, type TopicInfo } from './topicEngine';

export interface UnlockedTopicInfo extends TopicInfo {
  /** ISO timestamp when the instructor unlocked this topic for the batch */
  unlockedAt: string | null;
}

export interface TodayPractice {
  batchId: string;
  batchName: string;
  /** The most recently unlocked topic, or null if none are unlocked */
  topic: TopicInfo | null;
  /** All topics unlocked for this batch so far, in chronological unlock order */
  allUnlocked: UnlockedTopicInfo[];
}

export const InstructorEngine = {
  /**
   * Unlocks a topic for a batch.
   */
  unlockTopic(batchId: string, topicId: string): void {
    TopicUnlockEngine.unlock(batchId, topicId);
  },

  /**
   * Locks a topic for a batch.
   */
  lockTopic(batchId: string, topicId: string): void {
    TopicUnlockEngine.lock(batchId, topicId);
  },

  /**
   * Returns all topics unlocked for a batch, fully hydrated with labs,
   * challenges, and quizzes, with locked = false.
   */
  getUnlockedTopics(batchId: string): UnlockedTopicInfo[] {
    const unlockedIds = TopicUnlockEngine.getUnlockedIds(batchId);
    return unlockedIds
      .map(id => {
        const topic = TopicEngine.getTopicById(id);
        if (!topic) return null;
        const unlockedAt = TopicUnlockEngine.getUnlockedAt(batchId, id);
        return {
          ...topic,
          locked: false, // Explicitly override locked state since it is unlocked by the instructor
          unlockedAt,
        };
      })
      .filter(Boolean) as UnlockedTopicInfo[];
  },

  /**
   * Resolves the "today's practice" metadata for the batch.
   * "Today's topic" is defined as the most recently unlocked topic (by unlockedAt time).
   */
  getTodayPractice(batchId: string): TodayPractice {
    const batch = BatchEngine.getBatch(batchId);
    const batchName = batch ? batch.name : 'Unknown Batch';
    const allUnlocked = this.getUnlockedTopics(batchId);

    let latestTopic: TopicInfo | null = null;
    if (allUnlocked.length > 0) {
      // Find the topic with the maximum unlockedAt timestamp
      let latestUnlockTime = 0;
      let latestIndex = 0;

      allUnlocked.forEach((t, idx) => {
        const time = t.unlockedAt ? new Date(t.unlockedAt).getTime() : 0;
        if (time >= latestUnlockTime) {
          latestUnlockTime = time;
          latestIndex = idx;
        }
      });
      latestTopic = allUnlocked[latestIndex];
    }

    return {
      batchId,
      batchName,
      topic: latestTopic,
      allUnlocked,
    };
  },

  /**
   * Returns the static batch details.
   */
  getBatch(batchId: string): BatchInfo | null {
    return BatchEngine.getBatch(batchId);
  },

  /**
   * Returns all static batch details.
   */
  getBatches(): BatchInfo[] {
    return BatchEngine.getBatches();
  },
};

export default InstructorEngine;
