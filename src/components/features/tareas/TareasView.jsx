import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Componentes
import CalendarioView from "./components/CalendarioView";
import TareaCard from "./components/TareaCard";
import FiltrosTareas from "./components/FiltrosTareas";
import ResumenStats from "./components/ResumenStats";
import TareasEmptyState from "./components/TareaEmptyState";
import ModalNuevaTarea from "../../Modals/ModalNuevaTarea";

// Helpers y constantes
import { mismodia } from "./components/tareaHelpers";

// ─── Componente principal ─────────────────────────────────────────
const TareasView = ({ materias = [] }) => {
  const [tareas, setTareas] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalTareaOpen, setModalTareaOpen] = useState(false);
  const [fechaModal, setFechaModal] = useState(null);
  const [tareaAEditar, setTareaAEditar] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState(() => {
    const saved = localStorage.getItem("tareas-filtros");
    return saved
      ? JSON.parse(saved)
      : {
          prioridad: "todas",
          materia: "todas",
          orden: "fecha",
          busqueda: "",
        };
  });

  // Guardar filtros en localStorage
  useEffect(() => {
    localStorage.setItem("tareas-filtros", JSON.stringify(filtros));
  }, [filtros]);

  const colorMateria = useMemo(() => {
    const map = {};
    materias.forEach((m) => {
      map[m.id] = m.color || "#3b82f6";
    });
    return map;
  }, [materias]);

  const cargarTareas = useCallback(async () => {
    try {
      setCargando(true);
      const todas = [];
      for (const m of materias) {
        const t = await window.electronAPI.invoke("tareas:getByMateria", m.id);
        t.forEach((tarea) => {
          todas.push({
            ...tarea,
            materia_nombre: m.nombre,
            materia_color: m.color,
          });
        });
      }
      setTareas(todas);
    } catch (err) {
      console.error("Error cargando tareas:", err);
    } finally {
      setCargando(false);
    }
  }, [materias]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  // Escuchar actualizaciones
  useEffect(() => {
    const handleTareasUpdated = () => {
      cargarTareas();
    };
    window.addEventListener("tareas-updated", handleTareasUpdated);
    return () =>
      window.removeEventListener("tareas-updated", handleTareasUpdated);
  }, [cargarTareas]);

  const toggleTarea = useCallback(async (id) => {
    await window.electronAPI.invoke("tareas:toggleCompletada", id);
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completada: t.completada ? 0 : 1 } : t,
      ),
    );
    window.dispatchEvent(new CustomEvent("tareas-updated"));
  }, []);

  const handleEditarTarea = useCallback((tarea) => {
    setTareaAEditar(tarea);
    setFechaModal(tarea.fecha_limite ? new Date(tarea.fecha_limite) : null);
    setModalTareaOpen(true);
  }, []);

  const handleCrearTarea = useCallback(
    async (datos) => {
      if (tareaAEditar?.id) {
        await window.electronAPI.invoke("tareas:actualizar", {
          id: tareaAEditar.id,
          ...datos,
        });
      } else {
        await window.electronAPI.invoke("tareas:crear", {
          ...datos,
          proyecto_id: null,
        });
      }
      setModalTareaOpen(false);
      setTareaAEditar(null);
      setFechaModal(null);
      cargarTareas();
    },
    [tareaAEditar, cargarTareas],
  );

  const handleEliminarTarea = useCallback(
    async (id) => {
      if (window.confirm("¿Eliminar esta tarea?")) {
        await window.electronAPI.invoke("tareas:eliminar", id);
        cargarTareas();
      }
    },
    [cargarTareas],
  );

  const handleDiaClick = useCallback(
    (fecha) => {
      // Solo alternar selección, sin abrir modal
      setDiaSeleccionado(
        fecha && diaSeleccionado && mismodia(fecha, diaSeleccionado)
          ? null
          : fecha,
      );
    },
    [diaSeleccionado],
  );

  // Tareas pendientes (no completadas)
  const tareasPendientes = useMemo(
    () => tareas.filter((t) => !t.completada),
    [tareas],
  );

  // Tareas filtradas según criterios
  const tareasFiltradas = useMemo(() => {
    let filtradas = tareasPendientes;

    // Filtrar por prioridad
    if (filtros.prioridad !== "todas") {
      filtradas = filtradas.filter((t) => t.prioridad === filtros.prioridad);
    }

    // Filtrar por materia
    if (filtros.materia !== "todas") {
      filtradas = filtradas.filter(
        (t) => t.materia_id === parseInt(filtros.materia),
      );
    }

    // Filtrar por búsqueda
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      filtradas = filtradas.filter(
        (t) =>
          t.nombre.toLowerCase().includes(busquedaLower) ||
          t.descripcion?.toLowerCase().includes(busquedaLower),
      );
    }

    // Ordenar
    return filtradas.sort((a, b) => {
      if (filtros.orden === "fecha") {
        if (!a.fecha_limite) return 1;
        if (!b.fecha_limite) return -1;
        return new Date(a.fecha_limite) - new Date(b.fecha_limite);
      }
      if (filtros.orden === "prioridad") {
        const prioridadValor = { alta: 3, media: 2, baja: 1 };
        return prioridadValor[b.prioridad] - prioridadValor[a.prioridad];
      }
      if (filtros.orden === "materia") {
        return (a.materia_nombre || "").localeCompare(b.materia_nombre || "");
      }
      return 0;
    });
  }, [tareasPendientes, filtros]);

  const tareasDiaSel = useMemo(() => {
    if (!diaSeleccionado) return [];
    return tareasFiltradas.filter((t) => {
      if (!t.fecha_limite) return false;
      return mismodia(new Date(t.fecha_limite), diaSeleccionado);
    });
  }, [diaSeleccionado, tareasFiltradas]);

  const resumenPorMateria = useMemo(
    () =>
      materias
        .map((m) => {
          const pendientes = tareas.filter(
            (t) => t.materia_id === m.id && !t.completada,
          ).length;
          const total = tareas.filter((t) => t.materia_id === m.id).length;
          return { ...m, pendientes, total };
        })
        .filter((m) => m.total > 0),
    [tareas, materias],
  );

  const statsRapidas = useMemo(
    () => ({
      vencidas: tareasPendientes.filter(
        (t) => t.fecha_limite && new Date(t.fecha_limite) < new Date(),
      ).length,
      hoy: tareasPendientes.filter(
        (t) => t.fecha_limite && mismodia(new Date(t.fecha_limite), new Date()),
      ).length,
      semana: tareasPendientes.filter((t) => {
        if (!t.fecha_limite) return false;
        const fecha = new Date(t.fecha_limite);
        const semana = new Date();
        semana.setDate(semana.getDate() + 7);
        return fecha <= semana;
      }).length,
    }),
    [tareasPendientes],
  );

  if (cargando) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white overflow-hidden">
      {/* ─── Columna principal ─────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 gap-6">
        {/* Header con título y botón */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Tareas</h1>
            <p className="text-xs text-gray-500 mt-1">
              {tareasPendientes.length} pendiente
              {tareasPendientes.length !== 1 ? "s" : ""}
              {filtros.busqueda && ` · "${filtros.busqueda}"`}
            </p>
          </div>
          <button
            onClick={() => {
              setTareaAEditar(null);
              setFechaModal(null);
              setModalTareaOpen(true);
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-900/30"
          >
            + Nueva tarea
          </button>
        </div>

        {/* Calendario */}
        <CalendarioView
          tareas={tareasPendientes}
          materias={materias}
          diaSeleccionado={diaSeleccionado}
          onDiaClick={handleDiaClick} // ← Clic izquierdo: filtrar
          onDiaClickDerecho={(fecha) => {
            // ← Clic derecho: crear tarea
            setTareaAEditar(null);
            setFechaModal(fecha);
            setModalTareaOpen(true);
          }}
        />

        {/* Filtros */}
        <FiltrosTareas
          filtros={filtros}
          onChange={setFiltros}
          materias={materias}
        />

        {/* Lista de tareas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">
              {diaSeleccionado
                ? `Tareas del ${diaSeleccionado.toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                  })}`
                : filtros.prioridad !== "todas" ||
                    filtros.materia !== "todas" ||
                    filtros.busqueda
                  ? "Tareas filtradas"
                  : "Próximas tareas"}
            </h2>
            {(diaSeleccionado ||
              filtros.prioridad !== "todas" ||
              filtros.materia !== "todas" ||
              filtros.busqueda) && (
              <button
                onClick={() => {
                  setDiaSeleccionado(null);
                  setFiltros({
                    prioridad: "todas",
                    materia: "todas",
                    orden: "fecha",
                    busqueda: "",
                  });
                }}
                className="text-[10px] text-gray-600 hover:text-white transition-colors"
              >
                Limpiar filtros ✕
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {(diaSeleccionado ? tareasDiaSel : tareasFiltradas).length === 0 ? (
              <TareasEmptyState
                mensaje={
                  diaSeleccionado
                    ? "Sin tareas para este día"
                    : filtros.prioridad !== "todas" ||
                        filtros.materia !== "todas" ||
                        filtros.busqueda
                      ? "No hay tareas con esos filtros"
                      : "Sin tareas pendientes"
                }
                onCrearTarea={() => {
                  setTareaAEditar(null);
                  setFechaModal(diaSeleccionado);
                  setModalTareaOpen(true);
                }}
              />
            ) : (
              <motion.div className="space-y-2">
                {(diaSeleccionado ? tareasDiaSel : tareasFiltradas).map(
                  (tarea) => (
                    // En SeccionTareas.jsx
                    <TareaCard
                      key={tarea.id}
                      tarea={tarea}
                      onToggle={handleToggleTarea}
                      onUpdate={() => {
                        // Opcional: hacer algo específico además del evento
                        console.log("Tarea actualizada");
                      }}
                      colorMateria={colorMateria[tarea.materia_id]}
                    />
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Panel lateral ─────────────────────────── */}
      <aside className="w-80 border-l border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
        {/* Stats rápidas */}
        <ResumenStats stats={statsRapidas} />

        {/* Separador */}
        <div className="h-px bg-white/5" />

        {/* Por materia */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
            Progreso por materia
          </h2>

          {resumenPorMateria.length === 0 ? (
            <p className="text-xs text-gray-600 italic">
              Sin tareas registradas
            </p>
          ) : (
            <div className="space-y-3">
              {resumenPorMateria.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#1e1e1e] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <p className="text-xs font-bold text-white truncate flex-1">
                      {m.nombre}
                    </p>
                    <span className="text-[9px] text-gray-600">
                      {m.pendientes} pend.
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((m.total - m.pendientes) / m.total) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">
                      {m.total - m.pendientes} completadas
                    </span>
                    <span className="text-gray-600 font-bold">
                      {Math.round(((m.total - m.pendientes) / m.total) * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ─── Modal nueva/editar tarea ───────────────── */}
      <ModalNuevaTarea
        isOpen={modalTareaOpen}
        onClose={() => {
          setModalTareaOpen(false);
          setTareaAEditar(null);
          setFechaModal(null);
        }}
        onSave={handleCrearTarea}
        materias={materias}
        fechaInicial={fechaModal}
        tareaInicial={tareaAEditar}
      />
    </div>
  );
};

export default TareasView;
