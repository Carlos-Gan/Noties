import { FiLayers, FiAlertCircle } from "react-icons/fi";
import { TIPOS_EVALUACION } from "./constants";

const VistaEstadisticas = ({ estadisticas }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Por materia */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Por Materia</h3>
        <div className="space-y-4">
          {Object.values(estadisticas.porMateria).map((m) => (
            <div key={m.materia}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-sm text-white">{m.materia}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {m.evaluadas}/{m.total} · Prom {m.promedio}
                  </span>
                  <span
                    className={`text-xs font-bold ${m.porcentajeTotal > 100 ? "text-red-400" : "text-green-400"}`}
                  >
                    {m.porcentajeTotal}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.porcentajeTotal > 100 ? "bg-red-500" : "bg-purple-500"}`}
                  style={{ width: `${Math.min(m.porcentajeTotal, 100)}%` }}
                />
              </div>
              {m.porcentajeTotal > 100 && (
                <p className="text-[8px] text-red-400 mt-1">
                  Exceso: {m.porcentajeTotal - 100}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Por tipo */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Por Tipo</h3>
        <div className="space-y-4">
          {Object.entries(estadisticas.porTipo).map(([tipo, data]) => {
            const tipoInfo = TIPOS_EVALUACION[tipo] || TIPOS_EVALUACION.otro;
            return (
              <div key={tipo}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${tipoInfo.color}`}>
                    {tipoInfo.icon} {tipoInfo.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {data.evaluadas}/{data.total} evaluadas
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(data.evaluadas / data.total) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Por unidad */}
      {Object.keys(estadisticas.porUnidad).length > 0 && (
        <div className="lg:col-span-2 bg-[#1e1e1e] rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FiLayers className="text-purple-400" />
            Por Unidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(estadisticas.porUnidad).map(([key, data]) => {
              const porcentajeTotal = data.porcentajeTotal;
              const porcentajeRestante = 100 - porcentajeTotal;
              const colorPorcentaje =
                porcentajeTotal > 100
                  ? "text-red-400"
                  : porcentajeTotal === 100
                    ? "text-green-400"
                    : "text-yellow-400";

              return (
                <div key={key} className="bg-[#2a2a2a] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white">{data.unidad}</h4>
                      <p className="text-[10px] text-gray-500">{data.materia}</p>
                    </div>
                    <span className={`text-xs font-bold ${colorPorcentaje}`}>
                      {porcentajeTotal}%
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>
                      {data.evaluadas}/{data.total} evaluadas
                    </span>
                    <span>Prom {data.promedio}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-gray-600">
                      <span>Progreso de la unidad</span>
                      <span>{porcentajeTotal}% completado</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          porcentajeTotal > 100
                            ? "bg-red-500"
                            : porcentajeTotal === 100
                              ? "bg-green-500"
                              : "bg-purple-500"
                        }`}
                        style={{ width: `${Math.min(porcentajeTotal, 100)}%` }}
                      />
                    </div>

                    {porcentajeTotal < 100 && (
                      <p className="text-[9px] text-gray-600 mt-1">
                        Falta {porcentajeRestante}% para completar la unidad
                      </p>
                    )}
                    {porcentajeTotal > 100 && (
                      <p className="text-[9px] text-red-400 mt-1">
                        ⚠️ Exceso: {porcentajeTotal - 100}% sobre el 100%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Próximas evaluaciones */}
      <div className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FiAlertCircle />
          Próximas evaluaciones pendientes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {estadisticas.proximas.map((item) => {
            const tipo = TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
            const dias = Math.ceil(
              (new Date(item.fecha) - new Date()) / (1000 * 60 * 60 * 24),
            );

            return (
              <div key={item.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="font-bold text-white">{item.nombre}</p>
                <p className="text-xs text-white/80 mt-1">{item.materia_nombre}</p>
                {item.unidad && (
                  <p className="text-[10px] text-white/60 mt-1">{item.unidad}</p>
                )}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] text-white/60">
                    {tipo.icon} {tipo.label}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {dias === 0 ? "Hoy" : dias === 1 ? "Mañana" : `${dias} días`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VistaEstadisticas;