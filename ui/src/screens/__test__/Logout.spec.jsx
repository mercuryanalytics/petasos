import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import { logout } from "../../components/Auth"
import Constants from "../../utils/constants"

import Logout from "../Logout"

vi.mock("../../components/Auth", () => ({ logout: vi.fn() }))
vi.mock("../../auth-config", () => ({ default: { domain: "test" } }))

describe("Logout", () => {
  let replace
  let originalLocation
  beforeEach(() => {
    replace = vi.fn()
    originalLocation = Object.getOwnPropertyDescriptor(window, "location")
    Object.defineProperty(window, "location", {
      configurable: true,
      // jsdom's Location props live on the prototype, so a spread would copy
      // nothing — replace the object wholesale. Logout only reads `replace`.
      value: { replace }
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "location", originalLocation)
  })

  it("logs out through Auth and redirects to the app url", () => {
    Logout()
    expect(logout).toHaveBeenCalledWith(expect.objectContaining({ redirectTo: Constants.APP_URL }))
    expect(replace).toHaveBeenCalledWith(Constants.APP_URL)
  })
})
