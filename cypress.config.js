import { defineConfig } from "cypress";

export default defineConfig({
  video: true,
  viewportWidth: 1440,
  viewportHeight: 900,
  e2e: {
    baseUrl: process.env.STUDYLINE_BASE_URL || "http://127.0.0.1:3001",
    supportFile: false,
  },
});
