import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  exit: { opacity: 0, scale: 0.92, y: 40 },
};

const ModalSettings = ({
  isOpen,
  onClose,
  formatoHora,
  onCambiarFormatoHora,
  onAbrirAdmin,
}) => {

  // cerrar con ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          {/* BACKDROP */}
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* MODAL */}
          <motion.div
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-[#242424] rounded-[28px] border border-white/10 shadow-2xl p-7 overflow-hidden"
          >

            {/* TOP ACCENT */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-[28px]" />

            {/* HEADER */}
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <span className="bg-white/5 p-2 rounded-lg">⚙️</span>
              Configuración
            </h2>

            <div className="space-y-4">

              {/* FORMATO DE HORA */}
              <div className="bg-white/[0.04] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Formato de hora
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Para el horario de clases
                    </p>
                  </div>

                  <div className="flex bg-black/30 p-1 rounded-lg">
                    {["12h", "24h"].map((f) => (
                      <button
                        key={f}
                        onClick={() => onCambiarFormatoHora(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all
                        ${
                          formatoHora === f
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* ADMIN ESTRUCTURA */}
              <button
                onClick={() => {
                  onClose();
                  onAbrirAdmin();
                }}
                className="
                w-full flex items-center justify-between
                p-4 rounded-xl
                bg-white/[0.04]
                border border-white/10
                hover:bg-white/[0.08]
                hover:border-white/20
                transition-all
                group
                "
              >
                <div className="flex items-center gap-3">

                  <span className="text-lg">📋</span>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      Estructura de clases
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Agregar o modificar parámetros
                    </p>
                  </div>

                </div>

                <span className="text-gray-500 group-hover:text-white transition">
                  →
                </span>
              </button>

            </div>

            {/* FOOTER */}
            <button
              onClick={onClose}
              className="
              w-full mt-7
              py-3
              rounded-xl
              text-sm font-semibold
              bg-white/5
              text-gray-400
              hover:bg-white/10
              hover:text-white
              transition-all
              "
            >
              Cerrar
            </button>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalSettings;