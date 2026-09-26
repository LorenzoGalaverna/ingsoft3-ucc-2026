// Cliente de la API — separado de los componentes para que sea testeable.
// Cada función acepta `fetchImpl` opcional; en runtime usa `fetch` global,
// en tests pasa un `vi.fn()` como doble (patrón de inyección de dependencia).

const BASE = '/api';

export async function completarHabito(id, fetchImpl = fetch) {
  const res = await fetchImpl(`${BASE}/habits/${id}/complete`, { method: 'POST' });
  if (res.status === 409) {
    const body = await res.json();
    throw new Error(body.error ?? 'ya completaste este hábito hoy');
  }
  if (!res.ok) {
    throw new Error(`request falló con ${res.status}`);
  }
  return res.json();
}
