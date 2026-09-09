// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Testes e2e (ver e2e/app.spec.js) — rodam contra os emuladores do Firebase,
// nunca contra produção. Use `npm run test:e2e`, que já sobe os emuladores
// via `firebase emulators:exec` antes de chamar o Playwright.
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx expo start --web --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { EXPO_PUBLIC_USE_EMULATOR: '1' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
