import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Unmount React trees rendered by Testing Library between tests (globals are off,
// so the automatic afterEach cleanup is wired up explicitly here).
afterEach(() => {
  cleanup()
})
