import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './styles.css';

// TP9 §3.5 — El DSN del front NO es un secret: viaja en el bundle que baja
// el navegador (como cualquier app web); sólo sirve para ENVIAR datos, no
// para leerlos. Es la diferencia con una API key, que sí permite leer o
// modificar. Push protection no lo frena, y está bien que no lo frene.
Sentry.init({
  dsn: 'https://c138344b27f33a232968435a8a085740@o4512274268225536.ingest.us.sentry.io/4512274351259648',
  environment: window.location.hostname, // qa / prod / localhost — de qué sitio vino el evento
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
