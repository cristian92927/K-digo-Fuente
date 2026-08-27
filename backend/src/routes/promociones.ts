import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { EstadoPromocion, TipoDescuento } from '@prisma/client';
import { prisma } from '../db';
import { validate } from '../middleware/validate';

const router = Router();

const TRANSICIONES_VALIDAS: Record<EstadoPromocion, EstadoPromocion | null> = {
  PROGRAMADA: 'ACTIVA',
  ACTIVA: 'FINALIZADA',
  FINALIZADA: null,
};

const crearSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    productoCategoria: z.string().min(1, 'El producto o categoría es requerido'),
    tipoDescuento: z.nativeEnum(TipoDescuento),
    valorDescuento: z.number().positive('El valor debe ser positivo'),
    fechaInicio: z.string().datetime({ offset: true }).or(z.string().date()),
    fechaFin: z.string().datetime({ offset: true }).or(z.string().date()),
  })
  .refine((d) => new Date(d.fechaFin) > new Date(d.fechaInicio), {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  })
  .refine(
    (d) =>
      d.tipoDescuento !== 'PORCENTAJE' ||
      (d.valorDescuento >= 1 && d.valorDescuento <= 100),
    {
      message: 'El porcentaje debe estar entre 1 y 100',
      path: ['valorDescuento'],
    },
  );

// GET /api/promociones
router.get('/', async (_req: Request, res: Response) => {
  const promociones = await prisma.promocion.findMany({
    orderBy: { creadoEn: 'desc' },
  });
  res.json(promociones);
});

// GET /api/promociones/resumen
router.get('/resumen', async (_req: Request, res: Response) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [contadores, vigentesHoy] = await Promise.all([
    prisma.promocion.groupBy({
      by: ['estado'],
      _count: { id: true },
    }),
    prisma.promocion.count({
      where: {
        estado: 'ACTIVA',
        fechaInicio: { lte: hoy },
        fechaFin: { gte: hoy },
      },
    }),
  ]);

  const resumen = {
    PROGRAMADA: 0,
    ACTIVA: 0,
    FINALIZADA: 0,
    vigentesHoy,
  };
  for (const c of contadores) {
    resumen[c.estado] = c._count.id;
  }

  res.json(resumen);
});

// POST /api/promociones
router.post('/', validate(crearSchema), async (req: Request, res: Response) => {
  const { nombre, productoCategoria, tipoDescuento, valorDescuento, fechaInicio, fechaFin } =
    req.body;

  const promocion = await prisma.promocion.create({
    data: {
      nombre,
      productoCategoria,
      tipoDescuento,
      valorDescuento,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
    },
  });
  res.status(201).json(promocion);
});

// PATCH /api/promociones/:id/estado
router.patch('/:id/estado', async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const promocion = await prisma.promocion.findUnique({ where: { id } });

  if (!promocion) {
    res.status(404).json({ error: 'Promoción no encontrada' });
    return;
  }

  if (promocion.estado === 'FINALIZADA') {
    res.status(400).json({ error: 'Una promoción finalizada no puede modificarse' });
    return;
  }

  const nuevoEstado = TRANSICIONES_VALIDAS[promocion.estado];
  if (!nuevoEstado) {
    res.status(400).json({ error: 'No hay transición de estado disponible' });
    return;
  }

  const [actualizada] = await prisma.$transaction([
    prisma.promocion.update({
      where: { id },
      data: { estado: nuevoEstado },
    }),
    prisma.historialEstado.create({
      data: {
        promocionId: id,
        estadoAntes: promocion.estado,
        estadoDespues: nuevoEstado,
      },
    }),
  ]);

  res.json(actualizada);
});

// DELETE /api/promociones/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const promocion = await prisma.promocion.findUnique({ where: { id } });

  if (!promocion) {
    res.status(404).json({ error: 'Promoción no encontrada' });
    return;
  }

  if (promocion.estado !== 'PROGRAMADA') {
    res.status(400).json({ error: 'Solo se pueden eliminar promociones en estado Programada' });
    return;
  }

  await prisma.promocion.delete({ where: { id } });
  res.status(204).send();
});

export default router;
