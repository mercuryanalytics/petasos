import React from "react"
import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"

import { renderWithProviders } from "../../test-utils"

import Login from "../Login"

// Mock only the non-component seams: getLogo (a module function Auth invokes)
// and the auth-config object. The real Auth component is rendered — in jsdom it
// is logged-out, so it shows the login form we assert against.
vi.mock("../../App", () => ({ getLogo: () => "logo.png" }))
vi.mock("../../auth-config", () => ({ default: { domain: "test" } }))

describe("Login", () => {
  it("renders the real login form for the login view", async () => {
    renderWithProviders(<Login />)
    // Title rendered by Auth for viewType=Login (distinct from the "Log In" button).
    expect(await screen.findByText("Login")).toBeInTheDocument()
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByText("Password")).toBeInTheDocument()
    expect(screen.getByText("Forgot password?")).toBeInTheDocument()
    expect(screen.getByText("Log In")).toBeInTheDocument()
  })
})
