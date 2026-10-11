// TP7 §3.3 — Suite de INTEGRACIÓN (sin navegador, sin dobles).
//
// Habla con la API de QA desplegada, por su dirección pública (API_BASE_URL),
// contra su base de verdad en Neon. Lo que un unit test con mock de Prisma
// NO puede ver — porque reemplaza justo lo que falla — vive acá.
//
// Las 3 pruebas: alta/get/borra (ciclo CRUD completo), alta inválida (regla
// de validación), y completar 2 veces el mismo día (regla UNIQUE de la BD —
// la que elige el autor, §Entregables Tarea 2 (c)).

import { test, expect, request as pwRequest } from '@playwright/test';

// La api tiene SU URL — distinta del front (baseURL de playwright.config.js).
// En local: compose del TP2; en CI: la URL pública de la api de QA.
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

let api;
test.beforeAll(async () => {
  api = await pwRequest.newContext({ baseURL: API_BASE_URL });
});
test.afterAll(async () => {
  await api.dispose();
});

test('alta + verificación + borrado', async () => {
  // Nombre único con hora → ninguna otra corrida usa el mismo (QA es compartido).
  const nombre = `int-alta-${Date.now()}`;

  // POST: crear
  const resPost = await api.post('/api/habits', {
    data: { name: nombre, xpReward: 10 },
  });
  expect(resPost.status()).toBe(201);
  const creado = await resPost.json();
  expect(creado.id).toBeDefined();
  expect(creado.name).toBe(nombre);

  let id = creado.id;
  try {
    // GET: aparece en la lista
    const resLista = await api.get('/api/habits');
    expect(resLista.ok()).toBeTruthy();
    const lista = await resLista.json();
    expect(lista.find(h => h.id === id)).toBeTruthy();
  } finally {
    // Siempre borrar lo que creamos (la regla del TP7)
    const resDel = await api.delete(`/api/habits/${id}`);
    expect(resDel.status()).toBe(204);
  }

  // Después del delete: ya no está
  const resLista2 = await api.get('/api/habits');
  const lista2 = await resLista2.json();
  expect(lista2.find(h => h.id === id)).toBeFalsy();
});

test('alta inválida: nombre vacío → 400 y no se creó nada', async () => {
  // Snapshot del tamaño de la lista antes
  const antes = await (await api.get('/api/habits')).json();

  const res = await api.post('/api/habits', {
    data: { name: '', xpReward: 10 },
  });
  expect(res.status()).toBe(400);
  const err = await res.json();
  expect(err.error).toBeDefined();

  // La lista quedó igual — nada se creó
  const despues = await (await api.get('/api/habits')).json();
  expect(despues.length).toBe(antes.length);
});

test('completar dos veces el mismo día → 409 (regla UNIQUE de la BD)', async () => {
  // Elegido como tercer test porque EJERCITA LA RESTRICCIÓN DE BASE que
  // un mock de Prisma NO puede atrapar (§2.5 — "lo que el doble no ve"):
  //   - El schema tiene `@@unique([habitId, dayKey])` en Completion.
  //   - Si alguien lo saca de la migración, los unit tests siguen verdes
  //     (el mock acepta cualquier cosa), pero este test se pone rojo.
  const nombre = `int-complete-${Date.now()}`;
  const resPost = await api.post('/api/habits', {
    data: { name: nombre, xpReward: 10 },
  });
  const creado = await resPost.json();

  try {
    // Primera completion del día: OK
    const c1 = await api.post(`/api/habits/${creado.id}/complete`);
    expect(c1.status()).toBe(200);

    // Segunda completion del MISMO hábito el MISMO día: la BD rechaza por
    // el índice único, Prisma devuelve P2002, la api lo mapea a 409.
    const c2 = await api.post(`/api/habits/${creado.id}/complete`);
    expect(c2.status()).toBe(409);
    const err = await c2.json();
    expect(err.error).toMatch(/ya completaste/i);
  } finally {
    // Cleanup: borra el hábito (cascade borra la completion por onDelete).
    await api.delete(`/api/habits/${creado.id}`);
  }
});
