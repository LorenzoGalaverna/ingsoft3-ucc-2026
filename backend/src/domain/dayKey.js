// dayKey — clave "YYYY-MM-DD" que sirve para el índice único (habitId, dayKey).
// Función pura: dada la misma fecha, siempre devuelve el mismo string.

/**
 * Devuelve la fecha en formato YYYY-MM-DD (UTC).
 * Aceptar `d` como parámetro hace la función determinística y testeable
 * sin monkey-patchear Date.now.
 */
export function dayKey(d = new Date()) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    throw new TypeError('dayKey requiere una Date válida');
  }
  return d.toISOString().slice(0, 10);
}
