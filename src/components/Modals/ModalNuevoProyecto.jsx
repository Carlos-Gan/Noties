import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ModalNuevoProyecto = ({
  isOpen,
  onClose,
  onSave,
  materias = [],
  proyecto = null, // Para edición
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidad, setUnidad] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [estado, setEstado] = useState("pendiente");
  const [prioridad, setPrioridad] = useState("media");
  const [fecha, setFecha] = useState("");

  // Sincronizar con el proyecto si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (proyecto) {
        setNombre(proyecto.nombre || "");
        setDescripcion(proyecto.descripcion || "");
        setUnidad(proyecto.unidad || "");
        setMateriaId(proyecto.materia_id || "");
        setEstado(proyecto.estado || "pendiente");
        setPrioridad(proyecto.prioridad || "media");
        setFecha(proyecto.fecha_limite || "");
      } else {
        setNombre("");
        setDescripcion("");
        setUnidad("");
        setMateriaId(materias[0]?.id || "");
        setEstado("pendiente");
        setPrioridad("media");
        setFecha("");
      }
    }
  }, [proyecto, isOpen, materias]);

  const handleSave = () => {
    if (!nombre.trim() || !materiaId) return;
    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      unidad: unidad.trim(),
      materia_id: Number(materiaId),
      estado,
      prioridad,
      fecha_limite: fecha || null,
    });
  };

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
            className="bg-[#242424] w-full max-w-lg rounded-[32px] border border-white/10 p-8 relative shadow-2xl overflow-hidden"
          >
            {/* Gradiente superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-[32px]" />

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="bg-white/5 p-2 rounded-xl">{proyecto ? "✏️" : "🔨"}</span>
              {proyecto ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Nombre y Unidad */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Nombre</label>
                  <input
                    autoFocus
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    placeholder="Ej: Base de Datos"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Unidad</label>
                  <input
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-center"
                    placeholder="U1"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                  />
                </div>
              </div>

              {/* Materia y Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Materia</label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none cursor-pointer"
                    value={materiaId}
                    onChange={(e) => setMateriaId(e.target.value)}
                  >
                    {materias.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#242424]">{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Estado</label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none cursor-pointer"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="pendiente" className="bg-[#242424]">Pendiente</option>
                    <option value="en_progreso" className="bg-[#242424]">En Progreso</option>
                    <option value="entregado" className="bg-[#242424]">Entregado</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Descripción</label>
                <textarea
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-3 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all min-h-[80px] resize-none"
                  placeholder="De qué trata el proyecto..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              {/* Prioridad y Fecha */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Prioridad</label>
                  <div className="flex gap-1 mt-2">
                    {["baja", "media", "alta"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrioridad(p)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                          prioridad === p ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-gray-600"
                        }`}
                      >
                        {p === "baja" ? "🟢" : p === "media" ? "🟡" : "🔴"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Fecha Límite</label>
                  <input
                    type="date"
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-2.5 mt-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 transition-all font-semibold text-sm">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!nombre.trim()}
                className="flex-1 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-900/30 disabled:opacity-40"
              >
                {proyecto ? "Guardar Cambios" : "Crear Proyecto"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalNuevoProyecto;