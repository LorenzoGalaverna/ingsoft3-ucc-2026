import { describe, expect, it } from 'vitest';
import { validarNombreHabito, normalizarXpReward, XP_REWARD_DEFAULT } from './validators.js';

describe('validarNombreHabito', () => {
  // Parametrizado: los 4 casos malos que espera el POST /api/habits.
  // Si mañana alguien invierte la validación (rechaza válidos, acepta vacíos),
  // uno de estos tests se pone en rojo — es la propiedad que menciona el §2 de la
  // guía TP5: "un test que no se pone rojo si invertís la regla, no verifica".
  it.each([
    { input: '',            caso: 'string vacío' },
    { input: '   ',         caso: 'solo espacios' },
    { input: undefined,     caso: 'undefined (name faltante en el body)' },
    { input: 123,           caso: 'número (tipo equivocado)' },
  ])('rechaza $caso', ({ input }) => {
    // Act
    const resultado = validarNombreHabito(input);

    // Assert
    expect(resultado.ok).toBe(false);
    expect(resultado.error).toBeDefined();
  });

  it('acepta un nombre válido y devuelve el trimmed', () => {
    // Arrange
    const conEspacios = '  Correr 30 min  ';

    // Act
    const resultado = validarNombreHabito(conEspacios);

    // Assert
    expect(resultado.ok).toBe(true);
    expect(resultado.value).toBe('Correr 30 min');
  });
});

describe('normalizarXpReward', () => {
  it.each([
    { input: 20,        esperado: 20,                  caso: 'entero > 0 se preserva' },
    { input: 7.9,       esperado: 7,                   caso: 'floats se truncan con Math.floor' },
    { input: 0,         esperado: XP_REWARD_DEFAULT,   caso: 'cero cae al default' },
    { input: -5,        esperado: XP_REWARD_DEFAULT,   caso: 'negativos caen al default' },
    { input: undefined, esperado: XP_REWARD_DEFAULT,   caso: 'ausente cae al default' },
    { input: 'diez',    esperado: XP_REWARD_DEFAULT,   caso: 'string cae al default' },
  ])('con input $input devuelve $esperado ($caso)', ({ input, esperado }) => {
    expect(normalizarXpReward(input)).toBe(esperado);
  });
});
