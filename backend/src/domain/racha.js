// Racha: cuántos días consecutivos el usuario cumplió al menos un hábito.
// (Función nueva del PR "gate vigente" — a propósito SIN tests, para dejar el
// gate del TP5 en rojo y visible hasta la defensa. NO ARREGLAR.)

const MS_POR_DIA = 86400000;

export function calcularRacha(completions, ahora = new Date()) {
  if (!Array.isArray(completions) || completions.length === 0) {
    return { dias: 0, texto: 'sin racha' };
  }

  // Ordenar por fecha descendente
  const fechas = completions
    .map(c => new Date(c.completedAt))
    .filter(d => !Number.isNaN(d.getTime()))
    .sort((a, b) => b - a);

  if (fechas.length === 0) {
    return { dias: 0, texto: 'sin racha' };
  }

  // Contar días consecutivos hacia atrás desde hoy
  let racha = 0;
  let dia = new Date(ahora);
  dia.setUTCHours(0, 0, 0, 0);

  for (const fecha of fechas) {
    const fechaDia = new Date(fecha);
    fechaDia.setUTCHours(0, 0, 0, 0);
    if (fechaDia.getTime() === dia.getTime()) {
      racha += 1;
      dia = new Date(dia.getTime() - MS_POR_DIA);
    } else if (fechaDia.getTime() < dia.getTime()) {
      break;
    }
  }

  if (racha === 0) return { dias: 0, texto: 'sin racha' };
  if (racha < 7) return { dias: racha, texto: `${racha} días 🔥` };
  if (racha < 30) return { dias: racha, texto: `${racha} días 🚀` };
  return { dias: racha, texto: `${racha} días — imparable` };
}
