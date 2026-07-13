import React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import Search from "../Search"

afterEach(() => {
  vi.useRealTimers()
})

describe("Search", () => {
  it("renders an input with the placeholder", () => {
    render(<Search id="s0" placeholder="Search clients" targets={[]} />)
    expect(screen.getByPlaceholderText("Search clients")).toBeInTheDocument()
  })

  it("calls onSearch with the typed value after the debounce", () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(<Search id="s1" placeholder="Search" onSearch={onSearch} targets={[]} />)

    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "abc" } })
    expect(onSearch).not.toHaveBeenCalled() // debounced

    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(onSearch).toHaveBeenCalledWith("abc", [])
  })

  it("reveals search targets on focus", () => {
    render(<Search id="s2" placeholder="Search" targets={[{ key: "name", label: "Name" }]} />)
    fireEvent.focus(screen.getByPlaceholderText("Search"))
    expect(screen.getByText("Search for")).toBeInTheDocument()
    expect(screen.getByText("Name")).toBeInTheDocument()
  })
})
