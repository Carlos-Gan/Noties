import { motion, AnimatePresence } from "framer-motion";

const ModalSemestreArchivado = ({ isOpen, onClose, materias = [] }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-[#242424] w-full max-w-md rounded-[32px] border border-white/10 p-8 relative shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-600 rounded-t-[32px]" />

            {/* Icono */}
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mx-auto mb-6">
              🎓
            </div>

            <h2 className="text-xl font-black text-white text-center mb-2">
              ¡Semestre completado!
            </h2>
            <p className="text-xs text-gray-500 text-center mb-8">
              Las siguientes materias fueron archivadas automáticamente.
            </p>

            {/* Lista de materias archivadas */}
            <div className="space-y-2 mb-8 max-h-48 overflow-y-auto">
              {materias.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: m.color || "#3b82f6" }}
                  />
                  <span className="text-sm text-white font-medium truncate">{m.nombre}</span>
                  <span className="ml-auto text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                    Archivada
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-600 text-center mb-6">
              Puedes acceder a ellas desde la sección de materias archivadas.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all shadow-lg shadow-green-900/30"
            >
              Comenzar nuevo semestre 🚀
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalSemestreArchivado;