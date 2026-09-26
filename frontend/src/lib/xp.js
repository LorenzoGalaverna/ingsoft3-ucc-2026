// Lógica pura del frontend — cálculos que la UI muestra pero que no dependen
// del DOM ni de React. Testeable sin renderizar nada.

export const XP_PER_LEVEL = 100;

/**
 * Porcentaje de progreso dentro del nivel actual, redondeado.
 * Ejemplo: 45 XP → 45%. 130 XP → 30% (los 30 sobre el segundo nivel).
 * Sirve para el ancho de la barra de progreso del header.
 */
export function porcentajeProgreso(xp, xpPorNivel = XP_PER_LEVEL) {
  if (!Number.isFinite(xp) || xp < 0) return 0;
  if (!Number.isFinite(xpPorNivel) || xpPorNivel <= 0) return 0;
  const dentroDelNivel = xp % xpPorNivel;
  return Math.round((dentroDelNivel / xpPorNivel) * 100);
}

/**
 * XP faltante hasta el próximo nivel — para el texto debajo de la barra
 * ("55 / 100 XP hasta nivel 3").
 */
export function xpDentroDelNivel(xp, xpPorNivel = XP_PER_LEVEL) {
  if (!Number.isFinite(xp) || xp < 0) return 0;
  return xp % xpPorNivel;
}

/**
 * Etiqueta del botón según el estado del hábito hoy.
 * Deshabilitado si ya fue completado; con label "Completar" o "✓ Hecho" según corresponda.
 */
export function estadoBotonCompletar(habit) {
  if (!habit || typeof habit !== 'object') {
    return { label: 'Completar', disabled: false };
  }
  return habit.completedToday
    ? { label: '✓ Hecho', disabled: true }
    : { label: 'Completar', disabled: false };
}
