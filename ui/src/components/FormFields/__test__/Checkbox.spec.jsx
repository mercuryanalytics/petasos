import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Checkbox from "../Checkbox"
import { makeField } from "../../../__test__/form"

describe("Checkbox", () => {
  it("renders its label", () => {
    render(<Checkbox field={makeField()} label="Accept terms" />)
    expect(screen.getByText("Accept terms")).toBeInTheDocument()
  })

  it("renders no checkbox in preview mode", () => {
    const { container } = render(<Checkbox field={makeField()} label="x" preview />)
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    expect(container.textContent).toBe("")
  })

  it("calls the bare onChange handler when no field is supplied", async () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange} checked={false} label="Toggle" />)
    await userEvent.click(screen.getByRole("checkbox"))
    expect(onChange).toHaveBeenCalled()
  })

  it("syncs a controlled checked prop into the field", () => {
    const onChange = vi.fn()
    render(<Checkbox field={makeField({ input: { onChange } })} checked={true} label="x" />)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("shows a validation error when dirty", () => {
    render(<Checkbox field={makeField({ meta: { dirty: true, error: "Must accept" } })} label="x" />)
    expect(screen.getByText("Must accept")).toBeInTheDocument()
  })
})
