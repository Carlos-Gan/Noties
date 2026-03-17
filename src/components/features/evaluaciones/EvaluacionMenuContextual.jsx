import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const EvaluacionMenuContextual = ({
  menuContextual,
  onClose,
  onEditar,
  onEliminar,
}) => {
  return (
    <AnimatePresence>
      {menuContextual && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl py-1 w-48"
            style={{ top: menuContextual.y, left: menuContextual.x }}
          >
            <button
              onClick={() => onEditar(menuContextual.evaluacion)}
              className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-2"
            >
              <FiEdit2 size={12} />
              Editar evaluación
            </button>
            <button
              onClick={() => onEliminar(menuContextual.evaluacion.id)}
              className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <FiTrash2 size={12} />
              Eliminar
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EvaluacionMenuContextual;
