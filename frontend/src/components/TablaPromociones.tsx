import React from 'react';
import { Promocion } from '../api/promociones';

interface Props {
  promociones: Promocion[];
  onAvanzar: (id: number) => void;
  onEliminar: (id: number) => void;
}

const estadoColor: Record<string, string> = {
  PROGRAMADA: 'var(--warning)',
  ACTIVA: 'var(--success)',
  FINALIZADA: 'var(--text-muted)',
};

const estadoLabel: Record<string, string> = {
  PROGRAMADA: 'Programada',
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
};

const siguienteAccion: Record<string, string | null> = {
  PROGRAMADA: 'Activar',
  ACTIVA: 'Finalizar',
  FINALIZADA: null,
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatValor(tipo: string, valor: string) {
  const n = parseFloat(valor);
  return tipo === 'PORCENTAJE' ? `${n}%` : `$${n.toLocaleString('es-CO')}`;
}

export function TablaPromociones({ promociones, onAvanzar, onEliminar }: Props) {
  if (promociones.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
        No hay promociones registradas aún.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            {['Nombre', 'Producto/Cat.', 'Descuento', 'Vigencia', 'Estado', 'Acciones'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {promociones.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>{p.nombre}</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.productoCategoria}</td>
              <td style={{ padding: '10px 12px' }}>{formatValor(p.tipoDescuento, p.valorDescuento)}</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                {formatFecha(p.fechaInicio)} → {formatFecha(p.fechaFin)}
              </td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  background: estadoColor[p.estado] + '22',
                  color: estadoColor[p.estado],
                }}>
                  {estadoLabel[p.estado]}
                </span>
              </td>
              <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                {siguienteAccion[p.estado] && (
                  <button
                    onClick={() => onAvanzar(p.id)}
                    style={{ background: 'var(--accent)', color: '#fff', fontSize: 12 }}
                  >
                    {siguienteAccion[p.estado]}
                  </button>
                )}
                {p.estado === 'PROGRAMADA' && (
                  <button
                    onClick={() => onEliminar(p.id)}
                    style={{ background: '#fee2e2', color: 'var(--danger)', fontSize: 12 }}
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
