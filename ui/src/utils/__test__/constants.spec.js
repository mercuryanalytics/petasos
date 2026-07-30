import { describe, it, expect } from "vitest"
import Constants from "../constants"
import Env, { EnvTypes } from "../env"

describe("Constants", () => {
  // The test runs under jsdom, whose default location is localhost, so env.js
  // resolves the app to DEVELOPMENT. Assert that precondition up front: the
  // concrete URL expectations below only hold for the development wiring.
  it("resolves to the development environment under jsdom", () => {
    expect(Env.type).toBe(EnvTypes.DEVELOPMENT)
  })

  it("wires API_URL to the development API host", () => {
    expect(Constants.API_URL).toBe("https://petasos-api.test/api/v1")
  })

  it("derives both default logos from the API host", () => {
    const expected = "https://petasos-api.test/images/mercury-analytics-logo.png"
    expect(Constants.DEFAULT_APP_LOGO_URL).toBe(expected)
    expect(Constants.DEFAULT_CLIENT_LOGO_URL).toBe(expected)
  })
})
