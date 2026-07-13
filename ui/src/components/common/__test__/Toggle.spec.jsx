import React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import Toggle from "../Toggle"

afterEach(() => {
  vi.useRealTimers()
})

describe("Toggle", () => {
  it("renders a checkbox reflecting the checked prop", () => {
    render(<Toggle id="t0" checked={true} />)
    expect(screen.getByRole("checkbox")).toBeChecked()
  })

  it("calls onChange with the new state after the throttle window", () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<Toggle id="t1" checked={false} onChange={onChange} />)

    fireEvent.click(screen.getByRole("checkbox"))
    expect(onChange).not.toHaveBeenCalled() // throttled

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
