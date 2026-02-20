// playwright.config.ts
// ─────────────────────────────────────────────────────────────
// Configuración de Playwright — Árbol de la Ciencia UNAL
// ─────────────────────────────────────────────────────────────

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,      // false para evitar conflictos con datos compartidos
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60000,            // 60s por test (generación de árbol puede tardar)

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  use: {
    baseURL: "http://localhost:5174",   // ← Vite lo reasignó a 5174 en tu máquina
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});