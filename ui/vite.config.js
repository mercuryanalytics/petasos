import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// JSX lives in both .js and .jsx files throughout src/; we configure esbuild +
// the React plugin so both extensions get JSX parsing without a mass rename.
export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx?|tsx?)$/
    })
  ],
  server: {
    // Bind IPv4 so puma-dev (which connects to 127.0.0.1) can reach us;
    // Node 17+ resolves "localhost" to ::1 first, which puma-dev can't use.
    host: "127.0.0.1",
    port: 3004,
    // Allow puma-dev to proxy from http://petasos.test/ → 127.0.0.1:3004.
    allowedHosts: ["petasos.test"]
  },
  build: {
    outDir: "dist"
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" }
    }
  },
  test: {
    // jsdom gives component tests a DOM; env.js reads window.location at import.
    environment: "jsdom",
    // Specs import describe/it/expect from "vitest" explicitly, so this looks
    // unused — but it's load-bearing: setupTests.js does a bare
    // `import "@testing-library/jest-dom"`, which extends the *global* expect.
    // Without globals we'd have to switch to the .../jest-dom/vitest entrypoint.
    globals: true,
    // jest-dom matchers + cleanup between tests.
    setupFiles: ["./src/setupTests.js"],
    // Clear mock call history before every test so specs don't need a per-file
    // beforeEach(() => vi.clearAllMocks()). Only usage data is reset, not mock
    // implementations, so mockReturnValue defaults set in a beforeEach persist.
    clearMocks: true,
    // Co-locate specs in __test__/ folders next to source; the *.spec suffix
    // keeps shared helpers in those folders from being collected as tests.
    include: ["src/**/__test__/**/*.spec.{js,jsx}"]
  }
})
