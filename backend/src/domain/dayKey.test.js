import { describe, expect, it } from 'vitest';
import { dayKey } from './dayKey.js';

describe('dayKey', () => {
  // dayKey es la mitad del índice único (habitId, dayKey) — la regla del
  // "un hábito por día". El test la fija así ese contrato queda blindado.
  it('devuelve YYYY-MM-DD para una fecha dada (determinístico)', () => {
    // Arrange — la fecha entra por parámetro, así el test no depende del reloj
    // (regla de determinismo del §2.2 de la guía).
    const fecha = new Date('2026-09-25T14:30:00Z');

    // Act
    const clave = dayKey(fecha);

    // Assert
    expect(clave).toBe('2026-09-25');
  });

  // Caso de error: si algún handler pasa una Date corrupta (parseo de string
  // mal formado, JSON basura), preferimos fallar rápido y ruidoso.
  it('rechaza Dates inválidas con TypeError', () => {
    // Arrange
    const fechaBasura = new Date('esto-no-es-una-fecha');

    // Act & Assert
    expect(() => dayKey(fechaBasura)).toThrow(TypeError);
  });
});
