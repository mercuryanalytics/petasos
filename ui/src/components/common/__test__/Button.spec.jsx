import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Button from "../Button"
import { renderWithProviders } from "../../../__test__/render"

describe("Button", () => {
  it("renders a native button and fires onClick", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole("button", { name: "Save" })
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
  })

  it("renders a mailto anchor", () => {
    render(<Button mailto="a@b.com">Email</Button>)
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:a@b.com")
  })

  it("prefixes a protocol-less external link with http://", () => {
    render(<Button link="example.com">Visit</Button>)
    expect(screen.getByRole("link", { name: "Visit" })).toHaveAttribute("href", "http://example.com")
  })

  it("renders a router Link for the `to` prop", () => {
    renderWithProviders(<Button to="/account">Account</Button>)
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account")
  })

  it("renders a loader while loading", () => {
    const { container } = render(<Button loading>Save</Button>)
    expect(container.querySelector("[data-app-loader]")).toBeInTheDocument()
  })
})
