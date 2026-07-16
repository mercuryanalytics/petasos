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
  getUsers,
  getUsersSuccess,
  getUser,
  getUserSuccess,
  createUser,
  createUserSuccess,
  updateUser,
  updateUserSuccess,
  deleteUser,
  deleteUserSuccess,
  getUserAuthorizations,
  getUserAuthorizationsSuccess,
  resetUserAuthorizations,
  getAuthorizedUsers,
  getAuthorizedUsersSuccess,
  getAllAuthorizedUsersSuccess
} from "../actions"

const API = Constants.API_URL

beforeEach(() => {
  vi.clearAllMocks()
  apiCall.isCalled.mockReturnValue(false)
})

describe("users plain action creators", () => {
  it("build their actions", () => {
    expect(getUsersSuccess([1])).toEqual({ type: "GET_USERS_SUCCESS", payload: [1] })
    expect(getUserSuccess({ id: 1 })).toEqual({ type: "GET_USER_SUCCESS", payload: { id: 1 } })
    expect(createUserSuccess({ id: 2 })).toEqual({ type: "CREATE_USER_SUCCESS", payload: { id: 2 } })
    expect(updateUserSuccess({ id: 3 })).toEqual({ type: "UPDATE_USER_SUCCESS", payload: { id: 3 } })
  })

  it("deleteUserSuccess carries userId", () => {
    expect(deleteUserSuccess(9)).toEqual({ type: "DELETE_USER_SUCCESS", userId: 9 })
  })

  it("authorization creators keep userId", () => {
    expect(getUserAuthorizationsSuccess({ a: 1 }, 3)).toEqual({
      type: "GET_USER_AUTHORIZATIONS_SUCCESS",
      payload: { a: 1 },
      userId: 3
    })
    expect(resetUserAuthorizations(3)).toEqual({ type: "RESET_USER_AUTHORIZATIONS", payload: {}, userId: 3 })
  })

  it("authorized-users creators carry their context", () => {
    expect(getAuthorizedUsersSuccess([1], 10, "clients", 5)).toEqual({
      type: "GET_AUTHORIZED_USERS_SUCCESS",
      payload: [1],
      contextId: 10,
      resPath: "clients",
      resId: 5
    })
    expect(getAllAuthorizedUsersSuccess([1], "clients", 5)).toEqual({
      type: "GET_ALL_AUTHORIZED_USERS_SUCCESS",
      payload: [1],
      resPath: "clients",
      resId: 5
    })
  })
})

describe("getUsers / getUser thunks", () => {
  it("getUsers appends client_id when given", async () => {
    apiCall.mockResolvedValue([])
    await getUsers(7)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/users?client_id=7`)
  })

  it("getUsers force-fetches even when cached", async () => {
    apiCall.isCalled.mockReturnValue(true)
    apiCall.mockResolvedValue([])
    await getUsers(undefined, true)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/users`)
  })

  it("getUser GETs a single user by id", async () => {
    apiCall.mockResolvedValue({ id: 5 })
    const dispatch = vi.fn()
    await getUser(5)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/users/5`)
    expect(dispatch).toHaveBeenCalledWith(getUserSuccess({ id: 5 }))
  })
})

describe("user CRUD thunks", () => {
  it("createUser POSTs a wrapped user body and forgets stale authorized caches", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    const dispatch = vi.fn()

    await createUser({ email: "a@b.com" })(dispatch)

    expect(apiCall).toHaveBeenCalledWith("POST", `${API}/users`, {
      body: JSON.stringify({ user: { email: "a@b.com" } })
    })
    expect(apiCall.forget).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(createUserSuccess({ id: 1 }))
  })

  it("createUser folds in client_id and the no_auth flag", async () => {
    apiCall.mockResolvedValue({})
    await createUser({ email: "a@b.com" }, 7, true)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("POST", `${API}/users?no_auth=1`, {
      body: JSON.stringify({ user: { email: "a@b.com" }, client_id: 7 })
    })
  })

  it("updateUser PATCHes by id", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    await updateUser(1, { email: "x" })(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("PATCH", `${API}/users/1`, {
      body: JSON.stringify({ user: { email: "x" } })
    })
  })

  it("deleteUser DELETEs (with client_id) and dispatches success with the id", async () => {
    apiCall.mockResolvedValue("")
    const dispatch = vi.fn()
    await deleteUser(3, 7)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("DELETE", `${API}/users/3?client_id=7`)
    expect(dispatch).toHaveBeenCalledWith(deleteUserSuccess(3))
  })
})

describe("authorization thunks", () => {
  it("getUserAuthorizations GETs /users/:id/authorized and dispatches with id", async () => {
    apiCall.mockResolvedValue({ client: [] })
    const dispatch = vi.fn()
    await getUserAuthorizations(3)(dispatch)
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/users/3/authorized`)
    expect(dispatch).toHaveBeenCalledWith(getUserAuthorizationsSuccess({ client: [] }, 3))
  })

  it("getAuthorizedUsers resolves the resource path from the res descriptor", async () => {
    apiCall.mockResolvedValue([{ id: 1 }])
    const dispatch = vi.fn()

    await getAuthorizedUsers(10, { clientId: 5 })(dispatch)

    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/clients/5/authorized?client_id=10`)
    expect(dispatch).toHaveBeenCalledWith(getAuthorizedUsersSuccess([{ id: 1 }], 10, "clients", 5))
  })
})
