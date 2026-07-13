/**
 * batchEngine.ts
 * Pure data-access layer for batches and topic schedules.
 *
 * Reads from:  data/batches.json
 *              data/topicSchedule.json
 *
 * No localStorage. No side effects. No business logic.
 * All writes go through TopicUnlockEngine.
 */
import batchesConfig from '../../../data/batches.json';
import schedulesConfig from '../../../data/topicSchedule.json';

// ── Public interfaces ────────────────────────────────────────────────────────

export interface BatchInfo {
  id: string;
  name: string;
  partnerId: string | null;
  scheduleId: string;
  instructorUsername: string;
  startDate: string;
  endDate: string;
  /** 'active' | 'scheduled' | 'completed' */
  status: string;
  studentUsernames: string[];
}

export interface ScheduleEntry {
  /** Calendar day number within the course (1-based) */
  day: number;
  /** Week number within the course (1-based) */
  week: number;
  /** Must match a topic ID in data/topics.json */
  topicId: string;
  /** Display title (mirrors the topic title for fast rendering without a join) */
  title: string;
}

export interface ScheduleInfo {
  id: string;
  name: string;
  description: string;
  entries: ScheduleEntry[];
}

// ── BatchEngine ──────────────────────────────────────────────────────────────

export const BatchEngine = {
  /**
   * Returns a single batch by ID, or null if not found.
   */
  getBatch(batchId: string): BatchInfo | null {
    return (
      (batchesConfig.batches as BatchInfo[]).find(b => b.id === batchId) ?? null
    );
  },

  /**
   * Returns all batches from the catalog.
   */
  getBatches(): BatchInfo[] {
    return batchesConfig.batches as BatchInfo[];
  },

  /**
   * Returns batches matching a given status.
   */
  getBatchesByStatus(status: string): BatchInfo[] {
    return (batchesConfig.batches as BatchInfo[]).filter(b => b.status === status);
  },

  /**
   * Returns a schedule definition by its ID, or null if not found.
   */
  getSchedule(scheduleId: string): ScheduleInfo | null {
    return (
      (schedulesConfig.schedules as ScheduleInfo[]).find(s => s.id === scheduleId) ??
      null
    );
  },

  /**
   * Convenience method: resolves the batch's scheduleId and returns
   * the full ScheduleInfo. Returns null if either batch or schedule is unknown.
   */
  getScheduleForBatch(batchId: string): ScheduleInfo | null {
    const batch = this.getBatch(batchId);
    if (!batch) return null;
    return this.getSchedule(batch.scheduleId);
  },

  /**
   * Returns all schedules from the catalog.
   */
  getAllSchedules(): ScheduleInfo[] {
    return schedulesConfig.schedules as ScheduleInfo[];
  },
};

export default BatchEngine;
