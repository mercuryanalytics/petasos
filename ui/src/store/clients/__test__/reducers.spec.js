import { describe, it, expect } from "vitest"
import clientsReducer, { sortClients } from "../reducers"

const initialState = () => ({ clients: [], domains: [], templates: {} })

describe("clientsReducer", () => {
  it("returns the initial state for an unknown action", () => {
    const state = clientsReducer(undefined, { type: "@@INIT" })
    expect(state).toEqual({ clients: [], domains: [], templates: {} })
  })

  it("returns the given state unchanged for an unknown action", () => {
    const state = { clients: [{ id: 1 }], domains: [], templates: {} }
    expect(clientsReducer(state, { type: "NOPE" })).toBe(state)
  })

  describe("clients list", () => {
    it("adds and name-sorts clients on GET_CLIENTS_SUCCESS", () => {
      const state = clientsReducer(initialState(), {
        type: "GET_CLIENTS_SUCCESS",
        payload: [
          { id: 1, name: "Zebra" },
          { id: 2, name: "apple" }
        ]
      })
      expect(state.clients.map(c => c.name)).toEqual(["apple", "Zebra"])
    })

    it("merges into an existing client on UPDATE_CLIENT_SUCCESS without adding new ones", () => {
      const start = { ...initialState(), clients: [{ id: 1, name: "Old", keep: true }] }
      const state = clientsReducer(start, {
        type: "UPDATE_CLIENT_SUCCESS",
        payload: { id: 1, name: "New" }
      })
      expect(state.clients).toEqual([{ id: 1, name: "New", keep: true }])
    })

    it("removes a client on DELETE_CLIENT_SUCCESS", () => {
      const start = { ...initialState(), clients: [{ id: 1 }, { id: 2 }] }
      const state = clientsReducer(start, { type: "DELETE_CLIENT_SUCCESS", clientId: 1 })
      expect(state.clients).toEqual([{ id: 2 }])
    })
  })

  describe("templates", () => {
    it("stores templates under their client id on GET_TEMPLATES_SUCCESS", () => {
      const state = clientsReducer(initialState(), {
        type: "GET_TEMPLATES_SUCCESS",
        clientId: 7,
        payload: { roles: [], projects: [] }
      })
      expect(state.templates).toEqual({ 7: { roles: [], projects: [] } })
    })

    it("is a no-op on UPDATE_TEMPLATE_SUCCESS when the client has no templates", () => {
      const start = initialState()
      const state = clientsReducer(start, {
        type: "UPDATE_TEMPLATE_SUCCESS",
        clientId: 7,
        data: { resource_type: "client", state: true }
      })
      expect(state).toBe(start)
    })

    it("toggles client authorization and adds the mapped read-role", () => {
      const start = {
        ...initialState(),
        templates: { 7: { authorized: false, roles: [], projects: [] } }
      }
      const state = clientsReducer(start, {
        type: "UPDATE_TEMPLATE_SUCCESS",
        clientId: 7,
        data: {
          resource_type: "client",
          state: true,
          role: "client_manager",
          role_state: true
        }
      })
      expect(state.templates[7].authorized).toBe(true)
      // client_manager -> client_editor via UserRolesWriteToRead
      expect(state.templates[7].roles).toContain("client_editor")
    })

    it("removes the mapped read-role when role_state is false", () => {
      const start = {
        ...initialState(),
        templates: { 7: { authorized: true, roles: ["client_editor"], projects: [] } }
      }
      const state = clientsReducer(start, {
        type: "UPDATE_TEMPLATE_SUCCESS",
        clientId: 7,
        data: {
          resource_type: "client",
          state: true,
          role: "client_manager",
          role_state: false
        }
      })
      expect(state.templates[7].roles).not.toContain("client_editor")
    })

    it("updates a matching project template", () => {
      const start = {
        ...initialState(),
        templates: {
          7: {
            authorized: true,
            roles: [],
            projects: [{ id: 100, authorized: false, roles: [], reports: [] }]
          }
        }
      }
      const state = clientsReducer(start, {
        type: "UPDATE_TEMPLATE_SUCCESS",
        clientId: 7,
        data: { resource_type: "project", resource_id: 100, state: true }
      })
      expect(state.templates[7].projects[0].authorized).toBe(true)
    })

    it("updates a matching report template nested under a project", () => {
      const start = {
        ...initialState(),
        templates: {
          7: {
            authorized: true,
            roles: [],
            projects: [
              {
                id: 100,
                authorized: true,
                roles: [],
                reports: [{ id: 200, authorized: false, roles: [] }]
              }
            ]
          }
        }
      }
      const state = clientsReducer(start, {
        type: "UPDATE_TEMPLATE_SUCCESS",
        clientId: 7,
        data: { resource_type: "report", resource_id: 200, state: true }
      })
      expect(state.templates[7].projects[0].reports[0].authorized).toBe(true)
    })
  })

  describe("domains", () => {
    it("adds a domain on CREATE_DOMAIN_SUCCESS", () => {
      const state = clientsReducer(initialState(), {
        type: "CREATE_DOMAIN_SUCCESS",
        payload: { id: 1, name: "acme.com" }
      })
      expect(state.domains).toEqual([{ id: 1, name: "acme.com" }])
    })

    it("removes a domain on DELETE_DOMAIN_SUCCESS", () => {
      const start = { ...initialState(), domains: [{ id: 1 }, { id: 2 }] }
      const state = clientsReducer(start, { type: "DELETE_DOMAIN_SUCCESS", domainId: 2 })
      expect(state.domains).toEqual([{ id: 1 }])
    })
  })
})

describe("sortClients", () => {
  it("orders clients ascending by name, case-insensitively", () => {
    const sorted = sortClients([{ name: "beta" }, { name: "Alpha" }, { name: "gamma" }])
    expect(sorted.map(c => c.name)).toEqual(["Alpha", "beta", "gamma"])
  })
})
