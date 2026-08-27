import React from 'react';
import { Resumen } from '../api/promociones';

interface Props {
  resumen: Resumen;
}

const estiloCard: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '16px 20px',
  minWidth: 120,
};

export function ResumenCards({ resumen }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      <div style={estiloCard}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Programadas</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--warning)' }}>{resumen.PROGRAMADA}</div>
      </div>
      <div style={estiloCard}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Activas</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--success)' }}>{resumen.ACTIVA}</div>
      </div>
      <div style={estiloCard}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Finalizadas</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-muted)' }}>{resumen.FINALIZADA}</div>
      </div>
      <div style={{ ...estiloCard, borderColor: 'var(--accent)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Vigentes hoy</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>{resumen.vigentesHoy}</div>
      </div>
    </div>
  );
}
