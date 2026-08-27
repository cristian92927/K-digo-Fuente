import { useCallback, useEffect, useState } from 'react';
import { api, CrearPromocionDto, Promocion, Resumen } from './api/promociones';
import { ResumenCards } from './components/ResumenCards';
import { FormPromocion } from './components/FormPromocion';
import { TablaPromociones } from './components/TablaPromociones';

const resumenVacio: Resumen = { PROGRAMADA: 0, ACTIVA: 0, FINALIZADA: 0, vigentesHoy: 0 };

export default function App() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [resumen, setResumen] = useState<Resumen>(resumenVacio);
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState('');

  const cargar = useCallback(async () => {
    try {
      const [lista, res] = await Promise.all([api.listar(), api.resumen()]);
      setPromociones(lista);
      setResumen(res);
    } catch {
      setErrorGlobal('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (data: CrearPromocionDto) => {
    await api.crear(data);
    await cargar();
  };

  const handleAvanzar = async (id: number) => {
    await api.avanzarEstado(id);
    await cargar();
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    await api.eliminar(id);
    await cargar();
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1>Gestión de Promociones</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Registra y controla el ciclo de vida de tus promociones
        </p>
      </div>

      {errorGlobal && (
        <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '10px 16px', borderRadius: 'var(--radius)', marginBottom: 20 }}>
          {errorGlobal}
        </div>
      )}

      <ResumenCards resumen={resumen} />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
        <FormPromocion onCrear={handleCrear} />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
        <h2 style={{ marginBottom: 16 }}>Promociones</h2>
        {cargando ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : (
          <TablaPromociones
            promociones={promociones}
            onAvanzar={handleAvanzar}
            onEliminar={handleEliminar}
          />
        )}
      </div>
    </div>
  );
}
