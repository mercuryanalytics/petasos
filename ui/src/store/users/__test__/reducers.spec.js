import { describe, it, expect } from "vitest"
import usersReducer, { sortUsers } from "../reducers"

const initialState = () => ({
  users: [],
  researchers: [],
  scopes: {},
  authorizations: {},
  authorizedUsers: {}
})

describe("usersReducer", () => {
  it("returns the initial state for an unknown action", () => {
    expect(usersReducer(undefined, { type: "@@INIT" })).toEqual(initialState())
  })

  it("returns the given state unchanged for an unknown action", () => {
    const state = { ...initialState(), users: [{ id: 1 }] }
    expect(usersReducer(state, { type: "NOPE" })).toBe(state)
  })

  describe("users list", () => {
    it("adds and sorts on GET_USERS_SUCCESS using contact_name then email", () => {
      const state = usersReducer(initialState(), {
        type: "GET_USERS_SUCCESS",
        payload: [
          { id: 1, email: "zed@x.com" },
          { id: 2, contact_name: "Anna", email: "anna@x.com" }
        ]
      })
      // Row 1 has no contact_name so sorts on "zed"; row 2 sorts on "Anna".
      expect(state.users.map(u => u.id)).toEqual([2, 1])
    })

    it("merges on UPDATE_USER_SUCCESS without adding new ids", () => {
      const start = { ...initialState(), users: [{ id: 1, contact_name: "Old", keep: true }] }
      const state = usersReducer(start, {
        type: "UPDATE_USER_SUCCESS",
        payload: { id: 1, contact_name: "New" }
      })
      expect(state.users).toEqual([{ id: 1, contact_name: "New", keep: true }])
    })

    it("removes a user on DELETE_USER_SUCCESS", () => {
      const start = { ...initialState(), users: [{ id: 1 }, { id: 2 }] }
      const state = usersReducer(start, { type: "DELETE_USER_SUCCESS", userId: 1 })
      expect(state.users).toEqual([{ id: 2 }])
    })
  })

  describe("scopes and authorizations", () => {
    it("merges into scopes on GET_SCOPES_SUCCESS", () => {
      const start = { ...initialState(), scopes: { a: 1 } }
      const state = usersReducer(start, { type: "GET_SCOPES_SUCCESS", payload: { b: 2 } })
      expect(state.scopes).toEqual({ a: 1, b: 2 })
    })

    it("stores authorizations under the user id on GET_USER_AUTHORIZATIONS_SUCCESS", () => {
      const state = usersReducer(initialState(), {
        type: "GET_USER_AUTHORIZATIONS_SUCCESS",
        userId: 3,
        payload: { client: [] }
      })
      expect(state.authorizations).toEqual({ 3: { client: [] } })
    })

    it("clears authorizations on RESET_USER_AUTHORIZATIONS", () => {
      const start = { ...initialState(), authorizations: { 3: { client: [] } } }
      const state = usersReducer(start, { type: "RESET_USER_AUTHORIZATIONS" })
      expect(state.authorizations).toEqual({})
    })
  })

  describe("authorized users", () => {
    it("keys authorized users by resType-resId@contextId on GET_AUTHORIZED_USERS_SUCCESS", () => {
      const state = usersReducer(initialState(), {
        type: "GET_AUTHORIZED_USERS_SUCCESS",
        contextId: 10,
        resPath: "clients",
        resId: 5,
        payload: [{ id: 1 }]
      })
      expect(state.authorizedUsers).toEqual({ "client-5@10": [{ id: 1 }] })
    })

    it("expands per-client rows and derives authorized on GET_ALL_AUTHORIZED_USERS_SUCCESS", () => {
      const state = usersReducer(initialState(), {
        type: "GET_ALL_AUTHORIZED_USERS_SUCCESS",
        resPath: "clients",
        resId: 0,
        payload: [{ id: 1, client_ids: [10, 20], authorized: [10] }]
      })
      expect(state.authorizedUsers["client-0@10"][0]).toMatchObject({ id: 1, client_ids: [10], authorized: true })
      expect(state.authorizedUsers["client-0@20"][0]).toMatchObject({ id: 1, client_ids: [20], authorized: false })
    })

    it("flips a specific user's authorized flag on AUTHORIZE_USER_SUCCESS", () => {
      const start = {
        ...initialState(),
        authorizedUsers: {
          "client-5@10": [
            { id: 1, authorized: false },
            { id: 2, authorized: false }
          ]
        }
      }
      const state = usersReducer(start, {
        type: "AUTHORIZE_USER_SUCCESS",
        userId: 1,
        contextId: 10,
        resPath: "clients",
        resId: 5,
        states: { authorized: true },
        isGlobal: false
      })
      expect(state.authorizedUsers["client-5@10"][0].authorized).toBe(true)
      // The other user is untouched.
      expect(state.authorizedUsers["client-5@10"][1].authorized).toBe(false)
    })
  })
})

describe("sortUsers", () => {
  it("orders by contact_name, falling back to email", () => {
    const sorted = sortUsers([
      { id: 1, email: "zed@x.com" },
      { id: 2, contact_name: "Anna", email: "anna@x.com" }
    ])
    expect(sorted.map(u => u.id)).toEqual([2, 1])
  })
})
