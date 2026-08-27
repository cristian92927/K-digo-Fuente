import React, { useState } from 'react';
import { CrearPromocionDto, TipoDescuento } from '../api/promociones';

interface Props {
  onCrear: (data: CrearPromocionDto) => Promise<void>;
}

interface Errores {
  nombre?: string;
  productoCategoria?: string;
  valorDescuento?: string;
  fechaFin?: string;
}

const initialState: CrearPromocionDto = {
  nombre: '',
  productoCategoria: '',
  tipoDescuento: 'PORCENTAJE',
  valorDescuento: 0,
  fechaInicio: '',
  fechaFin: '',
};

export function FormPromocion({ onCrear }: Props) {
  const [form, setForm] = useState<CrearPromocionDto>(initialState);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState('');

  const validar = (): boolean => {
    const e: Errores = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.productoCategoria.trim()) e.productoCategoria = 'El producto o categoría es requerido';
    if (!form.valorDescuento || form.valorDescuento <= 0)
      e.valorDescuento = 'El valor debe ser positivo';
    if (form.tipoDescuento === 'PORCENTAJE' && (form.valorDescuento < 1 || form.valorDescuento > 100))
      e.valorDescuento = 'El porcentaje debe estar entre 1 y 100';
    if (form.fechaFin && form.fechaInicio && form.fechaFin <= form.fechaInicio)
      e.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorApi('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await onCrear(form);
      setForm(initialState);
      setErrores({});
    } catch (err) {
      setErrorApi(err instanceof Error ? err.message : 'Error al crear la promoción');
    } finally {
      setEnviando(false);
    }
  };

  const campo = (field: keyof CrearPromocionDto, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <h2>Nueva promoción</h2>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nombre</label>
        <input value={form.nombre} onChange={(e) => campo('nombre', e.target.value)} placeholder="Ej: Descuento de verano" />
        {errores.nombre && <p className="error">{errores.nombre}</p>}
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Producto o categoría</label>
        <input value={form.productoCategoria} onChange={(e) => campo('productoCategoria', e.target.value)} placeholder="Ej: Bebidas" />
        {errores.productoCategoria && <p className="error">{errores.productoCategoria}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tipo de descuento</label>
          <select value={form.tipoDescuento} onChange={(e) => campo('tipoDescuento', e.target.value as TipoDescuento)}>
            <option value="PORCENTAJE">Porcentaje (%)</option>
            <option value="MONTO_FIJO">Monto fijo ($)</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valor</label>
          <input
            type="number"
            min={0}
            step={form.tipoDescuento === 'PORCENTAJE' ? 1 : 100}
            value={form.valorDescuento || ''}
            onChange={(e) => campo('valorDescuento', Number(e.target.value))}
            placeholder={form.tipoDescuento === 'PORCENTAJE' ? '1–100' : 'Ej: 5000'}
          />
          {errores.valorDescuento && <p className="error">{errores.valorDescuento}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fecha de inicio</label>
          <input type="date" value={form.fechaInicio} onChange={(e) => campo('fechaInicio', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fecha de fin</label>
          <input type="date" value={form.fechaFin} onChange={(e) => campo('fechaFin', e.target.value)} />
          {errores.fechaFin && <p className="error">{errores.fechaFin}</p>}
        </div>
      </div>

      {errorApi && <p className="error">{errorApi}</p>}

      <button
        type="submit"
        disabled={enviando}
        style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', justifySelf: 'start' }}
      >
        {enviando ? 'Guardando...' : 'Crear promoción'}
      </button>
    </form>
  );
}
