// /components/features/tareas/components/FiltrosTareas.jsx
const FiltrosTareas = ({ filtros, onChange, materias }) => {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <select
        value={filtros.prioridad}
        onChange={(e) => onChange({ ...filtros, prioridad: e.target.value })}
        className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
      >
        <option value="todas">Todas las prioridades</option>
        <option value="alta">🔴 Alta</option>
        <option value="media">🟡 Media</option>
        <option value="baja">🟢 Baja</option>
      </select>

      <select
        value={filtros.materia}
        onChange={(e) => onChange({ ...filtros, materia: e.target.value })}
        className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
      >
        <option value="todas">Todas las materias</option>
        {materias.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nombre}
          </option>
        ))}
      </select>

      <select
        value={filtros.orden}
        onChange={(e) => onChange({ ...filtros, orden: e.target.value })}
        className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
      >
        <option value="fecha">Por fecha</option>
        <option value="prioridad">Por prioridad</option>
        <option value="materia">Por materia</option>
      </select>

      {filtros.busqueda && (
        <button
          onClick={() => onChange({ ...filtros, busqueda: "" })}
          className="text-[10px] text-gray-500 hover:text-white"
        >
          Limpiar ✕
        </button>
      )}
    </div>
  );
};

export default FiltrosTareas;