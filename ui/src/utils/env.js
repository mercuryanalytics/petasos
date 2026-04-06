const host = window.location.host
const isLocal = host.indexOf("localhost") === 0 || host.endsWith(".test")
const url = `${isLocal && !host.endsWith(".test") ? "http" : "https"}://${host}`

export const EnvTypes = {
  PRODUCTION: "production",
  DEVELOPMENT: "development"
}

export default {
  type: isLocal ? EnvTypes.DEVELOPMENT : EnvTypes.PRODUCTION,
  publicUrl: url
}
