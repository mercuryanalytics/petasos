import { describe, it, expect } from "vitest"
import authReducer from "../reducers"

const initialState = {
  user: null,
  isSocialLogin: false,
  authKey: null,
  authUser: null,
  partner: null
}

describe("authReducer", () => {
  it("returns the initial state by default", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState)
  })

  it("returns the given state unchanged for an unknown action", () => {
    const state = { ...initialState, authKey: "abc" }
    expect(authReducer(state, { type: "NOPE" })).toBe(state)
  })

  it.each([
    ["SET_USER", "user", { id: 1 }],
    ["SET_IS_SOCIAL_LOGIN", "isSocialLogin", true],
    ["SET_AUTH_KEY", "authKey", "jwt-token"],
    ["SET_AUTH_USER", "authUser", { sub: "auth0|1" }],
    ["SET_PARTNER", "partner", { id: 9 }]
  ])("%s sets %s from the payload without touching other fields", (type, field, payload) => {
    const state = authReducer(initialState, { type, payload })
    expect(state[field]).toEqual(payload)
    // Every other field stays at its initial value.
    Object.keys(initialState)
      .filter(k => k !== field)
      .forEach(k => expect(state[k]).toEqual(initialState[k]))
  })
})
