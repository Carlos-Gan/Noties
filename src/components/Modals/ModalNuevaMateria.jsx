import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MultiSelectDays = ({ value, onChange }) => {
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {dias.map((dia) => (
        <button
          key={dia}
          type="button"
          onClick={() => {
            const newValue = value.includes(dia)
              ? value.filter((d) => d !== dia)
              : [...value, dia];
            onChange(newValue);
          }}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
            value.includes(dia)
              ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40"
              : "bg-[#1e1e1e] border-white/5 text-gray-500 hover:border-white/20"
          }`}
        >
          {dia}
        </button>
      ))}
    </div>
  );
};

const ModalNuevaMateria = ({
  isOpen,
  onClose,
  onSave,
  tarea = null,
  plantilla = [],
}) => {
  const [nombre, setNombre] = useState("");
  const [fields, setFields] = useState([]);
  // Si tienes otros estados como prioridad o fecha, agrégalos aquí
  const [prioridad, setPrioridad] = useState("media");
  const [fechaLimite, setFechaLimite] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (tarea) {
        // MODO EDICIÓN: Rellenamos con lo que viene en la tarea
        setNombre(tarea.nombre || "");
        setDescripcion(tarea.descripcion || "");
        setPrioridad(tarea.prioridad || "media");
        setFechaLimite(tarea.fecha_limite || "");
        // Si usas el sistema de fields dinámicos, aquí los mapearías
        setFields(tarea.fields || plantilla);
      } else {
        // MODO NUEVO: Limpiamos todo
        setNombre("");
        setDescripcion("");
        setPrioridad("media");
        setFechaLimite("");
        setFields(plantilla);
      }
    }
  }, [tarea, isOpen, plantilla]);

  const updateField = (id, newValue) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, value: newValue } : f)));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="bg-[#242424] w-full max-w-lg rounded-[32px] border border-white/10 p-10 relative shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="bg-white/5 p-2 rounded-xl text-lg">📁</span>
              Configurar Materia
            </h2>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black ml-1">
                  Nombre Principal
                </label>
                <input
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 mt-2 text-white text-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
                  placeholder="Ej: Física Cuántica"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="bg-[#1e1e1e]/40 p-4 rounded-2xl border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs grayscale">{field.icon}</span>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        {field.label}
                      </label>
                    </div>

                    {field.type === "text" && (
                      <input
                        className="bg-transparent w-full text-sm text-gray-200 outline-none mt-1"
                        placeholder="Escribir..."
                        value={field.value}
                        onChange={(e) => updateField(field.id, e.target.value)}
                      />
                    )}

                    {field.type === "number" && (
                      <input
                        type="number"
                        className="bg-transparent w-full text-sm text-gray-200 outline-none mt-1"
                        value={field.value}
                        onChange={(e) => updateField(field.id, e.target.value)}
                      />
                    )}

                    {field.type === "multi-select" && (
                      <MultiSelectDays
                        value={field.value}
                        onChange={(val) => updateField(field.id, val)}
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        className="bg-transparent w-full text-sm text-gray-300 outline-none mt-1 cursor-pointer"
                        value={field.value}
                        onChange={(e) => updateField(field.id, e.target.value)}
                      >
                        <option value="" className="bg-[#242424]">
                          Seleccionar...
                        </option>
                        {field.options?.map((opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="bg-[#242424]"
                          >
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => onSave({ nombre, fields })}
                disabled={!nombre.trim()}
                className="flex-1 py-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-900/40 border-t border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Guardar Materia
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalNuevaMateria;
