import { TIPOS_EVALUACION } from "./constants";

const PredictorDetalleMateria = ({
  materia,
  stats,
  selectedUnidad,
  onVolver,
  onMateriaClick,
}) => {
  const unidadDetalle =
    selectedUnidad && stats.porUnidad[selectedUnidad]
      ? {
          ...stats.porUnidad[selectedUnidad],
          evaluaciones: stats.evaluaciones.filter(
            (e) => e.unidad === selectedUnidad,
          ),
        }
      : null;

  const evaluacionesMostrar = selectedUnidad
    ? unidadDetalle?.evaluaciones
    : stats.contribucion;

  return (
    <div className="space-y-6">
      {/* Header de la materia */}
      <div className="flex items-center justify-between">
        <button
          onClick={onVolver}
          className="text-xs text-gray-600 hover:text-white"
        >
          ← Volver
        </button>
        <button
          onClick={() => onMateriaClick?.(materia)}
          className="text-xs text-purple-400 hover:text-purple-300"
        >
          Ver materia →
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${materia.color}20` }}
        >
          {materia.icono || "📚"}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{materia.nombre}</h3>
          <p className="text-xs text-gray-500">
            Prof. {materia.profesor || "No asignado"}
          </p>
          {selectedUnidad && (
            <p className="text-xs text-purple-400 mt-1">{selectedUnidad}</p>
          )}
        </div>
      </div>

      {/* Proyección Final de la Materia */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Proyección Final</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-white/70">Mínimo</p>
            <p className="text-2xl font-black text-white">
              {stats.proyeccionFinal.minimo.toFixed(1)}
            </p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-xs text-white/70">Esperado</p>
            <p className="text-2xl font-black text-white">
              {stats.proyeccionFinal.esperado.toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/70">Máximo</p>
            <p className="text-2xl font-black text-white">
              {stats.proyeccionFinal.maximo.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Escenarios */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Pesimista",
            value: stats.escenarios.pesimista,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
          {
            label: "Realista",
            value: stats.escenarios.realista,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Optimista",
            value: stats.escenarios.optimista,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
        ].map((esc) => (
          <div
            key={esc.label}
            className={`${esc.bg} rounded-xl p-4 text-center`}
          >
            <p className={`text-2xl font-black ${esc.color}`}>
              {esc.value.toFixed(1)}
            </p>
            <p className="text-[9px] text-gray-600 mt-1">{esc.label}</p>
          </div>
        ))}
      </div>

      {/* Lista detallada de evaluaciones */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-500">
          {selectedUnidad
            ? `Evaluaciones de ${selectedUnidad}`
            : "Todas las evaluaciones"}
        </p>
        {evaluacionesMostrar.map((item) => {
          const tipo = TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
          return (
            <div key={item.id} className="bg-[#1e1e1e] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={tipo.color}>{tipo.icon}</span>
                  <span className="text-sm font-bold text-white">
                    {item.nombre}
                  </span>
                </div>
                {item.calificacion ? (
                  <span className="text-lg font-black text-white">
                    {item.calificacion}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600">Pendiente</span>
                )}
              </div>
              <div className="flex justify-between text-[9px] text-gray-600 mb-1">
                <span>
                  {tipo.label} · {item.porcentaje}%
                </span>
                {item.calificacion && (
                  <span>Aporta {item.contribucion} pts</span>
                )}
              </div>
              {item.calificacion && (
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(item.calificacion / 10) * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictorDetalleMateria;
