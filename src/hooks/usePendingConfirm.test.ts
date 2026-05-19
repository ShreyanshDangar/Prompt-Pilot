import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePendingConfirm } from "./usePendingConfirm"

describe("usePendingConfirm", () => {
  it("arms with request(id) and resets with clear()", () => {
    const { result } = renderHook(() => usePendingConfirm<string>())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.pendingId).toBeNull()

    act(() => result.current.request("abc"))
    expect(result.current.isOpen).toBe(true)
    expect(result.current.pendingId).toBe("abc")

    act(() => result.current.clear())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.pendingId).toBeNull()
  })
})
