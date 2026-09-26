// Validadores del payload que entra por HTTP — funciones puras que devuelven
// { ok, value?, error? } sin conocer Express ni res.status.

export const XP_REWARD_DEFAULT = 10;

/**
 * Nombre del hábito: string, no vacío después de trim.
 * Devuelve { ok: true, value: <trimmed> } si es válido; { ok: false, error } si no.
 */
export function validarNombreHabito(name) {
  if (typeof name !== 'string') {
    return { ok: false, error: 'name debe ser string' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'name es obligatorio' };
  }
  return { ok: true, value: trimmed };
}

/**
 * Normaliza xpReward: si viene un entero > 0 lo usa; si no, devuelve el default.
 * No lanza — el default cubre los inputs inválidos, porque este campo es OPCIONAL
 * en el POST /api/habits (a diferencia de `name`).
 */
export function normalizarXpReward(xpReward) {
  if (Number.isFinite(xpReward) && xpReward > 0) {
    return Math.floor(xpReward);
  }
  return XP_REWARD_DEFAULT;
}
