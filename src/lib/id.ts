/**
 * Generates a unique id, preferring `crypto.randomUUID()` with a timestamp +
 * random-suffix fallback for environments where it is unavailable. Shared by
 * every store/feature that mints client-side entity ids.
 */
export function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
