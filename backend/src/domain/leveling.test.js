import { describe, expect, it } from 'vitest';
import { calcularNivel, xpHastaSiguienteNivel, XP_PER_LEVEL } from './leveling.js';

describe('calcularNivel', () => {
  // Test parametrizado: cubre los 3 bordes de la fórmula floor(xp/100)+1
  // — inicio, exacto, medio — con un solo bloque de código.
  it.each([
    { xp: 0,   nivel: 1, caso: 'sin XP, arranca en nivel 1' },
    { xp: 99,  nivel: 1, caso: 'justo antes del salto sigue en 1' },
    { xp: 100, nivel: 2, caso: 'XP exacta al múltiplo salta de nivel' },
    { xp: 250, nivel: 3, caso: '2.5 niveles → nivel 3' },
    { xp: 999, nivel: 10, caso: 'valores grandes escalan bien' },
  ])('$xp XP → nivel $nivel ($caso)', ({ xp, nivel }) => {
    // Arrange & Act
    const resultado = calcularNivel(xp);

    // Assert
    expect(resultado).toBe(nivel);
  });

  // Caso de error: la función debe rechazar XP negativa — es una regla del schema
  // (Int @default(0), y solo se incrementa) y validar acá evita que un bug futuro
  // pase una XP corrupta y devuelva niveles negativos silenciosamente.
  it('lanza RangeError con XP negativa', () => {
    // Arrange
    const xpInvalida = -1;

    // Act & Assert — Vitest capta el throw sin ejecutar el resto
    expect(() => calcularNivel(xpInvalida)).toThrow(RangeError);
  });

  it('respeta un xpPorNivel custom (útil para tests y balanceo de reglas)', () => {
    // Arrange
    const xp = 50;
    const xpPorNivel = 25;

    // Act
    const resultado = calcularNivel(xp, xpPorNivel);

    // Assert — con 50 XP y niveles cada 25, estás en nivel 3 (50/25 = 2, +1)
    expect(resultado).toBe(3);
  });
});

describe('xpHastaSiguienteNivel', () => {
  it('devuelve la XP faltante para llegar al próximo múltiplo de XP_PER_LEVEL', () => {
    // Arrange
    const xpActual = 45;

    // Act
    const falta = xpHastaSiguienteNivel(xpActual);

    // Assert — con 45 XP y XP_PER_LEVEL=100, faltan 55 para nivel 2
    expect(falta).toBe(XP_PER_LEVEL - 45);
  });
});
