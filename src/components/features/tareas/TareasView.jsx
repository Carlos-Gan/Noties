import { useEffect, useMemo, useState } from "react";
import CalendarioView from "./CalendarioView";
import TareaCard from "./TareaCard";
import ModalNuevaTarea from "../../Modals/ModalNuevaTarea";

const mismodia = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ─── Vista principal ───────────────────────────────────────────────
const TareasView = ({ materias = [] }) => {
  const [tareas, setTareas] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalTareaOpen, setModalTareaOpen] = useState(false);
  const [fechaModal, setFechaModal] = useState(null);

  const colorMateria = useMemo(() => {
    const map = {};
    materias.forEach((m) => {
      map[m.id] = m.color || "#3b82f6";
    });
    return map;
  }, [materias]);

  const cargarTareas = async () => {
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
  };

  useEffect(() => {
    cargarTareas();
  }, [materias]);

  const toggleTarea = async (id) => {
    await window.electronAPI.invoke("tareas:toggleCompletada", id);
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completada: t.completada ? 0 : 1 } : t,
      ),
    );
  };

  const handleCrearTarea = async ({
    nombre,
    descripcion,
    prioridad,
    materia_id,
    fecha_limite,
  }) => {
    await window.electronAPI.invoke("tareas:crear", {
      nombre,
      descripcion,
      prioridad,
      materia_id,
      fecha_limite,
      proyecto_id: null,
    });
    cargarTareas();
  };

  // Al hacer clic en un día → abre modal con esa fecha
  const handleDiaClick = (fecha) => {
    setFechaModal(fecha);
    setDiaSeleccionado(
      fecha && diaSeleccionado && mismodia(fecha, diaSeleccionado)
        ? null
        : fecha,
    );
    setModalTareaOpen(true);
  };

  const tareasPendientes = useMemo(
    () =>
      tareas
        .filter((t) => !t.completada)
        .sort((a, b) => {
          if (!a.fecha_limite) return 1;
          if (!b.fecha_limite) return -1;
          return new Date(a.fecha_limite) - new Date(b.fecha_limite);
        }),
    [tareas],
  );

  const tareasDiaSel = useMemo(() => {
    if (!diaSeleccionado) return null;
    return tareas.filter((t) => {
      if (!t.fecha_limite) return false;
      return mismodia(new Date(t.fecha_limite), diaSeleccionado);
    });
  }, [diaSeleccionado, tareas]);

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

  if (cargando)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
      </div>
    );

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white overflow-hidden">
      {/* ─── Columna principal ─────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Tareas</h1>
            <p className="text-xs text-gray-500 mt-1">
              {tareasPendientes.length} pendiente
              {tareasPendientes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => {
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
          onDiaClick={handleDiaClick}
        />

        {/* Lista de tareas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">
              {diaSeleccionado
                ? `Tareas del ${diaSeleccionado.toLocaleDateString("es-MX", { day: "numeric", month: "long" })}`
                : "Próximas tareas"}
            </h2>
            {diaSeleccionado && (
              <button
                onClick={() => setDiaSeleccionado(null)}
                className="text-[10px] text-gray-600 hover:text-white transition-colors"
              >
                Ver todas ✕
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(diaSeleccionado ? tareasDiaSel : tareasPendientes).length ===
            0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="text-3xl mb-3">🎉</p>
                <p className="text-sm font-medium">
                  {diaSeleccionado
                    ? "Sin tareas este día"
                    : "Sin tareas pendientes"}
                </p>
                <button
                  onClick={() => setModalTareaOpen(true)}
                  className="mt-4 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  + Crear una tarea
                </button>
              </div>
            ) : (
              (diaSeleccionado ? tareasDiaSel : tareasPendientes).map(
                (tarea) => (
                  <TareaCard
                    key={tarea.id}
                    tarea={tarea}
                    onToggle={toggleTarea}
                    colorMateria={colorMateria[tarea.materia_id]}
                  />
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* ─── Panel lateral ─────────────────────────── */}
      <aside className="w-72 border-l border-white/5 p-6 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">
          Por materia
        </h2>

        {resumenPorMateria.length === 0 ? (
          <p className="text-xs text-gray-600 italic">Sin tareas registradas</p>
        ) : (
          resumenPorMateria.map((m) => (
            <div
              key={m.id}
              className="bg-[#1e1e1e] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <p className="text-xs font-bold text-white truncate">
                  {m.nombre}
                </p>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((m.total - m.pendientes) / m.total) * 100}%`,
                    backgroundColor: m.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">
                  {m.pendientes} pendiente{m.pendientes !== 1 ? "s" : ""}
                </span>
                <span className="text-gray-600">
                  {m.total - m.pendientes}/{m.total}
                </span>
              </div>
            </div>
          ))
        )}
      </aside>

      {/* ─── Modal nueva tarea ─────────────────────── */}
      <ModalNuevaTarea
        isOpen={modalTareaOpen}
        onClose={() => {
          setModalTareaOpen(false);
          setFechaModal(null);
        }}
        onSave={handleCrearTarea}
        materias={materias}
        fechaInicial={fechaModal}
      />
    </div>
  );
};

export default TareasView;
