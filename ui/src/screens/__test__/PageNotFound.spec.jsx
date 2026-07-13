import React from "react"
import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import PageNotFound from "../PageNotFound"
import { renderWithProviders } from "../../test-utils"

describe("PageNotFound", () => {
  it("renders the not-found message and a home link", () => {
    renderWithProviders(<PageNotFound />)
    expect(screen.getByText("Page not found!")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/")
  })
})
