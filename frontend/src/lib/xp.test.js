import { describe, expect, it } from 'vitest';
import { porcentajeProgreso, xpDentroDelNivel, estadoBotonCompletar, XP_PER_LEVEL } from './xp.js';

describe('porcentajeProgreso', () => {
  // Test PARAMETRIZADO (técnica 1/3 del frontend) — cubre los 4 bordes
  // que la barra tiene que mostrar bien.
  it.each([
    { xp: 0,   pct: 0,   caso: 'sin XP, barra al 0%' },
    { xp: 50,  pct: 50,  caso: 'medio nivel, barra al 50%' },
    { xp: 99,  pct: 99,  caso: 'casi al tope' },
    { xp: 100, pct: 0,   caso: 'XP exacta al múltiplo, reinicia a 0 (nivel nuevo)' },
    { xp: 130, pct: 30,  caso: 'nivel 2 con 30 sobre 100' },
  ])('$xp XP → $pct% ($caso)', ({ xp, pct }) => {
    expect(porcentajeProgreso(xp)).toBe(pct);
  });

  // CASO DE ERROR (técnica 2/3) — inputs inválidos no rompen la UI, devuelven 0.
  // La barra puede quedar vacía pero no explota — mejor que un TypeError.
  it('devuelve 0 con XP inválida en vez de tirar error', () => {
    expect(porcentajeProgreso(-5)).toBe(0);
    expect(porcentajeProgreso('nada')).toBe(0);
    expect(porcentajeProgreso(undefined)).toBe(0);
  });
});

describe('xpDentroDelNivel', () => {
  it('devuelve el resto de XP dentro del nivel actual', () => {
    expect(xpDentroDelNivel(45)).toBe(45);
    expect(xpDentroDelNivel(130)).toBe(30);
    expect(xpDentroDelNivel(XP_PER_LEVEL)).toBe(0);
  });
});

describe('estadoBotonCompletar', () => {
  it('deshabilita el botón cuando el hábito ya está hecho hoy', () => {
    // Arrange
    const habitHecho = { id: 1, name: 'Correr', completedToday: true };

    // Act
    const estado = estadoBotonCompletar(habitHecho);

    // Assert
    expect(estado.disabled).toBe(true);
    expect(estado.label).toContain('Hecho');
  });

  it('habilita el botón cuando el hábito NO fue completado hoy', () => {
    const habitPendiente = { id: 1, name: 'Correr', completedToday: false };
    expect(estadoBotonCompletar(habitPendiente)).toEqual({
      label: 'Completar',
      disabled: false,
    });
  });
});
