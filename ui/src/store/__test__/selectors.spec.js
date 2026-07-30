import { describe, it, expect } from "vitest"
import {
  ResourceTypes,
  UserRoles,
  isUserAuthorized,
  isUserSpecificallyAuthorized,
  isUserTemplateAuthorized
} from "../index"

// An authorization entry is [ { subject_id }, roles, scopes ]. Authorizations
// are keyed by user id, with an extra "global" bucket for global scopes.
describe("isUserAuthorized", () => {
  it("matches a write role via its read-role equivalent", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, ["client_editor"], []]] } }
    expect(isUserAuthorized(auth, 1, ResourceTypes.Client, 5, UserRoles.ClientManager)).toBe(true)
  })

  it("returns false when the resource id does not match", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, ["client_editor"], []]] } }
    expect(isUserAuthorized(auth, 1, ResourceTypes.Client, 999, UserRoles.ClientManager)).toBe(false)
  })

  it("returns false when the role is not granted", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, ["client_editor"], []]] } }
    expect(isUserAuthorized(auth, 1, ResourceTypes.Client, 5, UserRoles.ClientAdmin)).toBe(false)
  })

  it("matches a specific scope id on the resource", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, [], [{ id: 99 }]]] } }
    expect(isUserAuthorized(auth, 1, ResourceTypes.Client, 5, null, 99)).toBe(true)
  })

  it("matches a global scope by id", () => {
    const auth = { 1: { global: [{ id: 7 }] } }
    expect(isUserAuthorized(auth, 1, null, null, null, 7, true)).toBe(true)
  })

  it("matches a global scope by [branch, action] pair (super-user shape)", () => {
    const auth = { 1: { global: [{ scope: "admin", action: "admin" }] } }
    expect(isUserAuthorized(auth, 1, null, null, null, ["admin", "admin"], true)).toBe(true)
  })

  it("is authorized when the subject matches and neither role nor scope is required", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, [], []]] } }
    expect(isUserAuthorized(auth, 1, ResourceTypes.Client, 5)).toBe(true)
  })

  it("lets a Viewer inherit access from a *_access grant", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, ["client_access"], []]] } }
    expect(isUserAuthorized(auth, 1, ResourceTypes.Client, 5, UserRoles.Viewer)).toBe(true)
  })

  it("does not inherit access when queried specifically", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, ["client_access"], []]] } }
    expect(isUserSpecificallyAuthorized(auth, 1, ResourceTypes.Client, 5, UserRoles.Viewer)).toBe(false)
  })

  it("returns false for an unknown user", () => {
    const auth = { 1: { client: [[{ subject_id: 5 }, ["client_editor"], []]] } }
    expect(isUserAuthorized(auth, 2, ResourceTypes.Client, 5, UserRoles.ClientManager)).toBe(false)
  })
})

describe("isUserTemplateAuthorized", () => {
  const templates = () => ({
    7: {
      authorized: true,
      roles: ["client_editor"],
      projects: [
        {
          id: 100,
          authorized: false,
          roles: ["project_editor"],
          reports: [{ id: 200, authorized: true, roles: ["report_editor"] }]
        }
      ]
    }
  })

  it("returns the client authorized flag when no role is given", () => {
    expect(isUserTemplateAuthorized(templates(), 7, ResourceTypes.Client)).toBe(true)
  })

  it("checks a client role via its read-role equivalent", () => {
    expect(isUserTemplateAuthorized(templates(), 7, ResourceTypes.Client, null, UserRoles.ClientManager)).toBe(true)
  })

  it("returns a project's authorized flag by id", () => {
    expect(isUserTemplateAuthorized(templates(), 7, ResourceTypes.Project, 100)).toBe(false)
  })

  it("checks a project role by id", () => {
    expect(isUserTemplateAuthorized(templates(), 7, ResourceTypes.Project, 100, UserRoles.ProjectManager)).toBe(true)
  })

  it("returns a nested report's authorized flag by id", () => {
    expect(isUserTemplateAuthorized(templates(), 7, ResourceTypes.Report, 200)).toBe(true)
  })

  it("returns false for an unknown client", () => {
    expect(isUserTemplateAuthorized(templates(), 999, ResourceTypes.Client)).toBe(false)
  })
})
