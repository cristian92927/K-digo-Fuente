import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './db';
import promocionesRouter from './routes/promociones';

const requiredEnvVars = ['DATABASE_URL'];
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.error(`ERROR: Variable de entorno requerida no definida: ${v}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (_err) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/promociones', promocionesRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

export default app;
