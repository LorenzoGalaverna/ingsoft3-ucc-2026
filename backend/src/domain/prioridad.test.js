import { describe, expect, it } from 'vitest';
import { prioridadDeHabito, diasDesdeUltimaCompletion } from './prioridad.js';

describe('prioridadDeHabito', () => {
  // Fecha fija — evita el flaky de depender del reloj real (§2.2 de la guía TP5).
  const ahora = new Date('2026-09-25T12:00:00Z');

  // Test parametrizado: un caso por CAMINO del código nuevo — no un caso por
  // punto arbitrario. Si mañana alguien cambia un umbral (`< 3` por `<= 3`),
  // uno de estos tests se pone en rojo.
  it.each([
    { horas: 12,           esperado: 'al-dia',         caso: 'hace 12h → al día' },
    { horas: 24 * 2,       esperado: 'atrasado-poco',  caso: '2 días → atrasado poco' },
    { horas: 24 * 5,       esperado: 'atrasado-medio', caso: '5 días → atrasado medio' },
    { horas: 24 * 15,      esperado: 'atrasado-mucho', caso: '15 días → atrasado mucho' },
    { horas: 24 * 45,      esperado: 'abandonado',     caso: '45 días → abandonado' },
  ])('$caso', ({ horas, esperado }) => {
    // Arrange
    const habit = {
      ultimaCompletion: new Date(ahora.getTime() - horas * 3600_000),
    };

    // Act
    const prioridad = prioridadDeHabito(habit, ahora);

    // Assert
    expect(prioridad).toBe(esperado);
  });

  it('devuelve "desconocida" si el hábito es null o no es objeto', () => {
    expect(prioridadDeHabito(null)).toBe('desconocida');
    expect(prioridadDeHabito('hola')).toBe('desconocida');
    expect(prioridadDeHabito(undefined)).toBe('desconocida');
  });

  it('devuelve "nunca-hecho" si el hábito no tiene ultimaCompletion', () => {
    expect(prioridadDeHabito({ id: 1, name: 'Correr' })).toBe('nunca-hecho');
  });
});

describe('diasDesdeUltimaCompletion', () => {
  const ahora = new Date('2026-09-25T12:00:00Z');

  it('devuelve null si el hábito no tiene ultimaCompletion', () => {
    expect(diasDesdeUltimaCompletion({}, ahora)).toBe(null);
    expect(diasDesdeUltimaCompletion(null, ahora)).toBe(null);
  });

  it('devuelve la cantidad de días completos desde la última completion', () => {
    // Arrange
    const habit = {
      ultimaCompletion: new Date(ahora.getTime() - 3 * 86400000 - 3600_000), // 3.04 días
    };

    // Act & Assert — Math.floor da 3, no 4
    expect(diasDesdeUltimaCompletion(habit, ahora)).toBe(3);
  });
});
