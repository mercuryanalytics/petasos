import { describe, it, expect } from "vitest"
import locationReducer from "../reducers"

const initialData = {
  create: false,
  account: null,
  client: null,
  project: null,
  report: null,
  superUser: null
}

describe("locationReducer", () => {
  it("returns the initial state by default", () => {
    expect(locationReducer(undefined, { type: "@@INIT" })).toEqual({ data: initialData })
  })

  it("returns the given state unchanged for an unknown action", () => {
    const state = { data: { ...initialData, client: 1 } }
    expect(locationReducer(state, { type: "NOPE" })).toBe(state)
  })

  it("merges the payload over a fresh copy of the defaults on SET_LOCATION_DATA", () => {
    const state = locationReducer(
      { data: { ...initialData, report: 99 } },
      { type: "SET_LOCATION_DATA", payload: { client: 5, project: 7 } }
    )
    // Payload fields applied...
    expect(state.data.client).toBe(5)
    expect(state.data.project).toBe(7)
    // ...and unrelated fields reset to defaults (report from prior state is dropped).
    expect(state.data.report).toBeNull()
    expect(state.data.create).toBe(false)
  })
})
