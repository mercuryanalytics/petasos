import { describe, it, expect } from "vitest"
import reportsReducer, { sortReports } from "../reducers"

const initialState = () => ({ reports: [], orphans: [], clientReports: [] })

describe("reportsReducer", () => {
  it("returns the initial state for an unknown action", () => {
    expect(reportsReducer(undefined, { type: "@@INIT" })).toEqual({
      reports: [],
      orphans: [],
      clientReports: []
    })
  })

  it("returns the given state unchanged for an unknown action", () => {
    const state = { reports: [{ id: 1 }], orphans: [], clientReports: [] }
    expect(reportsReducer(state, { type: "NOPE" })).toBe(state)
  })

  it("adds and name-sorts on GET_REPORTS_SUCCESS", () => {
    const state = reportsReducer(initialState(), {
      type: "GET_REPORTS_SUCCESS",
      payload: [
        { id: 1, name: "Zebra" },
        { id: 2, name: "apple" }
      ]
    })
    expect(state.reports.map(r => r.name)).toEqual(["apple", "Zebra"])
  })

  it("populates both reports and clientReports on GET_CLIENT_REPORTS_SUCCESS", () => {
    const state = reportsReducer(initialState(), {
      type: "GET_CLIENT_REPORTS_SUCCESS",
      payload: [{ id: 9, name: "Alpha" }]
    })
    expect(state.reports.map(r => r.id)).toEqual([9])
    expect(state.clientReports.map(r => r.id)).toEqual([9])
  })

  it("populates both reports and orphans on GET_ORPHAN_REPORTS_SUCCESS", () => {
    const state = reportsReducer(initialState(), {
      type: "GET_ORPHAN_REPORTS_SUCCESS",
      payload: [{ id: 7, name: "Beta" }]
    })
    expect(state.reports.map(r => r.id)).toEqual([7])
    expect(state.orphans.map(r => r.id)).toEqual([7])
  })

  it("merges on UPDATE_REPORT_SUCCESS without adding new ids", () => {
    const start = { ...initialState(), reports: [{ id: 1, name: "Old", keep: true }] }
    const state = reportsReducer(start, {
      type: "UPDATE_REPORT_SUCCESS",
      payload: { id: 1, name: "New" }
    })
    expect(state.reports).toEqual([{ id: 1, name: "New", keep: true }])
  })

  it("removes a report on DELETE_REPORT_SUCCESS", () => {
    const start = { ...initialState(), reports: [{ id: 1 }, { id: 2 }] }
    const state = reportsReducer(start, { type: "DELETE_REPORT_SUCCESS", reportId: 2 })
    expect(state.reports).toEqual([{ id: 1 }])
  })
})

describe("sortReports", () => {
  it("orders reports ascending by name, case-insensitively", () => {
    const sorted = sortReports([{ name: "beta" }, { name: "Alpha" }])
    expect(sorted.map(r => r.name)).toEqual(["Alpha", "beta"])
  })
})
