import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import Textarea from "../Textarea"
import { makeField } from "../../../test-utils"

describe("Textarea", () => {
  it("renders a label and a textarea with the placeholder", () => {
    render(<Textarea field={makeField()} label="Notes" placeholder="Type here" />)
    expect(screen.getByText("Notes")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument()
  })

  it("renders the value as read-only text in preview mode", () => {
    render(<Textarea field={makeField({ input: { value: "Body" } })} preview />)
    expect(screen.getByText("Body")).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("shows N/A in preview mode when empty", () => {
    render(<Textarea field={makeField({ input: { value: "" } })} preview />)
    expect(screen.getByText("N/A")).toBeInTheDocument()
  })

  it("shows a validation error when submit failed", () => {
    render(<Textarea field={makeField({ meta: { submitFailed: true, error: "Required" } })} />)
    expect(screen.getByText("Required")).toBeInTheDocument()
  })

  it("pushes a controlled value prop into the field on mount", () => {
    const onChange = vi.fn()
    render(<Textarea field={makeField({ input: { onChange } })} value="seed" />)
    expect(onChange).toHaveBeenCalledWith("seed")
  })
})
