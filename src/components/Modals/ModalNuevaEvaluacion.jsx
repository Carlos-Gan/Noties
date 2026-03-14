import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiCalendar, FiPercent, FiType } from "react-icons/fi";

const TIPOS_EVALUACION = [
  { value: "examen", label: "📝 Examen", color: "text-red-400" },
  { value: "tarea", label: "📋 Tarea", color: "text-blue-400" },
  { value: "proyecto", label: "🚀 Proyecto", color: "text-purple-400" },
  {
    value: "participacion",
    label: "🗣️ Participación",
    color: "text-green-400",
  },
  { value: "practica", label: "🔬 Práctica", color: "text-yellow-400" },
  { value: "otro", label: "📌 Otro", color: "text-gray-400" },
];

const ModalNuevaEvaluacion = ({
  isOpen,
  onClose,
  onSave,
  materias = [],
  evaluacionInicial = null,
  materiaIdInicial = null,
}) => {
  const [formData, setFormData] = useState({
    materia_id: materiaIdInicial || "",
    nombre: "",
    tipo: "examen",
    porcentaje: "",
    calificacion: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (evaluacionInicial) {
      setFormData({
        materia_id: evaluacionInicial.materia_id,
        nombre: evaluacionInicial.nombre,
        tipo: evaluacionInicial.tipo,
        porcentaje: evaluacionInicial.porcentaje,
        calificacion: evaluacionInicial.calificacion || "",
        fecha:
          evaluacionInicial.fecha || new Date().toISOString().split("T")[0],
      });
    } else if (materiaIdInicial) {
      setFormData((prev) => ({ ...prev, materia_id: materiaIdInicial }));
    }
  }, [evaluacionInicial, materiaIdInicial]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.materia_id) {
      nuevosErrores.materia_id = "Selecciona una materia";
    }
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido";
    }
    if (!formData.porcentaje) {
      nuevosErrores.porcentaje = "El porcentaje es requerido";
    } else {
      const pct = parseFloat(formData.porcentaje);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        nuevosErrores.porcentaje = "El porcentaje debe ser 0-100";
      }
    }
    if (formData.calificacion) {
      const cal = parseFloat(formData.calificacion);
      if (isNaN(cal) || cal < 0 || cal > 10) {
        nuevosErrores.calificacion = "La calificación debe ser 0-10";
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await onSave({
        ...formData,
        porcentaje: parseFloat(formData.porcentaje),
        calificacion: formData.calificacion
          ? parseFloat(formData.calificacion)
          : null,
      });
      onClose();
    } catch (error) {
      console.error("Error guardando evaluación:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1a1a1a] w-full max-w-md rounded-3xl border border-white/10 relative z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-black text-white">
                {evaluacionInicial ? "Editar" : "Nueva"} Evaluación
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <FiX size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Selector de materia */}
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
                  Materia
                </label>
                <select
                  value={formData.materia_id}
                  onChange={(e) =>
                    setFormData({ ...formData, materia_id: e.target.value })
                  }
                  className={`w-full bg-[#2a2a2a] border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all ${
                    errors.materia_id
                      ? "border-red-500/50"
                      : "border-white/5 focus:border-blue-500/50"
                  }`}
                  disabled={!!materiaIdInicial} // Si viene de una materia específica, no se puede cambiar
                >
                  <option value="">Seleccionar materia</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {errors.materia_id && (
                  <p className="text-red-400 text-[10px] mt-1">
                    {errors.materia_id}
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
                  Nombre de la evaluación
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Examen Parcial 1"
                  className={`w-full bg-[#2a2a2a] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 outline-none transition-all ${
                    errors.nombre
                      ? "border-red-500/50"
                      : "border-white/5 focus:border-blue-500/50"
                  }`}
                />
                {errors.nombre && (
                  <p className="text-red-400 text-[10px] mt-1">
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Tipo y Porcentaje en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    className="w-full bg-[#2a2a2a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                  >
                    {TIPOS_EVALUACION.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
                    Porcentaje
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.porcentaje}
                      onChange={(e) =>
                        setFormData({ ...formData, porcentaje: e.target.value })
                      }
                      placeholder="30"
                      className={`w-full bg-[#2a2a2a] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 outline-none transition-all ${
                        errors.porcentaje
                          ? "border-red-500/50"
                          : "border-white/5 focus:border-blue-500/50"
                      }`}
                    />
                    <FiPercent
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                      size={14}
                    />
                  </div>
                  {errors.porcentaje && (
                    <p className="text-red-400 text-[10px] mt-1">
                      {errors.porcentaje}
                    </p>
                  )}
                </div>
              </div>

              {/* Calificación y Fecha en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
                    Calificación (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.calificacion}
                    onChange={(e) =>
                      setFormData({ ...formData, calificacion: e.target.value })
                    }
                    placeholder="8.5"
                    className={`w-full bg-[#2a2a2a] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 outline-none transition-all ${
                      errors.calificacion
                        ? "border-red-500/50"
                        : "border-white/5 focus:border-blue-500/50"
                    }`}
                  />
                  {errors.calificacion && (
                    <p className="text-red-400 text-[10px] mt-1">
                      {errors.calificacion}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">
                    Fecha
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 [color-scheme:dark]"
                    />
                    <FiCalendar
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                      size={14}
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FiSave size={14} />
                      {evaluacionInicial ? "Actualizar" : "Guardar"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalNuevaEvaluacion;