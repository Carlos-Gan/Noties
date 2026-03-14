import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiPercent,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import ModalNuevaEvaluacion from "../../Modals/ModalNuevaEvaluacion";

const TIPOS_EVALUACION = {
  examen: {
    label: "Examen",
    color: "text-red-400",
    bg: "bg-red-500/10",
    icon: "📝",
  },
  tarea: {
    label: "Tarea",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: "📋",
  },
  proyecto: {
    label: "Proyecto",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    icon: "🚀",
  },
  participacion: {
    label: "Participación",
    color: "text-green-400",
    bg: "bg-green-500/10",
    icon: "🗣️",
  },
  practica: {
    label: "Práctica",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    icon: "🔬",
  },
  otro: {
    label: "Otro",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    icon: "📌",
  },
};

const SeccionEvaluaciones = ({ materia, onUpdate }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [evaluacionAEditar, setEvaluacionAEditar] = useState(null);
  const [menuContextual, setMenuContextual] = useState(null);

  const cargarEvaluaciones = async () => {
    if (!materia?.id) return;
    try {
      setLoading(true);
      const data = await window.electronAPI.evaluaciones.getByMateria(
        materia.id,
      );
      setEvaluaciones(data);
    } catch (error) {
      console.error("Error cargando evaluaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEvaluaciones();
  }, [materia.id]);

  // Escuchar actualizaciones
  useEffect(() => {
    const handleEvaluacionesUpdated = (e) => {
      if (e.detail?.materiaId === materia.id) {
        cargarEvaluaciones();
        if (onUpdate) onUpdate();
      }
    };

    window.addEventListener("evaluaciones-updated", handleEvaluacionesUpdated);
    return () =>
      window.removeEventListener(
        "evaluaciones-updated",
        handleEvaluacionesUpdated,
      );
  }, [materia.id, onUpdate]);

  const handleGuardar = async (datos) => {
    if (evaluacionAEditar) {
      await window.electronAPI.evaluaciones.actualizar({
        id: evaluacionAEditar.id,
        ...datos,
      });
    } else {
      await window.electronAPI.evaluaciones.crear(datos);
    }
    setModalOpen(false);
    setEvaluacionAEditar(null);
    await cargarEvaluaciones();
    if (onUpdate) onUpdate();
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar esta evaluación?")) {
      await window.electronAPI.evaluaciones.eliminar(id);
      await cargarEvaluaciones();
      if (onUpdate) onUpdate();
    }
  };

  const handleContextMenu = (e, evaluacion) => {
    e.preventDefault();
    setMenuContextual({
      x: e.pageX,
      y: e.pageY,
      evaluacion,
    });
  };

  useEffect(() => {
    const cerrarMenu = () => setMenuContextual(null);
    window.addEventListener("click", cerrarMenu);
    return () => window.removeEventListener("click", cerrarMenu);
  }, []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = evaluaciones.length;
    const evaluadas = evaluaciones.filter(
      (e) => e.calificacion !== null && e.calificacion !== undefined,
    );
    const pendientes = evaluaciones.filter(
      (e) => e.calificacion === null || e.calificacion === undefined,
    );

    let sumaPonderada = 0;
    let totalPorcentaje = 0;

    evaluadas.forEach((e) => {
      sumaPonderada += (e.calificacion / 10) * e.porcentaje;
      totalPorcentaje += e.porcentaje;
    });

    const promedioActual =
      totalPorcentaje > 0 ? (sumaPonderada / totalPorcentaje) * 10 : 0;

    // Calcular lo que falta
    const porcentajeRestante = 100 - totalPorcentaje;
    const promedioPosible =
      porcentajeRestante > 0
        ? (sumaPonderada + porcentajeRestante * 10) / 100
        : promedioActual;

    return {
      total,
      evaluadas: evaluadas.length,
      pendientes: pendientes.length,
      promedioActual: promedioActual.toFixed(1),
      promedioPosible: promedioPosible.toFixed(1),
      porcentajeCompletado: totalPorcentaje,
    };
  }, [evaluaciones]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-[10px] text-blue-400 font-black uppercase mb-1">
            Total
          </p>
          <p className="text-2xl font-black text-white">{stats.total}</p>
          <p className="text-[9px] text-gray-600 mt-1">evaluaciones</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-[10px] text-green-400 font-black uppercase mb-1">
            Evaluadas
          </p>
          <p className="text-2xl font-black text-white">{stats.evaluadas}</p>
          <p className="text-[9px] text-gray-600 mt-1">con calificación</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-[10px] text-yellow-400 font-black uppercase mb-1">
            Pendientes
          </p>
          <p className="text-2xl font-black text-white">{stats.pendientes}</p>
          <p className="text-[9px] text-gray-600 mt-1">por calificar</p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-[10px] text-purple-400 font-black uppercase mb-1">
            Promedio
          </p>
          <p className="text-2xl font-black text-white">
            {stats.promedioActual}
          </p>
          <p className="text-[9px] text-gray-600 mt-1">
            actual · potencial {stats.promedioPosible}
          </p>
        </div>
      </div>

      {/* Barra de progreso de porcentajes */}
      <div className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-gray-500 font-black uppercase">
            Progreso de evaluaciones
          </span>
          <span className="text-xs text-white font-bold">
            {stats.porcentajeCompletado}% / 100%
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.porcentajeCompletado}%` }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Botón nueva evaluación */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEvaluacionAEditar(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all"
        >
          <FiPlus size={14} />
          Nueva Evaluación
        </button>
      </div>

      {/* Lista de evaluaciones */}
      <div className="space-y-3">
        {evaluaciones.length === 0 ? (
          <div className="text-center py-12 text-gray-600 bg-[#1e1e1e] rounded-2xl border border-white/5">
            <p className="text-3xl mb-3 opacity-30">📊</p>
            <p className="text-sm font-medium">No hay evaluaciones</p>
            <p className="text-xs mt-2">Agrega tu primera evaluación</p>
          </div>
        ) : (
          evaluaciones
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .map((evalucion) => {
              const tipo =
                TIPOS_EVALUACION[evalucion.tipo] || TIPOS_EVALUACION.otro;
              const tieneCalif =
                evalucion.calificacion !== null &&
                evalucion.calificacion !== undefined;

              return (
                <motion.div
                  key={evalucion.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onContextMenu={(e) => handleContextMenu(e, evalucion)}
                  className="bg-[#1e1e1e] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icono de tipo */}
                    <div
                      className={`w-10 h-10 ${tipo.bg} rounded-xl flex items-center justify-center text-xl`}
                    >
                      {tipo.icon}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white">
                            {evalucion.nombre}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-bold ${tipo.color} bg-white/5 px-2 py-0.5 rounded-full`}
                            >
                              {tipo.label}
                            </span>
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                              <FiPercent size={10} />
                              {evalucion.porcentaje}%
                            </span>
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                              <FiCalendar size={10} />
                              {new Date(evalucion.fecha).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Calificación */}
                        <div className="text-right">
                          {tieneCalif ? (
                            <>
                              <p className="text-2xl font-black text-white">
                                {evalucion.calificacion}
                              </p>
                              <p className="text-[9px] text-gray-600">
                                calificación
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-600 italic">
                              Pendiente
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Barra de contribución al promedio */}
                      {tieneCalif && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[8px] text-gray-700 mb-1">
                            <span>
                              Contribuye{" "}
                              {(
                                (evalucion.calificacion / 10) *
                                evalucion.porcentaje
                              ).toFixed(1)}{" "}
                              puntos
                            </span>
                            <span>
                              {evalucion.porcentaje}% de la calificación
                            </span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(evalucion.calificacion / 10) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
        )}
      </div>

      {/* Menú contextual */}
      <AnimatePresence>
        {menuContextual && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuContextual(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl py-1 w-48"
              style={{ top: menuContextual.y, left: menuContextual.x }}
            >
              <button
                onClick={() => {
                  setEvaluacionAEditar(menuContextual.evaluacion);
                  setModalOpen(true);
                  setMenuContextual(null);
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
              >
                <FiEdit2 size={12} />
                Editar evaluación
              </button>
              <button
                onClick={() => {
                  handleEliminar(menuContextual.evaluacion.id);
                  setMenuContextual(null);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <FiTrash2 size={12} />
                Eliminar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <ModalNuevaEvaluacion
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEvaluacionAEditar(null);
        }}
        onSave={handleGuardar}
        materias={[materia]}
        evaluacionInicial={evaluacionAEditar}
        materiaIdInicial={materia.id}
      />
    </div>
  );
};

export default SeccionEvaluaciones;
