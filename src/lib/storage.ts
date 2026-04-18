import { get, set, del } from "idb-keyval"

export async function getFromIDB<T>(key: string): Promise<T | undefined> {
  return get<T>(key)
}

export async function setToIDB<T>(key: string, value: T): Promise<void> {
  return set(key, value)
}

export async function deleteFromIDB(key: string): Promise<void> {
  return del(key)
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
