import { FiCalendar } from "react-icons/fi";
import { TIPOS_EVALUACION } from "./constants";

const VistaCalendario = ({ evaluacionesPorFecha, onContextMenu }) => {
  return (
    <div className="space-y-4">
      {Object.entries(evaluacionesPorFecha)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .map(([fecha, items]) => (
          <div
            key={fecha}
            className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <FiCalendar className="text-purple-400" />
              <h3 className="font-bold text-white">
                {new Date(fecha).toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded-full">
                {items.length} evaluación{items.length !== 1 ? "es" : ""}
              </span>
            </div>

            <div className="grid gap-2">
              {items.map((item) => {
                const tipo = TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                return (
                  <div
                    key={item.id}
                    onContextMenu={(e) => onContextMenu(e, item)}
                    className="flex items-center gap-4 p-3 bg-[#2a2a2a] rounded-xl hover:bg-[#333] cursor-pointer transition-all group"
                  >
                    <div
                      className={`w-10 h-10 ${tipo.bg} rounded-xl flex items-center justify-center text-xl`}
                    >
                      {tipo.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{item.nombre}</p>
                      <p className="text-[10px] text-gray-500">
                        {item.materia_nombre} ·{" "}
                        {item.unidad ? `${item.unidad} · ` : ""}
                        {tipo.label} · {item.porcentaje}%
                      </p>
                    </div>
                    {item.calificacion ? (
                      <div className="text-right">
                        <p className="text-xl font-black text-white">
                          {item.calificacion}
                        </p>
                        <p className="text-[8px] text-gray-600">Calificado</p>
                      </div>
                    ) : (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default VistaCalendario;