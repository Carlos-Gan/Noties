import { motion } from "framer-motion";

const PredictorUnidades = ({
  materias,
  statsPorMateria,
  onSeleccionarUnidad,
}) => {
  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500 mb-2">
        Selecciona una materia para ver sus unidades
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materias.map((materia) => {
          const stats = statsPorMateria[materia.id];
          if (!stats || Object.keys(stats.porUnidad).length === 0) return null;

          return (
            <div
              key={materia.id}
              className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: materia.color }}
                />
                <h3 className="font-bold text-white">{materia.nombre}</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.porUnidad).map(([unidad, data]) => {
                  const evaluadasUnidad = data.evaluaciones.filter(
                    (e) => e.calificacion !== null,
                  ).length;
                  const totalUnidad = data.evaluaciones.length;

                  return (
                    <motion.div
                      key={unidad}
                      whileHover={{ x: 2 }}
                      onClick={() => onSeleccionarUnidad(materia, unidad)}
                      className="bg-[#2a2a2a] rounded-lg p-3 cursor-pointer hover:bg-[#333] transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">
                          {unidad}
                        </span>
                        <span className="text-xs text-purple-400">
                          {data.promedio.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                        <span>
                          {evaluadasUnidad}/{totalUnidad} evaluaciones
                        </span>
                        <span>{data.porcentajeTotal}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${data.porcentajeTotal}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictorUnidades;
