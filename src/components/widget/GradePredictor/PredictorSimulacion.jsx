import { TIPOS_EVALUACION } from "./constants";

const PredictorSimulacion = ({
  materias,
  statsPorMateria,
  simulacionData,
  onSimulacionChange,
  calcularSimulacion,
}) => {
  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500 mb-4">
        Simula diferentes escenarios ajustando las calificaciones pendientes
      </p>

      {materias.map((materia) => {
        const stats = statsPorMateria[materia.id];
        if (!stats || stats.pendientes === 0) return null;

        const resultadoSimulacion = calcularSimulacion(materia.id);
        const original = parseFloat(stats.promedioActual);

        return (
          <div
            key={materia.id}
            className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: materia.color }}
                />
                <span className="font-bold text-white">{materia.nombre}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">
                  Actual: {original}
                </span>
                {resultadoSimulacion && (
                  <span className="text-sm font-bold text-purple-400">
                    → {resultadoSimulacion.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {stats.evaluaciones
                .filter((item) => item.calificacion === null)
                .map((item) => {
                  const tipo =
                    TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className={`text-[10px] ${tipo.color} w-16`}>
                        {tipo.label}
                      </span>
                      <span className="text-[10px] text-gray-600 w-12">
                        {item.porcentaje}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={simulacionData[materia.id]?.[item.tipo] || 8}
                        onChange={(e) =>
                          onSimulacionChange(
                            materia.id,
                            item.tipo,
                            parseFloat(e.target.value),
                          )
                        }
                        className="flex-1 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      />
                      <span className="text-xs font-bold text-white w-8">
                        {simulacionData[materia.id]?.[item.tipo] || 8}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}

      {materias.every((m) => !statsPorMateria[m.id]?.pendientes) && (
        <div className="text-center py-8 text-gray-600">
          <p className="text-2xl mb-2">🎯</p>
          <p className="text-sm">No hay evaluaciones pendientes para simular</p>
        </div>
      )}
    </div>
  );
};

export default PredictorSimulacion;
