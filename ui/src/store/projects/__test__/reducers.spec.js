import { describe, it, expect } from "vitest"
import projectsReducer, { sortProjects } from "../reducers"

const initialState = () => ({ projects: [], orphans: [] })

describe("projectsReducer", () => {
  it("returns the initial state for an unknown action", () => {
    expect(projectsReducer(undefined, { type: "@@INIT" })).toEqual({ projects: [], orphans: [] })
  })

  it("returns the given state unchanged for an unknown action", () => {
    const state = { projects: [{ id: 1 }], orphans: [] }
    expect(projectsReducer(state, { type: "NOPE" })).toBe(state)
  })

  it("adds and date-sorts (newest first) on GET_PROJECTS_SUCCESS", () => {
    const state = projectsReducer(initialState(), {
      type: "GET_PROJECTS_SUCCESS",
      payload: [
        { id: 1, updated_at: "2020-01-01" },
        { id: 2, updated_at: "2022-01-01" },
        { id: 3, updated_at: "2021-01-01" }
      ]
    })
    expect(state.projects.map(p => p.id)).toEqual([2, 3, 1])
  })

  it("populates both projects and orphans on GET_ORPHAN_PROJECTS_SUCCESS", () => {
    const state = projectsReducer(initialState(), {
      type: "GET_ORPHAN_PROJECTS_SUCCESS",
      payload: [{ id: 5, updated_at: "2021-01-01" }]
    })
    expect(state.projects.map(p => p.id)).toEqual([5])
    expect(state.orphans.map(p => p.id)).toEqual([5])
  })

  it("merges on UPDATE_PROJECT_SUCCESS without adding new ids", () => {
    const start = { ...initialState(), projects: [{ id: 1, name: "Old", keep: true }] }
    const state = projectsReducer(start, {
      type: "UPDATE_PROJECT_SUCCESS",
      payload: { id: 1, name: "New" }
    })
    expect(state.projects).toEqual([{ id: 1, name: "New", keep: true }])
  })

  it("removes a project on DELETE_PROJECT_SUCCESS", () => {
    const start = { ...initialState(), projects: [{ id: 1 }, { id: 2 }] }
    const state = projectsReducer(start, { type: "DELETE_PROJECT_SUCCESS", projectId: 1 })
    expect(state.projects).toEqual([{ id: 2 }])
  })
})

describe("sortProjects", () => {
  it("orders projects by updated_at descending", () => {
    const sorted = sortProjects([
      { id: 1, updated_at: "2019-05-01" },
      { id: 2, updated_at: "2023-05-01" }
    ])
    expect(sorted.map(p => p.id)).toEqual([2, 1])
  })
})
