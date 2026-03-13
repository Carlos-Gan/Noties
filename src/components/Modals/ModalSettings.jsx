import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.92, y: 40 },
};

const ModalSettings = ({
  isOpen, onClose, formatoHora, onCambiarFormatoHora, onAbrirAdmin,
}) => {
  const [fechaFin, setFechaFin] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [duracionMeses, setDuracionMeses] = useState("");
  const [guardadoSemestre, setGuardadoSemestre] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Cargar config del semestre al abrir
  useEffect(() => {
    if (!isOpen) return;
    const cargar = async () => {
      const ff = await window.electronAPI.invoke("config:get", "semestre_fecha_fin");
      const fi = await window.electronAPI.invoke("config:get", "semestre_fecha_inicio");
      const dm = await window.electronAPI.invoke("config:get", "semestre_duracion_meses");
      if (ff) setFechaFin(ff);
      if (fi) setFechaInicio(fi);
      if (dm) setDuracionMeses(dm);
    };
    cargar();
  }, [isOpen]);

  const guardarSemestre = async () => {
    await window.electronAPI.invoke("config:set", "semestre_fecha_fin", fechaFin);
    await window.electronAPI.invoke("config:set", "semestre_fecha_inicio", fechaInicio);
    await window.electronAPI.invoke("config:set", "semestre_duracion_meses", duracionMeses);
    await window.electronAPI.invoke("config:set", "semestre_ya_archivo", "false");
    setGuardadoSemestre(true);
    setTimeout(() => setGuardadoSemestre(false), 2000);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            variants={backdrop} initial="hidden" animate="visible" exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            variants={modal} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-md bg-[#1e1e1e] rounded-[28px] border border-white/8 shadow-2xl overflow-hidden"
          >
            {/* Accent top */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="bg-white/5 p-2 rounded-xl text-base">⚙️</span>
                Configuración
              </h2>
            </div>

            <div className="px-7 py-5 space-y-2 max-h-[70vh] overflow-y-auto">

              {/* ─── Sección: Apariencia ─── */}
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-1 pt-1">
                Apariencia
              </p>

              <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Formato de hora</p>
                    <p className="text-xs text-gray-500 mt-0.5">Para el horario de clases</p>
                  </div>
                  <div className="flex bg-black/40 p-1 rounded-xl gap-0.5">
                    {["12h", "24h"].map((f) => (
                      <button
                        key={f}
                        onClick={() => onCambiarFormatoHora(f)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          formatoHora === f
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-500 hover:text-white"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── Sección: Estructura ─── */}
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-1 pt-3">
                Clases
              </p>

              <button
                onClick={() => { onClose(); onAbrirAdmin(); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-base">
                    📋
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Estructura de clases</p>
                    <p className="text-xs text-gray-500 mt-0.5">Agregar o modificar parámetros</p>
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-white transition text-lg">→</span>
              </button>

              {/* ─── Sección: Semestre ─── */}
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-1 pt-3">
                Semestre automático
              </p>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-base">
                      🎓
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Archivado automático</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Archiva materias al terminar el semestre
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Opción 1: Fecha exacta */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black block mb-1.5">
                      📅 Fecha de fin del semestre
                    </label>
                    <input
                      type="date"
                      className="w-full bg-[#161616] border border-white/5 rounded-xl p-2.5 text-white text-sm outline-none focus:border-green-500/40 transition-all"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  {/* Divisor */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] text-gray-600 font-black">O</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {/* Opción 2: Duración */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black block mb-1.5">
                        🚀 Inicio del semestre
                      </label>
                      <input
                        type="date"
                        className="w-full bg-[#161616] border border-white/5 rounded-xl p-2.5 text-white text-sm outline-none focus:border-green-500/40 transition-all"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black block mb-1.5">
                        ⏱ Duración (meses)
                      </label>
                      <input
                        type="number"
                        min="1" max="12"
                        className="w-full bg-[#161616] border border-white/5 rounded-xl p-2.5 text-white text-sm outline-none focus:border-green-500/40 transition-all"
                        placeholder="4"
                        value={duracionMeses}
                        onChange={(e) => setDuracionMeses(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={guardarSemestre}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      guardadoSemestre
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                    }`}
                  >
                    {guardadoSemestre ? "✓ Configuración guardada" : "Guardar configuración"}
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-white/5">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalSettings;