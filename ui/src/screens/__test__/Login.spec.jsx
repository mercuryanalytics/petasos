import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderWithProviders } from "../../test-utils"

// Capture the props Login hands to the Auth component instead of rendering the
// real auth0 flow.
const h = vi.hoisted(() => ({ props: null }))
vi.mock("../../components/Auth", () => ({
  default: props => {
    h.props = props
    return null
  },
  AuthViewTypes: { Login: "login", ChangePassword: "change-password" },
  isLoggedIn: () => false
}))
vi.mock("../../App", () => ({ getLogo: () => "logo.png" }))
vi.mock("../../auth-config", () => ({ default: { domain: "test" } }))

import Login from "../Login"
import Routes from "../../utils/routes"

describe("Login", () => {
  it("renders the Auth component configured for login", () => {
    renderWithProviders(<Login />)
    expect(h.props).not.toBeNull()
    expect(h.props.viewType).toBe("login")
    expect(h.props.redirectTo).toBe(Routes.Home)
    expect(typeof h.props.logoSrc).toBe("function")
    expect(typeof h.props.onSuccess).toBe("function")
    expect(typeof h.props.passwordResetHandler).toBe("function")
  })
})
