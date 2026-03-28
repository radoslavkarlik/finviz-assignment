import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    conditions: ["vite"],
  },
  test: {
    css: true,
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      // https://vitest.dev/config/browser/playwright
      instances: [{ browser: "chromium" }],
      screenshotFailures: false,
    },
  },
});
