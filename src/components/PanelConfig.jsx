import { useState } from 'react';

const PanelConfiguracion = ({ campos, onAgregar }) => {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('text');

  return (
    <div className="bg-[#2a2a2a] p-6 rounded-3xl border border-white/5 shadow-2xl">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <span className="text-blue-500">⚙️</span> Propiedades Globales
      </h3>
      
      {/* Lista de campos actuales */}
      <div className="space-y-2 mb-6">
        {campos.map(c => (
          <div key={c.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
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

      {/* Formulario para AGREGAR un nuevo parámetro (Link, Salón, etc) */}
      <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-blue-500/20">
        <p className="text-[10px] text-blue-400 font-bold uppercase mb-3 tracking-widest">Añadir Nueva Propiedad</p>
        <div className="flex flex-col gap-3">
          <input 
            className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none"
            placeholder="Nombre (ej: Link de Zoom)"
            value={nuevoNombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <select 
            className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-400 outline-none"
            value={nuevoTipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="text">Texto Corto</option>
            <option value="multi-select">Selección Múltiple</option>
            <option value="select">Selección Única</option>
          </select>
          <button 
            onClick={() => onAgregar({ id: Date.now(), label: nuevoNombre, type: nuevoTipo, icon: '🔗' })}
            className="bg-blue-600 py-2 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all"
          >
            + Aplicar a todas las materias
          </button>
        </div>
      </div>
    </div>
  );
};