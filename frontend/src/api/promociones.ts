const BASE = import.meta.env.VITE_API_URL ?? '/api';

export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO';
export type EstadoPromocion = 'PROGRAMADA' | 'ACTIVA' | 'FINALIZADA';

export interface Promocion {
  id: number;
  nombre: string;
  productoCategoria: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPromocion;
  creadoEn: string;
}

export interface Resumen {
  PROGRAMADA: number;
  ACTIVA: number;
  FINALIZADA: number;
  vigentesHoy: number;
}

export interface CrearPromocionDto {
  nombre: string;
  productoCategoria: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listar: (): Promise<Promocion[]> =>
    fetch(`${BASE}/promociones`).then(handleResponse<Promocion[]>),

  resumen: (): Promise<Resumen> =>
    fetch(`${BASE}/promociones/resumen`).then(handleResponse<Resumen>),

  crear: (data: CrearPromocionDto): Promise<Promocion> =>
    fetch(`${BASE}/promociones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<Promocion>),

  avanzarEstado: (id: number): Promise<Promocion> =>
    fetch(`${BASE}/promociones/${id}/estado`, { method: 'PATCH' }).then(
      handleResponse<Promocion>,
    ),

  eliminar: (id: number): Promise<void> =>
    fetch(`${BASE}/promociones/${id}`, { method: 'DELETE' }).then(
      handleResponse<void>,
    ),
};
