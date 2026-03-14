// /components/features/proyectos/components/ProyectoDetalleModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiInfo, FiCalendar, FiEdit2 } from "react-icons/fi";
import { ESTADOS } from "./constants";

const ProyectoDetalleModal = ({
  isOpen,
  proyecto,
  materias,
  onClose,
  onEditar,
}) => {
  if (!proyecto) return null;

  const materia = materias.find((m) => m.id === proyecto.materia_id);
  const IconComponent = ESTADOS[proyecto.estado]?.icon; // 👈 Obtenemos el icono

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="bg-[#111111] w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-[40px] border-none md:border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Banner Decorativo */}
            <div
              className="h-32 w-full opacity-20 absolute top-0 left-0 blur-3xl"
              style={{ backgroundColor: materia?.color || "#6366f1" }}
            />

            <div className="relative p-8 md:p-12 overflow-y-auto custom-scrollbar">
              {/* Encabezado */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm ${
                        ESTADOS[proyecto.estado].bg
                      } ${ESTADOS[proyecto.estado].color}`}
                    >
                      {ESTADOS[proyecto.estado].label}
                    </span>
                    <span className="bg-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
                      Prioridad {proyecto.prioridad}
                    </span>
                  </div>

                  <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                    {proyecto.nombre}
                  </h2>

                  <div className="flex items-center gap-3 text-indigo-400 font-bold text-lg">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                    {materia?.nombre}
                    {proyecto.unidad && (
                      <span className="text-gray-600 ml-2 border-l border-white/10 pl-3">
                        Unidad {proyecto.unidad}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-full text-white transition-all active:scale-95"
                >
                  <FiPlus className="rotate-45" size={24} />
                </button>
              </div>

              {/* Grid de Información */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna Izquierda */}
                <div className="md:col-span-2 space-y-8">
                  <section>
                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <FiInfo className="text-indigo-500" /> Resumen del
                      Proyecto
                    </h3>
                    <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                      <p className="text-gray-300 text-lg leading-relaxed font-medium">
                        {proyecto.descripcion ||
                          "No se ha proporcionado una descripción detallada para este proyecto."}
                      </p>
                    </div>
                  </section>

                  {/* Stats rápidas */}
                  <section className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">
                        Creado el
                      </p>
                      <p className="text-white font-bold">
                        {new Date(
                          proyecto.created_at || Date.now(),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                      <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">
                        Última Modificación
                      </p>
                      <p className="text-white font-bold">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </section>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                    <div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        Fecha de Entrega
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                          <FiCalendar size={24} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white leading-none">
                            {proyecto.fecha_limite
                              ? new Date(
                                  proyecto.fecha_limite,
                                ).toLocaleDateString("es-MX", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "Pendiente"}
                          </p>
                          <p className="text-xs text-gray-500 font-bold mt-1 uppercase italic">
                            {proyecto.fecha_limite
                              ? "Fecha fatal"
                              : "Sin programar"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    <div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        Estado de Avance
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-4 rounded-2xl shadow-lg ${
                            ESTADOS[proyecto.estado].bg
                          } ${ESTADOS[proyecto.estado].color}`}
                        >
                          {IconComponent && <IconComponent size={24} />}{" "}
                          {/* 👈 Renderizamos el icono */}
                        </div>
                        <p className="text-xl font-black text-white uppercase">
                          {ESTADOS[proyecto.estado].label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      onClose();
                      onEditar(e, proyecto);
                    }}
                    className="w-full py-6 bg-white text-black hover:bg-indigo-400 hover:text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <FiEdit2 size={18} /> Editar Información
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProyectoDetalleModal;