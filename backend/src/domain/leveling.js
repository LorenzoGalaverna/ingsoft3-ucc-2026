// Reglas de nivel — funciones puras testeables sin BD ni frameworks.
// El nivel se recalcula SIEMPRE desde la XP total, así no puede desfasarse.

export const XP_PER_LEVEL = 100;

/**
 * Nivel actual dado el XP total.
 * Fórmula: floor(xp / XP_PER_LEVEL) + 1.
 * Ejemplos: 0 XP → nivel 1, 99 → nivel 1, 100 → nivel 2, 250 → nivel 3.
 */
export function calcularNivel(xp, xpPorNivel = XP_PER_LEVEL) {
  if (!Number.isFinite(xp) || xp < 0) {
    throw new RangeError('xp debe ser un número >= 0');
  }
  if (!Number.isFinite(xpPorNivel) || xpPorNivel <= 0) {
    throw new RangeError('xpPorNivel debe ser un número > 0');
  }
  return Math.floor(xp / xpPorNivel) + 1;
}

/**
 * Cuánta XP le falta al usuario para llegar al próximo nivel.
 * Útil para la barra de progreso del frontend.
 */
export function xpHastaSiguienteNivel(xp, xpPorNivel = XP_PER_LEVEL) {
  if (!Number.isFinite(xp) || xp < 0) {
    throw new RangeError('xp debe ser un número >= 0');
  }
  const dentroDelNivel = xp % xpPorNivel;
  return xpPorNivel - dentroDelNivel;
}
