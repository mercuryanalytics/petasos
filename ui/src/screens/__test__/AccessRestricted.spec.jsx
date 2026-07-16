import React from "react"
import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"

import { renderWithProviders } from "../../test-utils"
import AccessRestricted from "../AccessRestricted"

describe("AccessRestricted", () => {
  it("renders the restricted message and a home link", () => {
    renderWithProviders(<AccessRestricted />)
    expect(screen.getByText("Access to this location is restricted.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/")
  })
})
