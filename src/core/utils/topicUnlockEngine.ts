/**
 * topicUnlockEngine.ts
 * Owns the `hp_batch_progress` localStorage key.
 *
 * Tracks which topics the instructor has explicitly unlocked for each batch.
 * This is SEPARATE from hp_topic_progress (HP-028), which tracks student completion.
 *
 *   hp_topic_progress  → "has the student COMPLETED this topic?"
 *   hp_batch_progress  → "has the INSTRUCTOR UNLOCKED this topic for a batch?"
 *
 * The only write entry point is unlock() / lock() / reset().
 * All reads are via getUnlockedIds() and isUnlocked().
 */

// ── Storage shape ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hp_batch_progress';

interface BatchUnlockRecord {
  unlockedTopicIds: string[];
  /** ISO timestamps keyed by topicId for audit/display */
  unlockedAt: Record<string, string>;
}

type BatchProgressStore = Record<string, BatchUnlockRecord>;

// ── Persistence helpers ──────────────────────────────────────────────────────

function loadStore(): BatchProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BatchProgressStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: BatchProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('[TopicUnlockEngine] Failed to save batch progress.', err);
  }
}

function getOrInitRecord(batchId: string, store: BatchProgressStore): BatchUnlockRecord {
  return store[batchId] ?? { unlockedTopicIds: [], unlockedAt: {} };
}

// ── TopicUnlockEngine ────────────────────────────────────────────────────────

export const TopicUnlockEngine = {
  /**
   * Unlocks a topic for a batch. Idempotent — safe to call twice.
   * Records the unlock timestamp for audit display.
   */
  unlock(batchId: string, topicId: string): void {
    const store = loadStore();
    const record = getOrInitRecord(batchId, store);
    if (!record.unlockedTopicIds.includes(topicId)) {
      record.unlockedTopicIds = [...record.unlockedTopicIds, topicId];
    }
    if (!record.unlockedAt[topicId]) {
      record.unlockedAt[topicId] = new Date().toISOString();
    }
    store[batchId] = record;
    saveStore(store);
  },

  /**
   * Removes a topic from the unlocked list for a batch.
   * Use sparingly — prefer unlock to be additive.
   */
  lock(batchId: string, topicId: string): void {
    const store = loadStore();
    const record = getOrInitRecord(batchId, store);
    record.unlockedTopicIds = record.unlockedTopicIds.filter(id => id !== topicId);
    delete record.unlockedAt[topicId];
    store[batchId] = record;
    saveStore(store);
  },

  /**
   * Returns true if the topic has been unlocked for the batch.
   */
  isUnlocked(batchId: string, topicId: string): boolean {
    const store = loadStore();
    const record = getOrInitRecord(batchId, store);
    return record.unlockedTopicIds.includes(topicId);
  },

  /**
   * Returns the ordered list of unlocked topic IDs for a batch.
   * Order reflects unlock sequence (insertion order preserved).
   */
  getUnlockedIds(batchId: string): string[] {
    const store = loadStore();
    return getOrInitRecord(batchId, store).unlockedTopicIds;
  },

  /**
   * Returns the ISO timestamp when a topic was unlocked for a batch.
   * Returns null if the topic has not been unlocked.
   */
  getUnlockedAt(batchId: string, topicId: string): string | null {
    const store = loadStore();
    return getOrInitRecord(batchId, store).unlockedAt[topicId] ?? null;
  },

  /**
   * Clears all unlock records for a batch.
   * Use for testing or batch reset scenarios.
   */
  reset(batchId: string): void {
    const store = loadStore();
    delete store[batchId];
    saveStore(store);
  },
};

export default TopicUnlockEngine;
