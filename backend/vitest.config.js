import { defineConfig } from 'vitest/config';

// Umbral de cobertura del TP5.
// Se elige 70 sobre líneas Y ramas porque:
// - Con la lógica de negocio extraída a src/domain/ (funciones puras), medir sobre lo
//   testeable de verdad y no sobre el arranque de Express.
// - 70 es el número que hoy alcanzo con margen — sube el listón lo suficiente para
//   detectar que dejé código nuevo sin tests, pero no fuerza a testear código trivial.
// - Se aplica sobre líneas Y ramas: `lines` es la métrica menos honesta (§2.4 de la
//   guía), `branches` obliga a ejercitar los dos lados de cada `if`.
export default defineConfig({
  test: {
    // Los tests viven al lado del código: src/**/*.test.js
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json-summary', 'html', 'lcov'],
      include: ['src/**/*.js'],
      // Excluidos de la cuenta y por qué:
      // - src/index.js: el arranque de Express (cableado + handlers thin). No es
      //   lógica que se pueda testear como función pura; ver §2.4 de la guía TP5.
      //   La lógica que sí importa vive en src/domain/.
      // - prisma/seed.js: script one-shot que crea el user id=1. Se ejercita al
      //   arrancar el contenedor con `prisma migrate deploy && node prisma/seed.js`.
      exclude: [
        'src/index.js',
        'prisma/**',
        'node_modules/**',
        '**/*.test.js',
      ],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
});
