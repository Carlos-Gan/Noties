import { motion } from "framer-motion";

const PredictorMateriaCard = ({ materia, stats, onClick }) => {
  const promedio = parseFloat(stats.promedioActual);
  const colorPromedio =
    promedio >= 8
      ? "text-green-400"
      : promedio >= 7
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: materia.color }}
          />
          <span className="font-bold text-white">{materia.nombre}</span>
        </div>
        <span className={`text-lg font-black ${colorPromedio}`}>
          {stats.promedioActual}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 mb-2">
        <span>{stats.evaluadas} evaluadas</span>
        <span>{stats.pendientes} pendientes</span>
        <span>{stats.porcentajeCompletado}% completo</span>
      </div>

      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stats.porcentajeCompletado}%` }}
          className="h-full bg-purple-500 rounded-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-[8px]">
        <div className="text-center">
          <span className="text-red-400">
            🐻 {stats.escenarios.pesimista.toFixed(1)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-yellow-400">
            😐 {stats.escenarios.realista.toFixed(1)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-green-400">
            🚀 {stats.escenarios.optimista.toFixed(1)}
          </span>
        </div>
      </div>

      {Object.keys(stats.porUnidad).length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex gap-1 flex-wrap">
            {Object.keys(stats.porUnidad).map((unidad) => (
              <span
                key={unidad}
                className="text-[8px] bg-white/5 px-2 py-1 rounded-full text-gray-400"
              >
                {unidad}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PredictorMateriaCard;
