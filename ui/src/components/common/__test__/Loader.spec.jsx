import React from "react"
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import Loader from "../Loader"

const segmentCount = container => container.querySelector("[data-app-loader] > div").children.length

describe("Loader", () => {
  it("renders three segments by default", () => {
    const { container } = render(<Loader />)
    expect(segmentCount(container)).toBe(3)
  })

  it("renders one segment per size unit", () => {
    const { container } = render(<Loader size={5} />)
    expect(segmentCount(container)).toBe(5)
  })

  it("marks the loader element for app-wide detection", () => {
    const { container } = render(<Loader />)
    expect(container.querySelector("[data-app-loader]")).toBeInTheDocument()
  })
})
