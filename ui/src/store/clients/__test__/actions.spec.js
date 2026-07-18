import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the network boundary via the shared api-call mock (default export plus
// the isCalled/forget static helpers the thunks call).
vi.mock("../../../utils/api-call", async () => {
  const { makeApiCallMock } = await import("../../../__test__/api-call-mock")
  return makeApiCallMock()
})

// Real helpers (hasValue/handleActionFailure) but a controllable queryState so
// the cached-read branch can be driven without a real store.
vi.mock("../../index", async importOriginal => {
  const actual = await importOriginal()
  return { ...actual, queryState: vi.fn() }
})

import apiCall from "../../../utils/api-call"
import Constants from "../../../utils/constants"
import { queryState } from "../../index"
import {
  getClients,
  getClientsFromSA,
  getClientsSuccess,
  getClientsFailure,
  getClientSuccess,
  createClient,
  createClientSuccess,
  createClientFailure,
  updateClient,
  updateClientSuccess,
  deleteClient,
  deleteClientSuccess,
  deleteClientFailure,
  getTemplates,
  getTemplatesSuccess,
  updateTemplateSuccess,
  getDomainsSuccess,
  createDomain,
  createDomainSuccess,
  deleteDomain,
  deleteDomainSuccess
} from "../actions"

const API = Constants.API_URL

beforeEach(() => {
  vi.clearAllMocks()
  apiCall.isCalled.mockReturnValue(false)
})

describe("clients plain action creators", () => {
  it("getClientsSuccess / getClientsFailure", () => {
    expect(getClientsSuccess([1])).toEqual({ type: "GET_CLIENTS_SUCCESS", payload: [1] })
    expect(getClientsFailure("e")).toEqual({ type: "GET_CLIENTS_FAILURE", payload: "e" })
  })

  it("getClientSuccess / createClientSuccess / updateClientSuccess", () => {
    expect(getClientSuccess({ id: 1 })).toEqual({ type: "GET_CLIENT_SUCCESS", payload: { id: 1 } })
    expect(createClientSuccess({ id: 2 })).toEqual({ type: "CREATE_CLIENT_SUCCESS", payload: { id: 2 } })
    expect(updateClientSuccess({ id: 3 })).toEqual({ type: "UPDATE_CLIENT_SUCCESS", payload: { id: 3 } })
  })

  it("deleteClientSuccess carries clientId (not payload)", () => {
    expect(deleteClientSuccess(9)).toEqual({ type: "DELETE_CLIENT_SUCCESS", clientId: 9 })
  })

  it("deleteClientFailure carries both error and clientId", () => {
    expect(deleteClientFailure("e", 9)).toEqual({ type: "DELETE_CLIENT_FAILURE", payload: "e", clientId: 9 })
  })

  it("getTemplatesSuccess / updateTemplateSuccess keep clientId", () => {
    expect(getTemplatesSuccess({ a: 1 }, 7)).toEqual({ type: "GET_TEMPLATES_SUCCESS", payload: { a: 1 }, clientId: 7 })
    expect(updateTemplateSuccess("d", { role: "x" }, 7)).toEqual({
      type: "UPDATE_TEMPLATE_SUCCESS",
      payload: "d",
      data: { role: "x" },
      clientId: 7
    })
  })

  it("domain creators", () => {
    expect(getDomainsSuccess([1])).toEqual({ type: "GET_DOMAINS_SUCCESS", payload: [1] })
    expect(createDomainSuccess({ id: 1 })).toEqual({ type: "CREATE_DOMAIN_SUCCESS", payload: { id: 1 } })
    expect(deleteDomainSuccess(4)).toEqual({ type: "DELETE_DOMAIN_SUCCESS", domainId: 4 })
  })
})

describe("getClients thunk", () => {
  it("GETs the clients endpoint and dispatches success when not cached", async () => {
    apiCall.mockResolvedValue([{ id: 1 }])
    const dispatch = vi.fn()

    await getClients()(dispatch)

    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/clients`)
    expect(queryState).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(getClientsSuccess([{ id: 1 }]))
  })

  it("appends the user_id query string when a userId is given", async () => {
    apiCall.mockResolvedValue([])
    await getClients(42)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/clients?user_id=42`)
  })

  it("reads from cached state (queryState) instead of fetching when already called", async () => {
    apiCall.isCalled.mockReturnValue(true)
    queryState.mockResolvedValue([{ id: 5 }])
    const dispatch = vi.fn()

    await getClients()(dispatch)

    expect(apiCall).not.toHaveBeenCalled()
    expect(queryState).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(getClientsSuccess([{ id: 5 }]))
  })
})

describe("getClientsFromSA thunk", () => {
  it("always GETs regardless of cache", async () => {
    apiCall.isCalled.mockReturnValue(true)
    apiCall.mockResolvedValue([])
    await getClientsFromSA()(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/clients`)
  })
})

describe("client CRUD thunks", () => {
  it("createClient POSTs a wrapped client body", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    const dispatch = vi.fn()

    await createClient({ name: "Acme" })(dispatch)

    expect(apiCall).toHaveBeenCalledWith("POST", `${API}/clients`, {
      body: JSON.stringify({ client: { name: "Acme" } })
    })
    expect(dispatch).toHaveBeenCalledWith(createClientSuccess({ id: 1 }))
  })

  it("updateClient PATCHes the client by id", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    await updateClient(1, { name: "New" })(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("PATCH", `${API}/clients/1`, {
      body: JSON.stringify({ client: { name: "New" } })
    })
  })

  it("deleteClient DELETEs and dispatches success with the id", async () => {
    apiCall.mockResolvedValue("")
    const dispatch = vi.fn()

    await deleteClient(3)(dispatch)

    expect(apiCall).toHaveBeenCalledWith("DELETE", `${API}/clients/3`)
    expect(dispatch).toHaveBeenCalledWith(deleteClientSuccess(3))
  })

  it("dispatches failure and rejects when a call fails", async () => {
    const error = { message: "boom" }
    apiCall.mockRejectedValue(error)
    const dispatch = vi.fn()

    await expect(createClient({})(dispatch)).rejects.toBe(error)
    expect(dispatch).toHaveBeenCalledWith(createClientFailure(error))
  })
})

describe("template and domain thunks", () => {
  it("getTemplates GETs the client's templates and dispatches with clientId", async () => {
    apiCall.mockResolvedValue({ roles: [] })
    const dispatch = vi.fn()

    await getTemplates(7)(dispatch)

    expect(apiCall).toHaveBeenCalledWith("GET", `${API}/clients/7/templates`)
    expect(dispatch).toHaveBeenCalledWith(getTemplatesSuccess({ roles: [] }, 7))
  })

  it("createDomain POSTs to the client's domains endpoint", async () => {
    apiCall.mockResolvedValue({ id: 1 })
    await createDomain({ name: "acme.com" }, 7)(vi.fn())
    expect(apiCall).toHaveBeenCalledWith("POST", `${API}/clients/7/domains`, {
      body: JSON.stringify({ name: "acme.com" })
    })
  })

  it("deleteDomain DELETEs and dispatches success with the domain id", async () => {
    apiCall.mockResolvedValue("")
    const dispatch = vi.fn()

    await deleteDomain(4, 7)(dispatch)

    expect(apiCall).toHaveBeenCalledWith("DELETE", `${API}/clients/7/domains/4`)
    expect(dispatch).toHaveBeenCalledWith(deleteDomainSuccess(4))
  })
})
