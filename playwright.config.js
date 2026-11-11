import { defineConfig } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT || "3001";
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL: origin,
    screenshot: "only-on-failure",
    video: process.env.STUDYLINE_RECORD ? "on" : "off",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE },
  },
  webServer: {
    command: "node server/index.js",
    url: `${origin}/api/health`,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: port,
      LOCAL_TEST_DB: "true",
      JWT_SECRET: "browser-test-secret-with-at-least-32-characters",
      APP_ORIGIN: origin,
    },
    timeout: 120000,
  },
});

