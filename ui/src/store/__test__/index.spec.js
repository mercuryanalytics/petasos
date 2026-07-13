import { describe, it, expect } from "vitest"
import {
  pushToStack,
  orderStack,
  filterStack,
  hasValue,
  fixMultiQueryString,
  UserRolesWriteToRead,
  UserRoles
} from "../index"

describe("pushToStack", () => {
  it("returns the stack untouched when data is falsy", () => {
    const stack = [{ id: 1 }]
    expect(pushToStack(stack, null)).toBe(stack)
    expect(pushToStack(stack, undefined)).toBe(stack)
  })

  it("appends a new single item", () => {
    const result = pushToStack([{ id: 1 }], { id: 2, name: "x" })
    expect(result).toEqual([{ id: 1 }, { id: 2, name: "x" }])
  })

  it("accepts an array of items", () => {
    const result = pushToStack([], [{ id: 1 }, { id: 2 }])
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  it("merges (does not duplicate) an item whose id already exists", () => {
    const result = pushToStack([{ id: 1, name: "a", keep: true }], { id: 1, name: "b" })
    expect(result).toEqual([{ id: 1, name: "b", keep: true }])
  })

  it("de-dupes repeated ids within the same batch, keeping the first", () => {
    const result = pushToStack(
      [],
      [
        { id: 1, name: "first" },
        { id: 1, name: "second" }
      ]
    )
    expect(result).toEqual([{ id: 1, name: "first" }])
  })

  it("updateOnly merges existing but never appends new ids", () => {
    const result = pushToStack(
      [{ id: 1, v: 1 }],
      [
        { id: 1, v: 2 },
        { id: 9, v: 9 }
      ],
      { updateOnly: true }
    )
    expect(result).toEqual([{ id: 1, v: 2 }])
  })

  it("deleteOnly removes a matching id", () => {
    const result = pushToStack([{ id: 1 }, { id: 2 }, { id: 3 }], { id: 2 }, { deleteOnly: true })
    expect(result).toEqual([{ id: 1 }, { id: 3 }])
  })

  it("returns the same reference when nothing changes", () => {
    const stack = [{ id: 1 }]
    // updateOnly against a non-existent id is a no-op.
    expect(pushToStack(stack, { id: 2 }, { updateOnly: true })).toBe(stack)
  })

  it("does not mutate the original stack when appending", () => {
    const stack = [{ id: 1 }]
    pushToStack(stack, { id: 2 })
    expect(stack).toEqual([{ id: 1 }])
  })
})

describe("orderStack", () => {
  it("sorts ascending by a string property, case-insensitively", () => {
    const result = orderStack([{ name: "Charlie" }, { name: "alice" }, { name: "Bob" }], { valueProperty: "name" })
    expect(result.map(r => r.name)).toEqual(["alice", "Bob", "Charlie"])
  })

  it("sorts descending when requested", () => {
    const result = orderStack([{ name: "a" }, { name: "c" }, { name: "b" }], {
      valueProperty: "name",
      descending: true
    })
    expect(result.map(r => r.name)).toEqual(["c", "b", "a"])
  })

  it("applies a valueFormatter before comparing (e.g. dates newest-first)", () => {
    const result = orderStack(
      [{ updated_at: "2020-01-01" }, { updated_at: "2022-01-01" }, { updated_at: "2021-01-01" }],
      {
        valueProperty: "updated_at",
        descending: true,
        valueFormatter: value => (value ? +new Date(value) : 0)
      }
    )
    expect(result.map(r => r.updated_at)).toEqual(["2022-01-01", "2021-01-01", "2020-01-01"])
  })

  it("falls back through a list of properties, using the first truthy one", () => {
    const result = orderStack([{ email: "zed@x.com" }, { contact_name: "Anna", email: "anna@x.com" }], {
      valueProperty: ["contact_name", "email"]
    })
    // First row sorts on email ("zed"), second on contact_name ("Anna") -> Anna first.
    expect(result.map(r => r.email)).toEqual(["anna@x.com", "zed@x.com"])
  })

  it("returns a new array rather than the input", () => {
    const stack = [{ name: "a" }]
    expect(orderStack(stack, { valueProperty: "name" })).not.toBe(stack)
  })
})

describe("filterStack", () => {
  it("returns non-array input unchanged", () => {
    expect(filterStack("nope", [])).toBe("nope")
  })

  it("returns the stack unchanged when no filters are active", () => {
    const stack = [{ id: 1 }, { id: 2 }]
    expect(filterStack(stack, [{ run: false, filter: () => true }])).toBe(stack)
  })

  it("keeps items matching any active (run) filter", () => {
    const stack = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = filterStack(stack, [
      { run: true, filter: item => item.id === 1 },
      { run: true, filter: item => item.id === 3 }
    ])
    expect(result).toEqual([{ id: 1 }, { id: 3 }])
  })

  it("ignores filters whose run flag is false", () => {
    const stack = [{ id: 1 }, { id: 2 }]
    const result = filterStack(stack, [
      { run: false, filter: item => item.id === 1 },
      { run: true, filter: item => item.id === 2 }
    ])
    expect(result).toEqual([{ id: 2 }])
  })
})

describe("hasValue", () => {
  it("is false for null and undefined", () => {
    expect(hasValue(null)).toBe(false)
    expect(hasValue(undefined)).toBe(false)
  })

  it("is true for falsy-but-present values", () => {
    expect(hasValue(0)).toBe(true)
    expect(hasValue("")).toBe(true)
    expect(hasValue(false)).toBe(true)
  })
})

describe("fixMultiQueryString", () => {
  it("rewrites a leading & to ?", () => {
    expect(fixMultiQueryString("&a=1&b=2")).toBe("?a=1&b=2")
  })

  it("leaves an already well-formed query string alone", () => {
    expect(fixMultiQueryString("?a=1")).toBe("?a=1")
  })

  it("passes through falsy input", () => {
    expect(fixMultiQueryString("")).toBe("")
    expect(fixMultiQueryString(undefined)).toBe(undefined)
  })
})

describe("UserRolesWriteToRead", () => {
  it("maps write roles to their read-scope equivalents", () => {
    expect(UserRolesWriteToRead[UserRoles.ClientManager]).toBe("client_editor")
    expect(UserRolesWriteToRead[UserRoles.ProjectManager]).toBe("project_editor")
    expect(UserRolesWriteToRead[UserRoles.ReportManager]).toBe("report_editor")
  })

  it("keeps admin/viewer/access roles identical across write and read", () => {
    expect(UserRolesWriteToRead[UserRoles.ClientAdmin]).toBe("client_admin")
    expect(UserRolesWriteToRead[UserRoles.Viewer]).toBe("viewer")
    expect(UserRolesWriteToRead[UserRoles.ClientAccess]).toBe("client_access")
  })
})
