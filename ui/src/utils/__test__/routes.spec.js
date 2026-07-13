import { describe, it, expect } from "vitest"
import Routes from "../routes"

describe("Routes", () => {
  const entries = Object.entries(Routes)

  it("defines the expected set of route names", () => {
    expect(Object.keys(Routes)).toEqual([
      "Home",
      "CreateClient",
      "ManageClient",
      "ManageClientUser",
      "CreateProject",
      "ManageProject",
      "CreateReport",
      "ManageReport",
      "Account",
      "SuperUser",
      "Login",
      "LoginCallback",
      "Logout",
      "ChangePassword"
    ])
  })

  it.each(entries)("%s is an absolute path", (_name, path) => {
    expect(typeof path).toBe("string")
    expect(path.startsWith("/")).toBe(true)
  })

  it("has no duplicate paths", () => {
    const paths = entries.map(([, path]) => path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it("uses well-formed :param placeholders", () => {
    // Every colon must begin a param segment made of word chars, e.g. /:id.
    const withParams = entries.filter(([, path]) => path.includes(":"))
    for (const [, path] of withParams) {
      for (const segment of path.split("/")) {
        if (segment.startsWith(":")) {
          expect(segment).toMatch(/^:\w+$/)
        }
      }
    }
  })

  it("keeps parameterized routes distinct from their static create routes", () => {
    expect(Routes.CreateClient).not.toBe(Routes.ManageClient)
    expect(Routes.CreateProject).not.toBe(Routes.ManageProject)
    expect(Routes.CreateReport).not.toBe(Routes.ManageReport)
  })
})
