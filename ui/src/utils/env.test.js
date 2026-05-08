import { EnvTypes, detectEnvType } from "./env"

describe("detectEnvType", () => {
  it("returns DEVELOPMENT for localhost", () => {
    expect(detectEnvType({ host: "localhost:3000", stage: undefined })).toBe(EnvTypes.DEVELOPMENT)
  })

  it("returns DEVELOPMENT for *.test hosts", () => {
    expect(detectEnvType({ host: "petasos.test", stage: undefined })).toBe(EnvTypes.DEVELOPMENT)
  })

  it("returns STAGING when REACT_APP_STAGE=staging", () => {
    expect(detectEnvType({ host: "staging.researchresultswebsite.com", stage: "staging" })).toBe(EnvTypes.STAGING)
  })

  it("returns PRODUCTION when REACT_APP_STAGE=production", () => {
    expect(detectEnvType({ host: "researchresultswebsite.com", stage: "production" })).toBe(EnvTypes.PRODUCTION)
  })

  it("returns PRODUCTION when REACT_APP_STAGE is unset on a real host", () => {
    expect(detectEnvType({ host: "researchresultswebsite.com", stage: undefined })).toBe(EnvTypes.PRODUCTION)
  })
})
