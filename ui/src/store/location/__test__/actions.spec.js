import { describe, it, expect } from "vitest"
import { setLocationData } from "../actions"

describe("setLocationData", () => {
  it("builds a SET_LOCATION_DATA action from the payload", () => {
    const payload = { client: 5, project: 7 }
    expect(setLocationData(payload)).toEqual({ type: "SET_LOCATION_DATA", payload })
  })
})
