import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../components/Auth", () => ({ logout: vi.fn() }))
vi.mock("../../auth-config", () => ({ default: { domain: "test" } }))

import Logout from "../Logout"
import { logout } from "../../components/Auth"
import Constants from "../../utils/constants"

describe("Logout", () => {
  let replace
  beforeEach(() => {
    replace = vi.fn()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, replace }
    })
  })

  it("logs out through Auth and redirects to the app url", () => {
    Logout()
    expect(logout).toHaveBeenCalledWith(expect.objectContaining({ redirectTo: Constants.APP_URL }))
    expect(replace).toHaveBeenCalledWith(Constants.APP_URL)
  })
})
