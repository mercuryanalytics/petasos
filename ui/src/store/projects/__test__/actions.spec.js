import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the network boundary via the shared api-call mock (default export plus
// the isCalled/forget static helpers the thunks call).
vi.mock("../../../utils/api-call", async () => {
  const { makeApiCallMock } = await import("../../../test-utils/api-call-mock")
  return makeApiCallMock()
})

import apiCall from "../../../utils/api-call"
import Constants from "../../../utils/constants"
import {
  getProjects,
  getProjectsSuccess,
  getProjectsFailure,
  getOrphanProjects,
  getOrphanProjectsSuccess,
  getProject,
  getProjectSuccess,
  createProject,
  createProjectSuccess,
  createProjectFailure,
  updateProject,
  deleteProject,
  deleteProjectSuccess
} from "../actions"

const API = Constants.API_URL

beforeEach(() => {
  vi.clearAllMocks()
  apiCall.isCalled.mockReturnValue(false)
})

describe("projects plain action creators", () => {
  it("build { type, payload } actions", () => {
    expect(getProjectsSuccess([1])).toEqual({ type: "GET_PROJECTS_SUCCESS", payload: [1] })
    expect(getProjectsFailure("e")).toEqual({ type: "GET_PROJECTS_FAILURE", payload: "e" })
    expect(getOrphanProjectsSuccess([2])).toEqual({ type: "GET_ORPHAN_PROJECTS_SUCCESS", payload: [2] })
    expect(getProjectSuccess({ id: 1 })).toEqual({ type: "GET_PROJECT_SUCCESS", payload: { id: 1 } })
    expect(createProjectSuccess({ id: 2 })).toEqual({ type: "CREATE_PROJECT_SUCCESS", payload: { id: 2 } })
  })

  it("deleteProjectSuccess carries projectId", () => {
    expect(deleteProjectSuccess(9)).toEqual({ type: "DELETE_PROJECT_SUCCESS", projectId: 9 })
  })
})

describe("getProjects thunk", () => {
  it("builds a combined client_id + user_id query string", async () => {
    apiCall.mockResolvedValue([])
    await getProjects(1, 2)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/projects?client_id=1&user_id=2`)
  })

  it("normalizes a leading & to ? when only userId is present", async () => {
    apiCall.mockResolvedValue([])
    await getProjects(undefined, 2)(vi.fn())
    // "" + "&user_id=2" -> fixMultiQueryString -> "?user_id=2"
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/projects?user_id=2`)
  })

  it("dispatches success with the fetched projects", async () => {
    apiCall.mockResolvedValue([{ id: 1 }])
    const dispatch = vi.fn()
    await getProjects()(dispatch)
    expect(dispatch).toHaveBeenCalledWith(getProjectsSuccess([{ id: 1 }]))
  })
})

describe("getOrphanProjects thunk", () => {
  it("GETs the orphans endpoint", async () => {
    apiCall.mockResolvedValue([])
    await getOrphanProjects()(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/projects/orphans`)
  })
})

describe("getProject thunk", () => {
  it("force-fetches even when the cache says it was already called", async () => {
    apiCall.isCalled.mockReturnValue(true)
    apiCall.mockResolvedValue({ id: 1 })
    const dispatch = vi.fn()

    await getProject(1, null, true)(dispatch)

    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/projects/1`)
    expect(dispatch).toHaveBeenCalledWith(getProjectSuccess({ id: 1 }))
  })
})

describe("project CRUD thunks", () => {
  it("createProject POSTs a wrapped project body", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    await createProject({ name: "P" })(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("POST", `${API}/projects`, {
      body: JSON.stringify({ project: { name: "P" } })
    })
  })

  it("updateProject PATCHes by id", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    await updateProject(1, { name: "N" })(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("PATCH", `${API}/projects/1`, {
      body: JSON.stringify({ project: { name: "N" } })
    })
  })

  it("deleteProject DELETEs and dispatches success with the id", async () => {
    apiCall.mockResolvedValue("")
    const dispatch = vi.fn()
    await deleteProject(3)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("DELETE", `${API}/projects/3`)
    expect(dispatch).toHaveBeenCalledWith(deleteProjectSuccess(3))
  })

  it("dispatches failure and rejects on error", async () => {
    const error = { message: "x" }
    apiCall.mockRejectedValue(error)
    const dispatch = vi.fn()
    await expect(createProject({})(dispatch)).rejects.toBe(error)
    expect(dispatch).toHaveBeenCalledWith(createProjectFailure(error))
  })
})
