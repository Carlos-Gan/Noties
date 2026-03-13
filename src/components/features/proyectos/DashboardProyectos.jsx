import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiArrowRight,
  FiPlus,
  FiTrash2,
  FiLayers,
  FiCheckCircle,
  FiTarget,
  FiInfo,
  FiEdit2,
} from "react-icons/fi";

import ModalNuevoProyecto from "../../Modals/ModalNuevoProyecto";

const ESTADOS = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: <FiClock size={14} />,
  },
  en_progreso: {
    label: "En progreso",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: <FiLayers size={14} />,
  },
  entregado: {
    label: "Entregado",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: <FiCheckCircle size={14} />,
  },
};

const ProyectoDashboard = ({ materias = [] }) => {
  const [proyectos, setProyectos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [proyectoAEditar, setProyectoAEditar] = useState(null);

  // NUEVOS: Para ver detalles
  const [detallesOpen, setDetallesOpen] = useState(false);
  const [proyectoEnDetalle, setProyectoEnDetalle] = useState(null);

  const cargarDatos = async () => {
    const data = await window.electronAPI.invoke("proyectos:getAll");
    setProyectos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE DETALLES VS EDICIÓN ---
  const verDetalles = (p) => {
    setProyectoEnDetalle(p);
    setDetallesOpen(true);
  };

  const editarProyecto = (e, p) => {
    e.preventDefault(); // Bloquea el menú normal del navegador
    setProyectoAEditar(p);
    setModalOpen(true);
  };

  const handleDragEnd = async (proyectoId, nuevoEstado) => {
    const proyectoActual = proyectos.find((p) => p.id === proyectoId);
    if (!proyectoActual || proyectoActual.estado === nuevoEstado) return;

    const datosActualizados = { ...proyectoActual, estado: nuevoEstado };
    setProyectos((prev) =>
      prev.map((p) => (p.id === proyectoId ? datosActualizados : p)),
    );
    await window.electronAPI.invoke("proyectos:actualizar", datosActualizados);
    cargarDatos();
  };

  const handleSaveProyecto = async (datos) => {
    if (proyectoAEditar?.id) {
      await window.electronAPI.invoke("proyectos:actualizar", {
        id: proyectoAEditar.id,
        ...datos,
      });
    } else {
      await window.electronAPI.invoke("proyectos:crear", datos);
    }
    setModalOpen(false);
    cargarDatos();
  };

  const { porcentaje, urgente } = useMemo(() => {
    const entregados = proyectos.filter((p) => p.estado === "entregado").length;
    const activos = proyectos
      .filter((p) => p.estado !== "entregado" && p.fecha_limite)
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
    return {
      porcentaje:
        proyectos.length > 0
          ? Math.round((entregados / proyectos.length) * 100)
          : 0,
      urgente: activos[0] || null,
    };
  }, [proyectos]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-6 pb-20 select-none">
      {/* HEADER HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <FiTarget /> Objetivo Prioritario
            </div>
            {urgente ? (
              <>
                <h2 className="text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
                  {urgente.nombre}
                </h2>
                <button
                  onClick={() => verDetalles(urgente)}
                  className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-xs hover:scale-105 transition-all flex items-center gap-2 uppercase"
                >
                  Ver Detalles <FiArrowRight />
                </button>
              </>
            ) : (
              <h2 className="text-4xl font-black text-white uppercase">
                Todo al día
              </h2>
            )}
          </div>
        </motion.div>

        <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
          <div className="text-5xl font-black text-white tracking-tighter">
            {porcentaje}%
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px]"
          >
            + Nuevo Proyecto
          </button>
        </div>
      </section>

      {/* KANBAN POR MATERIAS */}
      <div className="space-y-24">
        {materias.map((materia) => (
          <section key={materia.id}>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-10 flex items-center gap-4">
              <div
                className="h-8 w-1.5 rounded-full"
                style={{ backgroundColor: materia.color }}
              />
              {materia.nombre}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(ESTADOS).map(([estadoKey, info]) => (
                <div
                  key={estadoKey}
                  className="flex flex-col gap-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const id = window.draggedProjectId;
                    if (id) handleDragEnd(id, estadoKey);
                  }}
                >
                  <div className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 ml-2">
                    {info.icon} {info.label}
                  </div>

                  <div className="space-y-4 min-h-[200px] p-2 bg-white/[0.01] rounded-[2rem] border border-transparent hover:border-white/5 transition-all">
                    <AnimatePresence mode="popLayout">
                      {proyectos
                        .filter(
                          (p) =>
                            p.materia_id === materia.id &&
                            p.estado === estadoKey,
                        )
                        .map((p) => (
                          <motion.div
                            key={p.id}
                            layoutId={p.id}
                            draggable
                            onDragStart={() => {
                              window.draggedProjectId = p.id;
                            }}
                            onContextMenu={(e) => editarProyecto(e, p)} // CLIC DERECHO
                            onClick={() => verDetalles(p)} // CLIC IZQUIERDO
                            className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 hover:bg-[#1e1e1e] transition-all group cursor-pointer relative"
                          >
                            <div className="absolute top-4 right-4 text-[9px] font-black text-gray-700 group-hover:text-indigo-500 transition-colors uppercase">
                              Editar
                            </div>
                            <h4 className="text-sm font-bold text-gray-200">
                              {p.nombre}
                            </h4>
                            <div className="mt-4 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase">
                              <span>
                                <FiCalendar className="inline mr-1" />{" "}
                                {p.fecha_limite || "S/F"}
                              </span>
                              {p.unidad && <span>U{p.unidad}</span>}
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* --- MODAL DE DETALLES (LECTURA) --- */}
      {/* --- MODAL DE DETALLES AMPLIADO (FICHA TÉCNICA) --- */}
      <AnimatePresence>
        {detallesOpen && proyectoEnDetalle && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetallesOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#111111] w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-[40px] border-none md:border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Banner Decorativo Superior según la Materia */}
              <div
                className="h-32 w-full opacity-20 absolute top-0 left-0 blur-3xl"
                style={{
                  backgroundColor:
                    materias.find((m) => m.id === proyectoEnDetalle.materia_id)
                      ?.color || "#6366f1",
                }}
              />

              <div className="relative p-8 md:p-12 overflow-y-auto custom-scrollbar">
                {/* Encabezado Principal */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm ${ESTADOS[proyectoEnDetalle.estado].bg} ${ESTADOS[proyectoEnDetalle.estado].color}`}
                      >
                        {ESTADOS[proyectoEnDetalle.estado].label}
                      </span>
                      <span className="bg-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
                        Prioridad {proyectoEnDetalle.prioridad}
                      </span>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                      {proyectoEnDetalle.nombre}
                    </h2>

                    <div className="flex items-center gap-3 text-indigo-400 font-bold text-lg">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                      {
                        materias.find(
                          (m) => m.id === proyectoEnDetalle.materia_id,
                        )?.nombre
                      }
                      {proyectoEnDetalle.unidad && (
                        <span className="text-gray-600 ml-2 border-l border-white/10 pl-3">
                          Unidad {proyectoEnDetalle.unidad}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setDetallesOpen(false)}
                    className="bg-white/5 hover:bg-white/10 p-4 rounded-full text-white transition-all active:scale-95"
                  >
                    <FiPlus className="rotate-45" size={24} />
                  </button>
                </div>

                {/* Grid de Información Detallada */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Columna Izquierda: Descripción Larga */}
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <FiInfo className="text-indigo-500" /> Resumen del
                        Proyecto
                      </h3>
                      <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                        <p className="text-gray-300 text-lg leading-relaxed font-medium">
                          {proyectoEnDetalle.descripcion ||
                            "No se ha proporcionado una descripción detallada para este proyecto. Puedes agregar notas importantes haciendo clic derecho para editar."}
                        </p>
                      </div>
                    </section>

                    {/* Espacio para Notas o Subtareas (Placeholder visual) */}
                    <section className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">
                          Creado el
                        </p>
                        <p className="text-white font-bold">
                          {new Date(
                            proyectoEnDetalle.created_at || Date.now(),
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

                  {/* Columna Derecha: Sidebar de Datos Rápidos */}
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
                              {proyectoEnDetalle.fecha_limite
                                ? new Date(
                                    proyectoEnDetalle.fecha_limite,
                                  ).toLocaleDateString("es-MX", {
                                    day: "2-digit",
                                    month: "short",
                                  })
                                : "Pendiente"}
                            </p>
                            <p className="text-xs text-gray-500 font-bold mt-1 uppercase italic">
                              {proyectoEnDetalle.fecha_limite
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
                            className={`p-4 rounded-2xl shadow-lg ${ESTADOS[proyectoEnDetalle.estado].bg} ${ESTADOS[proyectoEnDetalle.estado].color}`}
                          >
                            {ESTADOS[proyectoEnDetalle.estado].icon}
                          </div>
                          <p className="text-xl font-black text-white uppercase">
                            {ESTADOS[proyectoEnDetalle.estado].label}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Acción Principal en el Modal */}
                    <button
                      onClick={(e) => {
                        setDetallesOpen(false);
                        editarProyecto(e, proyectoEnDetalle);
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

      <ModalNuevoProyecto
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProyecto}
        materias={materias}
        proyecto={proyectoAEditar}
      />
    </div>
  );
};

export default ProyectoDashboard;
