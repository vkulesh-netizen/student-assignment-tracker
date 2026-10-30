import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:3001", screenshot: "only-on-failure" },
  webServer: {
    command: "node server/index.js",
    url: "http://127.0.0.1:3001/api/health",
    reuseExistingServer: !process.env.CI,
    env: {
      LOCAL_TEST_DB: "true",
      JWT_SECRET: "browser-test-secret-with-at-least-32-characters",
      APP_ORIGIN: "http://127.0.0.1:3001",
    },
    timeout: 120000,
  },
});
