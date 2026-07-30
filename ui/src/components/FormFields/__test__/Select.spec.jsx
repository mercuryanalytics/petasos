import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { makeField } from "../../../__test__/form"
import Select from "../Select"

const options = [
  { value: "a", text: "Apple" },
  { value: "b", text: "Banana" }
]

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Select field={makeField()} options={options} placeholder="Pick one" />)
    expect(screen.getByText("Pick one")).toBeInTheDocument()
  })

  it("reflects the field value as the selected option text", () => {
    render(<Select field={makeField({ input: { value: "b" } })} options={options} />)
    expect(screen.getByText("Banana")).toBeInTheDocument()
  })

  it("opens the option list on click and selects an option", async () => {
    const onChange = vi.fn()
    render(<Select field={makeField({ input: { onChange } })} options={options} placeholder="Pick" />)

    await userEvent.click(screen.getByText("Pick"))
    await userEvent.click(screen.getByText("Apple"))

    expect(onChange).toHaveBeenCalledWith("a")
  })

  it("does not open when disabled", async () => {
    render(<Select field={makeField()} options={options} placeholder="Pick" disabled />)
    await userEvent.click(screen.getByText("Pick"))
    // Options only render when open; Banana should remain hidden.
    expect(screen.queryByText("Banana")).not.toBeInTheDocument()
  })

  it("shows the selected text in preview mode", () => {
    render(<Select field={makeField({ input: { value: "a" } })} options={options} preview />)
    expect(screen.getByText("Apple")).toBeInTheDocument()
  })
})
