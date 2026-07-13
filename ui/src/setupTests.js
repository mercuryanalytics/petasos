// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// and clears the jsdom DOM between tests. Loaded via `test.setupFiles` in
// vite.config.js.
import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
