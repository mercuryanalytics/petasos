import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { makeField } from "../../../__test__/form"
import Input from "../Input"

describe("Input", () => {
  it("renders a label and a text input with the placeholder", () => {
    render(<Input field={makeField()} label="Email" placeholder="you@example.com" />)
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })

  it("forwards typing to the field's onChange", async () => {
    const onChange = vi.fn()
    render(<Input field={makeField({ input: { onChange } })} placeholder="name" />)
    await userEvent.type(screen.getByPlaceholderText("name"), "a")
    expect(onChange).toHaveBeenCalled()
  })

  it("renders the value as read-only text in preview mode", () => {
    render(<Input field={makeField({ input: { value: "Hello" } })} preview />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("shows N/A in preview mode when the value is empty", () => {
    render(<Input field={makeField({ input: { value: "" } })} preview />)
    expect(screen.getByText("N/A")).toBeInTheDocument()
  })

  it("shows a validation error once the field is dirty", () => {
    render(<Input field={makeField({ meta: { dirty: true, error: "Required" } })} />)
    expect(screen.getByText("Required")).toBeInTheDocument()
  })

  it("hides the error while pristine and not submitted", () => {
    render(<Input field={makeField({ meta: { dirty: false, submitFailed: false, error: "Required" } })} />)
    expect(screen.queryByText("Required")).not.toBeInTheDocument()
  })

  it("renders each error of a JSON-array error string", () => {
    const error = JSON.stringify(["Too short", "No spaces"])
    render(<Input field={makeField({ meta: { submitFailed: true, error } })} />)
    expect(screen.getByText("Too short")).toBeInTheDocument()
    expect(screen.getByText("No spaces")).toBeInTheDocument()
  })

  it("pushes a controlled value prop into the field on mount", () => {
    const onChange = vi.fn()
    render(<Input field={makeField({ input: { onChange } })} value="seed" />)
    expect(onChange).toHaveBeenCalledWith("seed")
  })
})
