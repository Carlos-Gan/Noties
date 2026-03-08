import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ModalNuevaTarea = ({
  isOpen,
  onClose,
  onSave,
  materias = [],
  fechaInicial = null,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [materiaId, setMateriaId] = useState(materias[0]?.id || "");
  const [fecha, setFecha] = useState(
    fechaInicial ? fechaInicial.toISOString().split("T")[0] : "",
  );

  const handleSave = async () => {
    if (!nombre.trim() || !materiaId) return;
    await onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      materia_id: materiaId,
      fecha_limite: fecha || null,
    });
    setNombre("");
    setDescripcion("");
    setPrioridad("media");
    setFecha("");
    onClose();
  };

  const fechaLabel = fechaInicial
    ? `${fechaInicial.getDate()} de ${MESES[fechaInicial.getMonth()]}`
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#242424] w-full max-w-md rounded-[32px] border border-white/10 p-8 relative shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-600 rounded-t-[32px]" />

            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
              <span className="bg-white/5 p-2 rounded-xl">✅</span>
              Nueva Tarea
            </h2>
            {fechaLabel && (
              <p className="text-xs text-orange-400 font-bold ml-1 mb-6">
                📅 {fechaLabel}
              </p>
            )}
            {!fechaLabel && <div className="mb-6" />}

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">
                  Nombre
                </label>
                <input
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500/40 transition-all placeholder:text-gray-700"
                  placeholder="Ej: Entregar reporte..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">
                  Descripción (opcional)
                </label>
                <input
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500/40 transition-all placeholder:text-gray-700"
                  placeholder="Detalles..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              {/* Materia y prioridad en fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">
                    Materia
                  </label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none cursor-pointer"
                    value={materiaId}
                    onChange={(e) => setMateriaId(Number(e.target.value))}
                  >
                    {materias.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#242424]">
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">
                    Prioridad
                  </label>
                  <div className="flex gap-1 mt-2">
                    {[
                      { val: "baja", icon: "🟢" },
                      { val: "media", icon: "🟡" },
                      { val: "alta", icon: "🔴" },
                    ].map(({ val, icon }) => (
                      <button
                        key={val}
                        onClick={() => setPrioridad(val)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          prioridad === val
                            ? "bg-white/10 border-white/20 text-white"
                            : "border-white/5 text-gray-600 hover:border-white/10"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">
                  Fecha límite
                </label>
                <input
                  type="date"
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 transition-all font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!nombre.trim() || !materiaId}
                className="flex-1 py-3 rounded-2xl bg-orange-500 text-white hover:bg-orange-400 transition-all font-bold shadow-xl shadow-orange-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Crear Tarea
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalNuevaTarea;