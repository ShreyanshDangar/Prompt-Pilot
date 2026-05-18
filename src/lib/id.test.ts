import { describe, it, expect } from "vitest"
import { makeId } from "./id"

describe("makeId", () => {
  it("returns unique, non-empty ids", () => {
    const ids = Array.from({ length: 1000 }, () => makeId())
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => id.length > 0)).toBe(true)
  })
})
