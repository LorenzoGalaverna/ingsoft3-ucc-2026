// Test con MOCK obligatorio del TP5 §1.
//
// Testea POST /api/habits/:id/complete sin tocar la BD real. Prisma está reemplazado
// por un doble (test double) construido con vi.fn() — los asserts verifican QUÉ se
// llamó y con qué args, no cómo. Es la técnica que la guía §2.3 llama "mock" en el
// sentido estricto: no solo devuelve valores canned (eso sería un stub), sino que
// las llamadas se comprueban.
//
// Diseño testeable: `src/index.js` exporta `app` y ejecuta `app.listen` solo si el
// archivo se ejecuta directo — así el test puede importar la app sin levantar puertos.
import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Doble del cliente Prisma. `hoisted` porque vi.mock se hoistea al top del archivo
// y necesita capturar las referencias del mock antes de que se importe el módulo.
const mockPrisma = vi.hoisted(() => ({
  user: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  habit: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  completion: { create: vi.fn() },
  $transaction: vi.fn(),
  $disconnect: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  // PrismaClient se instancia con `new` en index.js — usamos una function
  // declaration para que sirva como constructor.
  PrismaClient: function PrismaClient() {
    return mockPrisma;
  },
}));

// La app se importa DESPUÉS del vi.mock — el PrismaClient del index.js queda
// enganchado al doble.
const { app } = await import('./index.js');

describe('POST /api/habits/:id/complete (con mock de Prisma)', () => {
  beforeEach(() => {
    // Limpia el historial de llamadas entre tests, así los asserts no se contaminan.
    vi.clearAllMocks();
  });

  it('cuando el habit reward hace subir de nivel, llama a user.update DOS veces (incremento XP + nuevo nivel)', async () => {
    // Arrange — el hábito recompensa 30 XP, el usuario está en 90 → post-completion 120 → nivel 2
    mockPrisma.habit.findUnique.mockResolvedValue({ id: 1, userId: 1, xpReward: 30 });
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      // Simula la transacción ejecutando la función que le pasamos con nuestro mock
      const txUser = {
        // Primer update: incremento de XP. Devuelve el user en 120 XP nivel 1 (todavía).
        update: vi.fn()
          .mockResolvedValueOnce({ id: 1, name: 'Lorenzo', xp: 120, level: 1 })
          // Segundo update: nuevo nivel calculado. Devuelve el user en nivel 2.
          .mockResolvedValueOnce({ id: 1, name: 'Lorenzo', xp: 120, level: 2 }),
      };
      const txCompletion = { create: vi.fn().mockResolvedValue({ id: 99 }) };
      const tx = { user: txUser, completion: txCompletion };
      return fn(tx);
    });

    // Act
    const res = await request(app).post('/api/habits/1/complete');

    // Assert — el mock del tx cumple, y el mock de $transaction lo confirma
    expect(res.status).toBe(200);
    expect(mockPrisma.habit.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    // La respuesta refleja el segundo update: nivel nuevo
    expect(res.body).toMatchObject({ xp: 120, level: 2 });
  });

  it('devuelve 404 sin llamar a $transaction cuando el hábito no existe', async () => {
    // Arrange — el hábito no aparece en la BD
    mockPrisma.habit.findUnique.mockResolvedValue(null);

    // Act
    const res = await request(app).post('/api/habits/999/complete');

    // Assert
    expect(res.status).toBe(404);
    // La transacción NO debe llamarse — el corte se hace antes
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
