import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config unificada para Vite (dev/build) y Vitest (tests + coverage).
// El umbral del TP5 se define acá — mismos 70% que en el backend, sobre lines Y branches.
export default defineConfig({
  plugins: [react()],
  server: {
    // En dev, /api se proxea al backend local (node → :8080).
    // En producción (contenedor), el mismo rol lo cumple el proxy_pass de nginx.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json-summary', 'html', 'lcov'],
      // include: qué SÍ entra en la cuenta — la lógica pura, no el árbol de React.
      // Los componentes React se testean visualmente y con e2e (TP7); en unit tests
      // aislados no aportan un número honesto (mucho render, poco assert).
      include: ['src/lib/**/*.js'],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
});
