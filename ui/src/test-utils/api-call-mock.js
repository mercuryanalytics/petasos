import { vi } from "vitest"

// Mock module shape for utils/api-call: a default-export fn carrying the static
// helpers (isCalled/forget/forgetAll) the store thunks call. isCalled defaults
// to false so specs take the network path unless they opt into the cached read.
// Use inside a vi.mock factory so every store spec mocks the boundary the same
// way: vi.mock(path, async () => (await import(".../api-call-mock")).makeApiCallMock())
export function makeApiCallMock() {
  const fn = vi.fn()
  fn.isCalled = vi.fn(() => false)
  fn.forget = vi.fn()
  fn.forgetAll = vi.fn()
  return { default: fn }
}
