import { describe, it, expect } from "vitest"
import { extractVariables, resolveVariables } from "./variable-utils"

describe("variable-utils", () => {
  it("extractVariables returns unique names in first-seen order", () => {
    expect(extractVariables("{{a}} {{b}} {{a}}")).toEqual(["a", "b"])
  })

  it("extractVariables returns [] when there are no variables", () => {
    expect(extractVariables("plain text")).toEqual([])
  })

  it("resolveVariables substitutes provided values", () => {
    expect(resolveVariables("Hi {{name}}", { name: "Sam" })).toBe("Hi Sam")
  })

  it("resolveVariables leaves unknown variables as literal {{name}}", () => {
    expect(resolveVariables("{{a}} and {{b}}", { a: "X" })).toBe("X and {{b}}")
  })
})
