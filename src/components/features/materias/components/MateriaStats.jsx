import { motion } from "framer-motion";
import { FiFileText, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";

const MateriaStats = ({ stats }) => {
  const statCards = [
    {
      label: "Apuntes",
      value: stats.apuntes,
      icon: FiFileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Tareas pendientes",
      value: stats.tareasPendientes,
      icon: FiClock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      subValue: `${stats.tareasCompletadas} completadas`
    },
    {
      label: "Proyectos",
      value: stats.proyectos,
      icon: FiTrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      subValue: `${stats.proyectosCompletados} completados`
    },
    {
      label: "Progreso",
      value: `${Math.round(((stats.tareasCompletadas + stats.proyectosCompletados) / 
        Math.max(stats.tareasPendientes + stats.tareasCompletadas + stats.proyectos, 1)) * 100)}%`,
      icon: FiCheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${stat.bg} ${stat.border} border rounded-2xl p-5 relative overflow-hidden group`}
          >
            <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-4xl opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative z-10">
              <p className={`text-3xl font-black ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                {stat.label}
              </p>
              {stat.subValue && (
                <p className="text-[9px] text-gray-700 mt-2 font-medium">
                  {stat.subValue}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MateriaStats;
