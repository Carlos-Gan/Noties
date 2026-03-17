import { TIPOS_EVALUACION } from "./constants";

const VistaLista = ({ evaluaciones, onContextMenu }) => {
  return (
    <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 bg-[#2a2a2a] text-[10px] font-bold text-gray-500 uppercase">
        <div className="col-span-3">Nombre</div>
        <div className="col-span-2">Materia</div>
        <div className="col-span-1">Unidad</div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-1">%</div>
        <div className="col-span-2">Fecha</div>
        <div className="col-span-1">Calif</div>
      </div>

      <div className="divide-y divide-white/5">
        {evaluaciones.map((item) => {
          const tipo = TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
          return (
            <div
              key={item.id}
              onContextMenu={(e) => onContextMenu(e, item)}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors group relative"
            >
              <div className="col-span-3 font-medium text-white flex items-center gap-2">
                <span className={tipo.color}>{tipo.icon}</span>
                {item.nombre}
              </div>
              <div className="col-span-2">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    color: item.materia_color,
                    backgroundColor: `${item.materia_color}20`,
                  }}
                >
                  {item.materia_nombre}
                </span>
              </div>
              <div className="col-span-1 text-gray-400">
                {item.unidad || <span className="text-gray-700">—</span>}
              </div>
              <div className="col-span-2">
                <span className={`text-xs ${tipo.color}`}>{tipo.label}</span>
              </div>
              <div className="col-span-1 text-gray-400">{item.porcentaje}%</div>
              <div className="col-span-2 text-gray-400">
                {new Date(item.fecha).toLocaleDateString()}
              </div>
              <div className="col-span-1">
                {item.calificacion ? (
                  <span className="font-bold text-white">{item.calificacion}</span>
                ) : (
                  <span className="text-yellow-400">—</span>
                )}
              </div>

              {/* Indicador de menú contextual */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600">
                ⋮
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VistaLista;