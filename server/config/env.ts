/**
 * env.ts
 * Single source of truth for all environment-variable resolution on the server.
 *
 * Every env var is read, validated, and typed here.
 * No other server file reads process.env directly for provider selection.
 * LAB-001: Adds LAB_PROVIDER resolution.
 */

// ── Provider Selection ────────────────────────────────────────────────────────

/** Valid provider identifiers. */
export type ProviderName = 'mock' | 'docker';

const VALID_PROVIDERS: ProviderName[] = ['mock', 'docker'];

/**
 * Resolves which LabProvider the orchestrator should use.
 * Defaults to 'mock' if LAB_PROVIDER is unset or invalid.
 */
function resolveLabProvider(): ProviderName {
  const raw = (process.env.LAB_PROVIDER ?? 'mock').toLowerCase().trim();
  if ((VALID_PROVIDERS as string[]).includes(raw)) {
    return raw as ProviderName;
  }
  console.warn(
    `[env] Unknown LAB_PROVIDER="${process.env.LAB_PROVIDER}". Falling back to "mock".`,
  );
  return 'mock';
}

export const LAB_PROVIDER: ProviderName = resolveLabProvider();

// ── Server ────────────────────────────────────────────────────────────────────

/** HTTP port the Express server listens on. */
export const SERVER_PORT: number = Number(process.env.PORT ?? 3001);

/** CORS origin allowed for the frontend dev server. */
export const CORS_ORIGIN: string =
  process.env.CORS_ORIGIN ?? 'http://localhost:3000';

// ── Resolved environment summary (logged at startup) ─────────────────────────

export function logEnvSummary(): void {
  console.log('[HackerPlus Env]', {
    LAB_PROVIDER,
    SERVER_PORT,
    CORS_ORIGIN,
  });
}
