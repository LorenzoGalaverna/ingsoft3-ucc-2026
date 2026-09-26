import { describe, expect, it, vi } from 'vitest';
import { completarHabito } from './api.js';

describe('completarHabito (con MOCK de fetch)', () => {
  // Test con MOCK (técnica 3/3 del frontend). El cliente HTTP es una dependencia
  // externa clásica — en producción es `fetch` global. Acá pasamos un doble
  // (vi.fn()) que devuelve respuestas canned, y verificamos QUÉ recibió.
  it('llama al endpoint correcto con POST y devuelve el user actualizado', async () => {
    // Arrange — fetch mockeado que devuelve el user con XP subida
    const respuestaCanned = { id: 1, name: 'Lorenzo', xp: 130, level: 2 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => respuestaCanned,
    });

    // Act
    const resultado = await completarHabito(42, fetchMock);

    // Assert — el mock verifica la interacción con la API (URL + método)
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/habits/42/complete',
      { method: 'POST' }
    );
    expect(resultado).toEqual(respuestaCanned);
  });

  // Caso de error específico: la regla 409 del backend (un hábito por día)
  // se traduce a un Error con el mensaje del servidor.
  it('lanza Error con el mensaje del server cuando el backend responde 409', async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'ya completaste este hábito hoy' }),
    });

    // Act & Assert
    await expect(completarHabito(1, fetchMock)).rejects.toThrow('ya completaste');
  });
});
