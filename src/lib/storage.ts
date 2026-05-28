import { get, set } from "idb-keyval"

export async function getFromIDB<T>(key: string): Promise<T | undefined> {
  return get<T>(key)
}

export async function setToIDB<T>(key: string, value: T): Promise<void> {
  return set(key, value)
}

export function getFromLocalStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  )
}

interface SafeSetOptions {
  /** Invoked when the write fails specifically because storage is full, so the
   *  caller can surface a single toast. Other errors are logged, not thrown. */
  onQuotaExceeded?: () => void
}

/**
 * Persists `value` to localStorage without throwing: quota-exceeded errors are
 * routed to `onQuotaExceeded`, any other error is logged. Centralises the
 * quota handling that previously lived only in the image store. Returns whether
 * the write succeeded.
 */
export function safeSetLocalStorage<T>(
  key: string,
  value: T,
  opts?: SafeSetOptions,
): boolean {
  try {
    setToLocalStorage(key, value)
    return true
  } catch (error) {
    if (isQuotaExceededError(error)) {
      opts?.onQuotaExceeded?.()
    } else {
      console.error(`Failed to persist "${key}":`, error)
    }
    return false
  }
}
