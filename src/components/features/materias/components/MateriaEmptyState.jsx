import { motion } from "framer-motion";
import { FiFileText, FiCheckSquare, FiPackage, FiPlus } from "react-icons/fi";

const MateriaEmptyState = ({ 
  materia,
  onCrearApunte,
  onCrearTarea,
  onCrearProyecto
}) => {
  const actions = [
    {
      label: "Crear apunte",
      icon: FiFileText,
      onClick: onCrearApunte,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      label: "Crear tarea",
      icon: FiCheckSquare,
      onClick: onCrearTarea,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20"
    },
    {
      label: "Crear proyecto",
      icon: FiPackage,
      onClick: onCrearProyecto,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icono de la materia */}
      <div className="relative mb-6">
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-2xl"
          style={{ backgroundColor: `${materia.color}20` }}
        >
          {materia.icono || "📚"}
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-[#1a1a1a] flex items-center justify-center text-xs font-black">
          +
        </div>
      </div>

      <h2 className="text-2xl font-black text-white mb-2">
        {materia.nombre}
      </h2>
      <p className="text-gray-500 text-sm mb-2">
        Prof. {materia.profesor || "No asignado"}
      </p>
      <p className="text-xs text-gray-700 mb-8 max-w-md">
        Esta materia aún no tiene contenido. Comienza agregando apuntes, tareas o proyectos.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={`flex items-center gap-2 px-4 py-3 ${action.bg} ${action.border} border rounded-xl text-xs font-bold transition-all`}
            >
              <Icon className={action.color} size={14} />
              <span className={action.color}>{action.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Semestre */}
      <div className="mt-8 text-[10px] text-gray-700 font-black uppercase tracking-widest">
        Semestre {materia.semestre || 1}º
      </div>
    </motion.div>
  );
};

export default MateriaEmptyState;