// Prioridad de un hábito según cuánto hace que se completó por última vez.
// (Tiene varios caminos adentro y —a propósito— NI UN SOLO TEST — es la demo
// del gate por cobertura del TP5 §3.5.)

const MS_POR_DIA = 86400000;

export function prioridadDeHabito(habit, ahora = new Date()) {
  if (!habit || typeof habit !== 'object') {
    return 'desconocida';
  }
  if (!habit.ultimaCompletion) {
    return 'nunca-hecho';
  }
  const diasDesdeUltima = (ahora - new Date(habit.ultimaCompletion)) / MS_POR_DIA;
  if (diasDesdeUltima < 1) {
    return 'al-dia';
  }
  if (diasDesdeUltima < 3) {
    return 'atrasado-poco';
  }
  if (diasDesdeUltima < 7) {
    return 'atrasado-medio';
  }
  if (diasDesdeUltima < 30) {
    return 'atrasado-mucho';
  }
  return 'abandonado';
}

export function diasDesdeUltimaCompletion(habit, ahora = new Date()) {
  if (!habit || !habit.ultimaCompletion) {
    return null;
  }
  return Math.floor((ahora - new Date(habit.ultimaCompletion)) / MS_POR_DIA);
}
