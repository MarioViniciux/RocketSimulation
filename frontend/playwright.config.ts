import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const BACKEND_DIR = path.resolve(__dirname, "../backend");
const BACKEND_PORT = 8000;
// Porta 3000: a única origem liberada no CORS do backend (`app/main.py`).
const FRONTEND_PORT = 3000;

// Usa o `uvicorn` do virtualenv do backend (`backend/.venv`) quando
// existir; caso contrário, o que estiver no PATH.
const venvUvicorn = path.join(BACKEND_DIR, ".venv", "bin", "uvicorn");
const uvicorn = existsSync(venvUvicorn) ? venvUvicorn : "uvicorn";

/** Testes end-to-end do fluxo principal (entrada → `POST /simulate` →
 * resultados), contra o backend FastAPI e o frontend Next.js reais —
 * ambos iniciados automaticamente (ou reaproveitados, se já estiverem
 * rodando localmente). */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `${uvicorn} app.main:app --port ${BACKEND_PORT}`,
      cwd: BACKEND_DIR,
      url: `http://localhost:${BACKEND_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT}`,
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { NEXT_PUBLIC_API_BASE_URL: `http://localhost:${BACKEND_PORT}` },
    },
  ],
});
