import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the network boundary via the shared api-call mock (default export plus
// the isCalled/forget static helpers the thunks call).
vi.mock("../../../utils/api-call", async () => {
  const { makeApiCallMock } = await import("../../../__test__/api-call-mock")
  return makeApiCallMock()
})

import apiCall from "../../../utils/api-call"
import Constants from "../../../utils/constants"
import {
  getReports,
  getReportsSuccess,
  getReportsFailure,
  getOrphanReports,
  getOrphanReportsSuccess,
  getClientReports,
  getClientReportsSuccess,
  getReport,
  getReportSuccess,
  createReport,
  createReportSuccess,
  updateReport,
  deleteReport,
  deleteReportSuccess
} from "../actions"

const API = Constants.API_URL

beforeEach(() => {
  apiCall.isCalled.mockReturnValue(false)
})

describe("reports plain action creators", () => {
  it("build { type, payload } actions", () => {
    expect(getReportsSuccess([1])).toEqual({ type: "GET_REPORTS_SUCCESS", payload: [1] })
    expect(getReportsFailure("e")).toEqual({ type: "GET_REPORTS_FAILURE", payload: "e" })
    expect(getOrphanReportsSuccess([2])).toEqual({ type: "GET_ORPHAN_REPORTS_SUCCESS", payload: [2] })
    expect(getClientReportsSuccess([3])).toEqual({ type: "GET_CLIENT_REPORTS_SUCCESS", payload: [3] })
    expect(getReportSuccess({ id: 1 })).toEqual({ type: "GET_REPORT_SUCCESS", payload: { id: 1 } })
  })

  it("deleteReportSuccess carries reportId", () => {
    expect(deleteReportSuccess(9)).toEqual({ type: "DELETE_REPORT_SUCCESS", reportId: 9 })
  })
})

describe("getReports thunk", () => {
  it("uses project_id when a projectId is given", async () => {
    apiCall.mockResolvedValue([])
    await getReports(11)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/reports?project_id=11`)
  })

  it("falls back to client_id when only a clientId is given", async () => {
    apiCall.mockResolvedValue([])
    await getReports(undefined, 22)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/reports?client_id=22`)
  })

  it("dispatches success with the fetched reports", async () => {
    apiCall.mockResolvedValue([{ id: 1 }])
    const dispatch = vi.fn()
    await getReports()(dispatch)
    expect(dispatch).toHaveBeenCalledWith(getReportsSuccess([{ id: 1 }]))
  })
})

describe("orphan / client report thunks", () => {
  it("getOrphanReports GETs the orphans endpoint", async () => {
    apiCall.mockResolvedValue([])
    await getOrphanReports()(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/reports/orphans`)
  })

  it("getClientReports GETs the client's orphans endpoint", async () => {
    apiCall.mockResolvedValue([])
    const dispatch = vi.fn()
    await getClientReports(7)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/clients/7/orphans`)
    expect(dispatch).toHaveBeenCalledWith(getClientReportsSuccess([]))
  })
})

describe("getReport thunk", () => {
  it("GETs a single report by id", async () => {
    apiCall.mockResolvedValue({ id: 5 })
    const dispatch = vi.fn()
    await getReport(5)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/reports/5`)
    expect(dispatch).toHaveBeenCalledWith(getReportSuccess({ id: 5 }))
  })
})

describe("report CRUD thunks", () => {
  it("createReport POSTs a wrapped report body and dispatches success", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    const dispatch = vi.fn()

    await createReport({ name: "R" }, 100)(dispatch)

    expect(apiCall).toHaveBeenCalledWith("POST", `${API}/reports`, {
      body: JSON.stringify({ report: { name: "R" } })
    })
    expect(dispatch).toHaveBeenCalledWith(createReportSuccess({ id: 1 }))
  })

  it("updateReport PATCHes by id", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    await updateReport(1, { name: "N" }, 100)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("PATCH", `${API}/reports/1`, {
      body: JSON.stringify({ report: { name: "N" } })
    })
  })

  it("deleteReport DELETEs and dispatches success with the id", async () => {
    apiCall.mockResolvedValue("")
    const dispatch = vi.fn()
    await deleteReport(3)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("DELETE", `${API}/reports/3`)
    expect(dispatch).toHaveBeenCalledWith(deleteReportSuccess(3))
  })
})
