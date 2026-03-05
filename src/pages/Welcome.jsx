import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function WelcomeScreen({ onVaultListo }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleCrear = async () => {
    setCargando(true);
    setError(null);
    try {
      const result = await window.electron.invoke("vault:crear");
      if (result.ok) {
        onVaultListo();
      } else {
        setError("No se seleccionó ninguna ubicación.");
        setCargando(false); // <--- Importante para reactivar botones
      }
    } catch (err) {
      setError("Error al crear la base de datos.");
      setCargando(false);
    }
  };

  const handleAbrir = async () => {
    setCargando(true);
    setError(null);
    try {
      const result = await window.electron.invoke('vault:abrir');
      if (result.ok) {
        onVaultListo();
      } else {
        setError('No se seleccionó ningún archivo.');
        setCargando(false); // <--- Importante para reactivar botones
      }
    } catch (err) {
      setError('El archivo seleccionado no es un vault válido.');
      setCargando(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[#141414] overflow-hidden">
      {/* Fondo animado — puntos de luz */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${180 + i * 60}px`,
              height: `${180 + i * 60}px`,
              left: `${[10, 70, 30, 80, 50, 20][i]}%`,
              top: `${[20, 60, 80, 10, 50, 40][i]}%`,
              background: `radial-gradient(circle, ${
                [
                  "#3b82f620",
                  "#6366f115",
                  "#8b5cf610",
                  "#3b82f608",
                  "#6366f108",
                  "#8b5cf606",
                ][i]
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7,
            }}
          />
        ))}
      </div>

      {/* Línea decorativa superior */}
      <motion.div
        className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
        initial={{ width: 0, left: "50%" }}
        animate={{ width: "100%", left: "0%" }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md">
        {/* Icono */}
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.2,
          }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl shadow-2xl shadow-blue-900/40">
            🧠
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl font-black text-white tracking-tight mb-2"
          style={{ fontFamily: "system-ui" }}
        >
          Noties
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-gray-500 text-sm mb-12 leading-relaxed"
        >
          Tu segundo cerebro para la universidad.
          <br />
          Elige dónde guardar tu vault para comenzar.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col gap-3 w-full"
        >
          <button
            onClick={handleCrear}
            disabled={cargando}
            className="group relative w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-xl shadow-blue-900/30 border border-blue-500/30 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-base">✨</span>
              Crear nuevo vault
            </span>
          </button>

          <button
            onClick={handleAbrir}
            disabled={cargando}
            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all border border-white/5 hover:border-white/10 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-base">📂</span>
              Abrir vault existente
            </span>
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-red-400 text-xs"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Loader */}
        <AnimatePresence>
          {cargando && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center gap-2 text-gray-500 text-xs"
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              Conectando vault...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Línea decorativa inferior */}
      <motion.div
        className="absolute bottom-0 right-0 h-[1px] bg-gradient-to-l from-transparent via-indigo-500/30 to-transparent"
        initial={{ width: 0, right: "50%" }}
        animate={{ width: "100%", right: "0%" }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Versión */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 text-[10px] text-gray-700 uppercase tracking-widest"
      >
        Noties v0.1 — Tu cerebro, tu vault
      </motion.span>
    </div>
  );
}
