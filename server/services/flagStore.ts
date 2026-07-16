/**
 * flagStore.ts
 * In-memory registry mapping labSessionId to the dynamically generated flag.
 * Used for server-side flag validation in LAB-006.
 */
class FlagStoreClass {
  private flags = new Map<string, string>();

  /**
   * Associate a generated flag with a session.
   */
  setFlag(labSessionId: string, flag: string): void {
    this.flags.set(labSessionId, flag);
  }

  /**
   * Retrieve the flag for a session.
   */
  getFlag(labSessionId: string): string | undefined {
    return this.flags.get(labSessionId);
  }

  /**
   * Discard the flag for a session (called when container is destroyed/terminated).
   */
  deleteFlag(labSessionId: string): void {
    this.flags.delete(labSessionId);
  }
}

export const FlagStore = new FlagStoreClass();
export default FlagStore;
