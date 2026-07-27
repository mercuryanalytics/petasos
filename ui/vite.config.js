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
    // Expose describe/it/expect without importing them in every spec.
    globals: true,
    // jest-dom matchers + cleanup between tests.
    setupFiles: ["./src/setupTests.js"],
    // Co-locate specs in __test__/ folders next to source; the *.spec suffix
    // keeps shared helpers in those folders from being collected as tests.
    include: ["src/**/__test__/**/*.spec.{js,jsx}"]
  }
})
