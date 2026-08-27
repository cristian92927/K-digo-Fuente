jest.mock('../db', () => ({
  prisma: {
    promocion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    historialEstado: { create: jest.fn() },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

import request from 'supertest';
import app from '../index';
import { prisma } from '../db';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => jest.clearAllMocks());

describe('POST /api/promociones — validaciones', () => {
  it('rechaza si falta nombre', async () => {
    const res = await request(app).post('/api/promociones').send({
      productoCategoria: 'Bebidas',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 10,
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-30',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('nombre');
  });

  it('rechaza porcentaje fuera de rango', async () => {
    const res = await request(app).post('/api/promociones').send({
      nombre: 'Promo test',
      productoCategoria: 'Bebidas',
      tipoDescuento: 'PORCENTAJE',
      valorDescuento: 150,
      fechaInicio: '2026-09-01',
      fechaFin: '2026-09-30',
    });
    expect(res.status).toBe(400);
  });

  it('rechaza si fecha fin <= fecha inicio', async () => {
    const res = await request(app).post('/api/promociones').send({
      nombre: 'Promo test',
      productoCategoria: 'Bebidas',
      tipoDescuento: 'MONTO_FIJO',
      valorDescuento: 5000,
      fechaInicio: '2026-09-30',
      fechaFin: '2026-09-01',
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/promociones/:id', () => {
  it('rechaza eliminar una promoción ACTIVA', async () => {
    (mockPrisma.promocion.findUnique as jest.Mock).mockResolvedValue({ id: 1, estado: 'ACTIVA' });
    const res = await request(app).delete('/api/promociones/1');
    expect(res.status).toBe(400);
  });

  it('elimina una promoción PROGRAMADA', async () => {
    (mockPrisma.promocion.findUnique as jest.Mock).mockResolvedValue({ id: 1, estado: 'PROGRAMADA' });
    (mockPrisma.promocion.delete as jest.Mock).mockResolvedValue({});
    const res = await request(app).delete('/api/promociones/1');
    expect(res.status).toBe(204);
  });
});

describe('GET /health', () => {
  it('responde 200 cuando la BD está conectada', async () => {
    (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
