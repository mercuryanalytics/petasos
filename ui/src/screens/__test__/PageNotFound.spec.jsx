import React from "react"
import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"

import { renderWithProviders } from "../../__test__/render"
import PageNotFound from "../PageNotFound"

describe("PageNotFound", () => {
  it("renders the not-found message and a home link", () => {
    renderWithProviders(<PageNotFound />)
    expect(screen.getByText("Page not found!")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/")
  })
})
