import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const CommandPalette = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState("");

  // Cerrar con la tecla Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro traslúcido */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Buscador estilo macOS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-[#2a2a2a]/90 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center p-4 border-b border-white/5">
              <span className="text-xl mr-3 opacity-50">🔍</span>
              <input 
                autoFocus
                placeholder="Busca materias, tareas o apuntes..."
                className="bg-transparent w-full outline-none text-lg text-white"
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-500 border border-white/10">ESC</kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 px-3 py-2">Resultados recientes</p>
              {/* Aquí mapearás tus resultados de la base de datos después */}
              <div className="flex items-center p-3 hover:bg-blue-500/20 rounded-xl cursor-pointer group">
                <span className="mr-3">📘</span>
                <div>
                  <p className="text-sm text-white group-hover:text-blue-200">Matemáticas Aplicadas</p>
                  <p className="text-xs text-gray-500">Materia • 12 apuntes</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;