// /components/features/tareas/components/TareasEmptyState.jsx
import { motion } from "framer-motion";

const TareasEmptyState = ({ onCrearTarea, mensaje }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="text-5xl mb-4 opacity-30">📋</div>
      <p className="text-gray-600 font-medium mb-2">
        {mensaje || "No hay tareas pendientes"}
      </p>
      <p className="text-xs text-gray-700 mb-6">
        Mantén tu productividad al día
      </p>
      <button
        onClick={onCrearTarea}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-xs font-bold transition-all"
      >
        + Crear primera tarea
      </button>
    </motion.div>
  );
};

export default TareasEmptyState;