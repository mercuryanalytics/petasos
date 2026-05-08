export const EnvTypes = {
  PRODUCTION: "production",
  STAGING: "staging",
  DEVELOPMENT: "development"
}

export function detectEnvType({ host, stage }) {
  const isLocal = host.indexOf("localhost") === 0 || host.endsWith(".test")
  if (isLocal) return EnvTypes.DEVELOPMENT
  if (stage === "staging") return EnvTypes.STAGING
  return EnvTypes.PRODUCTION
}

const host = window.location.host
const stage = process.env.REACT_APP_STAGE
const type = detectEnvType({ host, stage })
const isLocal = type === EnvTypes.DEVELOPMENT
const url = `${isLocal && !host.endsWith(".test") ? "http" : "https"}://${host}`

export default {
  type,
  publicUrl: url
}
