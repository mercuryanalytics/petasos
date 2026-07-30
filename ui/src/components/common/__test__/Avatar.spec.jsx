import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Avatar from "../Avatar"

describe("Avatar", () => {
  it("renders an image when an avatar url is given", () => {
    const { container } = render(<Avatar avatar="/me.png" />)
    expect(container.querySelector("img")).toHaveAttribute("src", "/me.png")
  })

  it("renders the acronym when there is no avatar", () => {
    render(<Avatar acronym="AP" />)
    expect(screen.getByText("AP")).toBeInTheDocument()
  })

  it("falls back to alt text when there is no avatar or acronym", () => {
    render(<Avatar alt="Guest" />)
    expect(screen.getByText("Guest")).toBeInTheDocument()
  })

  it("prefers the avatar image over the acronym", () => {
    const { container } = render(<Avatar avatar="/me.png" acronym="AP" />)
    expect(container.querySelector("img")).toBeInTheDocument()
    expect(screen.queryByText("AP")).not.toBeInTheDocument()
  })
})
