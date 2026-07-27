import { describe, it, expect, beforeEach, vi } from "vitest"

// api-call reads store.getState().authReducer.authKey. Mock the store so we can
// control the auth key per test without constructing the real redux store.
const mockState = vi.hoisted(() => ({ authKey: "TEST-TOKEN" }))
vi.mock("../../store", () => ({
  default: { getState: () => ({ authReducer: { authKey: mockState.authKey } }) }
}))

import apiCall from "../api-call"

// A distinct URL per test avoids the module-level `ongoing`/`called` caches
// bleeding across tests.
let counter = 0
const nextUrl = () => `https://api.test/resource/${counter++}`

const lastCall = () => fetch.mock.calls[fetch.mock.calls.length - 1]

// Mock a single successful fetch whose body is irrelevant to the test.
const mockOk = () => fetch.mockResponseOnce(JSON.stringify({ data: {} }))

// Perform a GET that succeeds and is recorded in apiCall's call tracker,
// returning the URL used so the test can assert against it.
const trackGet = async () => {
  const url = nextUrl()
  mockOk()
  await apiCall("GET", url)
  return url
}

beforeEach(() => {
  mockState.authKey = "TEST-TOKEN"
  apiCall.forgetAll()
})

describe("apiCall requests", () => {
  it("resolves to an empty string without fetching when unauthenticated", async () => {
    mockState.authKey = null
    const result = await apiCall("GET", nextUrl())
    expect(result).toBe("")
    expect(fetch).not.toHaveBeenCalled()
  })

  it("still fetches unauthenticated when noAuth is set, without an Authorization header", async () => {
    mockState.authKey = null
    mockOk()
    await apiCall("GET", nextUrl(), { noAuth: true })
    const [, init] = lastCall()
    expect(fetch).toHaveBeenCalled()
    expect(init.headers.get("Authorization")).toBeNull()
  })

  it("sends the bearer token and JSON content type when authenticated", async () => {
    mockOk()
    await apiCall("GET", nextUrl())
    const [, init] = lastCall()
    expect(init.headers.get("Authorization")).toBe("Bearer TEST-TOKEN")
    expect(init.headers.get("Content-Type")).toBe("application/json")
  })

  it("passes method and body through on POST", async () => {
    mockOk()
    const body = JSON.stringify({ name: "x" })
    await apiCall("POST", nextUrl(), { body })
    const [, init] = lastCall()
    expect(init.method).toBe("POST")
    expect(init.body).toBe(body)
  })
})

describe("apiCall response handling", () => {
  it("returns the unwrapped data payload", async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: { id: 1, name: "x" } }))
    const result = await apiCall("GET", nextUrl())
    expect(result).toEqual({ id: 1, name: "x" })
  })

  it("returns an empty string for an empty body", async () => {
    fetch.mockResponseOnce("")
    const result = await apiCall("GET", nextUrl())
    expect(result).toBe("")
  })

  it("returns an empty string when the payload has no data key", async () => {
    fetch.mockResponseOnce(JSON.stringify({ meta: 1 }))
    const result = await apiCall("GET", nextUrl())
    expect(result).toBe("")
  })

  it("rejects when a 200 payload carries an errors key", async () => {
    fetch.mockResponseOnce(JSON.stringify({ errors: ["bad"] }))
    await expect(apiCall("GET", nextUrl())).rejects.toEqual({ errors: ["bad"] })
  })

  it("rejects with a structured error on a non-ok response", async () => {
    fetch.mockResponseOnce(JSON.stringify({ errors: { email: ["taken"] } }), { status: 422 })
    await expect(apiCall("POST", nextUrl(), { body: "{}" })).rejects.toMatchObject({
      xhrHttpCode: 422,
      body: { email: ["taken"] },
      message: expect.stringContaining("422")
    })
  })
})

describe("apiCall GET de-duplication", () => {
  it("returns the same in-flight promise for concurrent GETs to one URL", async () => {
    mockOk()
    const url = nextUrl()
    const p1 = apiCall("GET", url)
    const p2 = apiCall("GET", url)
    expect(p1).toBe(p2)
    await Promise.all([p1, p2])
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe("apiCall call tracking", () => {
  it("records successful GETs and forgets them on demand", async () => {
    const url = await trackGet()

    expect(apiCall.isCalled(url)).toBe(true)
    expect(apiCall.isCalled(nextUrl())).toBe(false)

    apiCall.forget(url)
    expect(apiCall.isCalled(url)).toBe(false)
  })

  it("isCalled returns true if any url in an array was called", async () => {
    const url = await trackGet()
    expect(apiCall.isCalled(["https://api.test/never", url])).toBe(true)
  })

  it("forget accepts a RegExp", async () => {
    const url = await trackGet()
    apiCall.forget(/resource/)
    expect(apiCall.isCalled(url)).toBe(false)
  })

  it("forgetAll clears everything", async () => {
    const url = await trackGet()
    apiCall.forgetAll()
    expect(apiCall.isCalled(url)).toBe(false)
  })
})
