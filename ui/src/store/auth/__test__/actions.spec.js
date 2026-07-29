import { describe, it, expect, vi } from "vitest"

// Mock the network boundary (utils/api-call) via the shared api-call mock.
// Thunks are then exercised with a plain vi.fn() dispatch — no redux-mock-store
// needed.
vi.mock("../../../utils/api-call", async () => {
  const { makeApiCallMock } = await import("../../../__test__/api-call-mock")
  return makeApiCallMock()
})

import apiCall from "../../../utils/api-call"
import Constants from "../../../utils/constants"
import {
  setUser,
  setIsSocialLogin,
  setAuthKey,
  setAuthUser,
  setPartner,
  resetPassword,
  resetPasswordSuccess,
  resetPasswordFailure,
  changePassword,
  changePasswordSuccess
} from "../actions"

describe("auth plain action creators", () => {
  it.each([
    [setUser, "SET_USER", { id: 1 }],
    [setIsSocialLogin, "SET_IS_SOCIAL_LOGIN", true],
    [setAuthKey, "SET_AUTH_KEY", "jwt"],
    [setAuthUser, "SET_AUTH_USER", { sub: "auth0|1" }],
    [setPartner, "SET_PARTNER", { id: 9 }]
  ])("%o builds a { type, payload } action", (creator, type, payload) => {
    expect(creator(payload)).toEqual({ type, payload })
  })
})

describe("resetPassword thunk", () => {
  it("POSTs the email to the reset endpoint with noAuth", async () => {
    apiCall.mockResolvedValue({ ok: true })
    const dispatch = vi.fn()

    await resetPassword("user@example.com")(dispatch)

    expect(apiCall).toHaveBeenCalledWith("POST", `${Constants.API_URL}/reset-password`, {
      body: JSON.stringify({ email: "user@example.com" }),
      noAuth: true
    })
    expect(dispatch).toHaveBeenCalledWith(resetPasswordSuccess({ ok: true }))
  })

  it("includes the partner subdomain in the body when provided", async () => {
    apiCall.mockResolvedValue({})
    const dispatch = vi.fn()

    await resetPassword("user@example.com", "acme")(dispatch)

    expect(apiCall).toHaveBeenCalledWith("POST", `${Constants.API_URL}/reset-password`, {
      body: JSON.stringify({ email: "user@example.com", subdomain: "acme" }),
      noAuth: true
    })
  })

  it("dispatches the failure action and rejects when the call fails", async () => {
    const error = { message: "nope" }
    apiCall.mockRejectedValue(error)
    const dispatch = vi.fn()

    await expect(resetPassword("user@example.com")(dispatch)).rejects.toBe(error)
    expect(dispatch).toHaveBeenCalledWith(resetPasswordFailure(error))
  })
})

describe("changePassword thunk", () => {
  it("POSTs token and password fields and dispatches success", async () => {
    apiCall.mockResolvedValue({ done: true })
    const dispatch = vi.fn()

    await changePassword("tok", "pw", "pw")(dispatch)

    expect(apiCall).toHaveBeenCalledWith("POST", `${Constants.API_URL}/change-password`, {
      body: JSON.stringify({ token: "tok", password: "pw", password_confirmation: "pw" }),
      noAuth: true
    })
    expect(dispatch).toHaveBeenCalledWith(changePasswordSuccess({ done: true }))
  })
})
