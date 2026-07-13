// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.),
// clears the jsdom DOM between tests, and installs a global fetch mock so no
// test hits the network. Loaded via `test.setupFiles` in vite.config.js.
import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach, vi } from "vitest"
import createFetchMock from "vitest-fetch-mock"

// Replace global fetch with a mock (talaria convention). Specs that exercise
// the network boundary (utils/api-call) drive it via the global `fetchMock`.
const fetchMocker = createFetchMock(vi)
fetchMocker.enableMocks()

// jsdom does not implement matchMedia; react-responsive's useMediaQuery needs
// it. Default every query to non-matching.
if (!window.matchMedia) {
  window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
}

beforeEach(() => {
  fetchMocker.resetMocks()
})

afterEach(() => {
  cleanup()
})
