import { defineConfig } from '@playwright/test';

// Config de Playwright — una sola instalación, dos suites:
//   - e2e/api.spec.js      → integración (fixture `request`, sin navegador)
//   - e2e/habitos.spec.js  → e2e real (navegador contra el front de QA)
//
// baseURL se resuelve por env en los jobs del pipeline:
//   - integración: API_BASE_URL (leído dentro del spec, no acá)
//   - e2e:         E2E_BASE_URL (viene a esta config)
// En local, los dos default a `http://localhost:*` → compose del TP2.
export default defineConfig({
  testDir: './e2e',
  // Tope de CADA test. Generoso para la e2e (navegador + cold start de Render).
  // De sobra para los pedidos a la api.
  timeout: 60_000,
  // Tope de CADA aserción. NO lo hereda del de arriba (el default es 5s).
  expect: { timeout: 15_000 },
  use: {
    // El FRONT. La api tiene su propia URL (API_BASE_URL, leída en api.spec.js).
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    // La traza se graba en el retry de un fallo. Los verdes no la generan.
    trace: 'on-first-retry',
    // Screenshot standalone en cada fallo (fuera de la traza).
    screenshot: 'only-on-failure',
  },
  // 1 retry absorbe una demora suelta del free tier; si un test pasa recién
  // ahí, Playwright lo marca como "flaky" en el reporte (verde con asterisco).
  // Un flaky repetido 2 corridas seguidas ya no es la red — es el test.
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
});
