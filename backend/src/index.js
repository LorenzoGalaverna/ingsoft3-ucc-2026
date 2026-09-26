import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { calcularNivel, XP_PER_LEVEL } from './domain/leveling.js';
import { dayKey } from './domain/dayKey.js';
import { validarNombreHabito, normalizarXpReward } from './domain/validators.js';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const USER_ID = 1; // walking skeleton: usuario único hardcodeado

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/user', async (_req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: USER_ID } });
  res.json(user);
});

app.get('/api/habits', async (_req, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: USER_ID },
    orderBy: { createdAt: 'asc' },
    include: {
      completions: {
        where: { dayKey: dayKey() },
        select: { id: true },
      },
    },
  });
  // Aplano: mando `completedToday` booleano en vez del array
  res.json(habits.map(h => ({ ...h, completedToday: h.completions.length > 0, completions: undefined })));
});

app.post('/api/habits', async (req, res) => {
  const { name, xpReward } = req.body ?? {};
  const nombre = validarNombreHabito(name);
  if (!nombre.ok) {
    return res.status(400).json({ error: nombre.error });
  }
  const habit = await prisma.habit.create({
    data: { name: nombre.value, xpReward: normalizarXpReward(xpReward), userId: USER_ID },
  });
  res.status(201).json(habit);
});

app.delete('/api/habits/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });
  await prisma.habit.delete({ where: { id } }).catch(() => null);
  res.status(204).end();
});

// Completar hábito: crea la Completion y suma xpReward al usuario.
// Regla: no se puede completar dos veces el mismo hábito el mismo día
// (índice único (habitId, dayKey) en la BD).
app.post('/api/habits/:id/complete', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== USER_ID) return res.status(404).json({ error: 'hábito no encontrado' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.completion.create({
        data: { habitId: id, userId: USER_ID, dayKey: dayKey() },
      });
      const updated = await tx.user.update({
        where: { id: USER_ID },
        data: { xp: { increment: habit.xpReward } },
      });
      // El nivel se recalcula desde la XP total — imposible que se desfase.
      const nuevoNivel = calcularNivel(updated.xp);
      if (nuevoNivel !== updated.level) {
        return tx.user.update({ where: { id: USER_ID }, data: { level: nuevoNivel } });
      }
      return updated;
    });
    res.json(result);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'ya completaste este hábito hoy' });
    }
    throw err;
  }
});

// Solo escuchamos si el módulo se ejecuta directo (no cuando lo importa un test).
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => console.log(`habit-tracker backend escuchando en :${port}`));
}

export { app, XP_PER_LEVEL };
