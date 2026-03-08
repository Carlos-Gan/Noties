import { useState } from 'react';

const PanelConfiguracion = ({ campos, onAgregar, formatoHora, onCambiarFormatoHora }) => {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('text');

  const handleAgregar = () => {
    if (!nuevoNombre.trim()) return;
    onAgregar({
      id: `custom_${Date.now()}`,
      label: nuevoNombre.trim(),
      type: nuevoTipo,
      icon: '🔹',
      value: nuevoTipo === 'multi-select' ? [] : '',
    });
    setNuevoNombre('');
    setNuevoTipo('text');
  };

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-3xl border border-white/5 shadow-2xl space-y-6">
      <h3 className="text-white font-bold flex items-center gap-2">
        <span>⚙️</span> Configuración Global
      </h3>

      {/* ─── Formato de hora ───────────────────────── */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Formato de hora</p>
            <p className="text-xs text-gray-500 mt-0.5">Para el horario de clases</p>
          </div>
          <div className="flex gap-1 bg-black/30 p-1 rounded-xl">
            {['12h', '24h'].map(f => (
              <button
                key={f}
                onClick={() => onCambiarFormatoHora(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  formatoHora === f
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Propiedades globales ──────────────────── */}
      <div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">
          Propiedades de Materias
        </p>
        <div className="space-y-2">
          {campos.map(c => (
            <div
              key={c.id}
              className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="opacity-50">{c.icon || '🔹'}</span>
                <span className="text-sm text-gray-200">{c.label}</span>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-500 uppercase font-bold">
                {c.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Agregar propiedad ─────────────────────── */}
      <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-blue-500/20">
        <p className="text-[10px] text-blue-400 font-bold uppercase mb-3 tracking-widest">
          Añadir Nueva Propiedad
        </p>
        <div className="flex flex-col gap-3">
          <input
            className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Nombre (ej: Link de Zoom)"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)} // ← bug corregido
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
          />
          <select
            className="bg-[#2a2a2a] border border-white/10 rounded-lg p-2 text-sm text-gray-400 outline-none"
            value={nuevoTipo}
            onChange={(e) => setNuevoTipo(e.target.value)} // ← bug corregido
          >
            <option value="text">Texto Corto</option>
            <option value="number">Número</option>
            <option value="select">Selección Única</option>
            <option value="multi-select">Selección Múltiple</option>
          </select>
          <button
            onClick={handleAgregar}
            disabled={!nuevoNombre.trim()}
            className="bg-blue-600 py-2 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Aplicar a todas las materias
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelConfiguracion;