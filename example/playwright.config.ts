import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Run your local dev server before starting the tests
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  retries: 3,
});
