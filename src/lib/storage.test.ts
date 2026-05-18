import { describe, it, expect, beforeEach } from "vitest"
import {
  getFromLocalStorage,
  setToLocalStorage,
  safeSetLocalStorage,
} from "./storage"

describe("localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("round-trips an object through set/get", () => {
    const value = { a: 1, b: ["x", "y"], c: { nested: true } }
    setToLocalStorage("key", value)
    expect(getFromLocalStorage<typeof value>("key")).toEqual(value)
  })

  it("returns null for an absent key", () => {
    expect(getFromLocalStorage("missing")).toBeNull()
  })

  it("returns null when the stored value is invalid JSON", () => {
    localStorage.setItem("broken", "{not json")
    expect(getFromLocalStorage("broken")).toBeNull()
  })

  it("safeSetLocalStorage writes and reports success", () => {
    const ok = safeSetLocalStorage("k2", { n: 42 })
    expect(ok).toBe(true)
    expect(getFromLocalStorage<{ n: number }>("k2")).toEqual({ n: 42 })
  })
})
