// TP9 §3.5 — Instrumentación de Sentry para el backend.
//
// Este archivo DEBE importarse ANTES que cualquier otro módulo (en particular
// antes de express) para que Sentry pueda interceptar los módulos a través
// de su integración de instrumentación automática.
//
// En index.js: `import './instrument.js';` como PRIMERA línea.
//
// Config:
//   - dsn: viene por env var (SENTRY_DSN); si falta, la librería queda
//     apagada y la app funciona igual (dev + tests + QA no envían datos).
//   - tracesSampleRate: 1.0 = mide TODOS los pedidos. En producción real con
//     muchos requests se baja (0.1 = 10%). En esta app alcanza porque el
//     tráfico es bajísimo.
//   - environment: tag que distingue qa/prod en Sentry. En Render se setea
//     con la variable NODE_ENV o, mejor, con una custom tipo SENTRY_ENVIRONMENT.
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  tracesSampleRate: 1.0,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
});
