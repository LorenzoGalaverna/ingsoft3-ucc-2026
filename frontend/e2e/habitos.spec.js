// TP7 §3.3 — Suite E2E (navegador real contra el front de QA).
//
// Playwright maneja un Chromium real: navega, clickea, escribe, verifica lo
// que el usuario vería. baseURL se resuelve en playwright.config.js (E2E_BASE_URL).
//
// Los 3 flujos — pensados contra lo que puede romper algo real para el usuario:
//   (1) crear → verlo listado → borrar → desaparece   [crítico: CRUD completo]
//   (2) formulario sin nombre → botón "Crear hábito" deshabilitado  [validación visible]
//   (3) completar un hábito → la XP sube en la barra  [regla de dominio core: XP]
//
// Las 3 cumplen la triple regla del §Entregables Tarea 3: interactúan, afirman
// sobre su propio dato, y limpian lo que crean.

import { test, expect } from '@playwright/test';

test('crear hábito → aparece en la lista → borrarlo → desaparece', async ({ page }) => {
  const nombre = `e2e-crud-${Date.now()}`;
  await page.goto('/');

  // Llenar el formulario y crear
  await page.getByLabel('Nombre del hábito').fill(nombre);
  await page.getByRole('button', { name: 'Crear hábito' }).click();

  // Debe aparecer en la lista
  const fila = page.getByRole('listitem').filter({ hasText: nombre });
  await expect(fila).toBeVisible();

  // Borrarlo con el aria-label dinámico de su propia fila
  await fila.getByRole('button', { name: `borrar ${nombre}` }).click();

  // Y no debe quedar
  await expect(page.getByRole('listitem').filter({ hasText: nombre })).toHaveCount(0);
});

test('nombre vacío → el botón "Crear hábito" está deshabilitado', async ({ page }) => {
  // Validación visible al usuario: no se puede enviar un hábito sin nombre
  // (coincide con la validación del backend, pero el usuario la ve antes).
  await page.goto('/');

  const boton = page.getByRole('button', { name: 'Crear hábito' });
  await expect(boton).toBeDisabled();

  // Escribir algo lo habilita
  await page.getByLabel('Nombre del hábito').fill('algo');
  await expect(boton).toBeEnabled();

  // Vaciarlo lo vuelve a deshabilitar
  await page.getByLabel('Nombre del hábito').fill('');
  await expect(boton).toBeDisabled();
});

test('completar un hábito suma su XP al usuario', async ({ page }) => {
  // Flujo elegido: ejercita la regla de negocio CORE de la app (sumar XP al
  // completar). Si mañana se rompe, los usuarios dejan de ver recompensa
  // por completar hábitos y la gamificación muere. Si duele cuando duele:
  // acá es.
  const nombre = `e2e-xp-${Date.now()}`;
  const RECOMPENSA = 15;

  await page.goto('/');

  // XP antes de completar
  const xpAntesText = await page.locator('.xp').textContent();
  const xpAntes = Number(xpAntesText.match(/\d+/)[0]);

  // Crear hábito con RECOMPENSA XP
  await page.getByLabel('Nombre del hábito').fill(nombre);
  await page.getByLabel('XP que otorga').fill(String(RECOMPENSA));
  await page.getByRole('button', { name: 'Crear hábito' }).click();

  const fila = page.getByRole('listitem').filter({ hasText: nombre });
  await expect(fila).toBeVisible();

  try {
    // Completar — el botón dice "Completar" si no está hecho hoy
    await fila.getByRole('button', { name: 'Completar' }).click();

    // La XP del usuario tiene que haber subido en exactamente RECOMPENSA
    await expect(page.locator('.xp')).toContainText(`${xpAntes + RECOMPENSA} XP`);

    // Y el botón de ese hábito ahora dice "✓ Hecho" y está deshabilitado
    await expect(fila.getByRole('button', { name: /Hecho|completado/ })).toBeDisabled();
  } finally {
    // Cleanup: borrar lo creado (cascade borra la completion también)
    await fila.getByRole('button', { name: `borrar ${nombre}` }).click();
    await expect(page.getByRole('listitem').filter({ hasText: nombre })).toHaveCount(0);
  }
});
