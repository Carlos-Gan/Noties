import { useState, useEffect, useMemo } from "react";
import ModalNuevaTarea from "../../Modals/ModalNuevaTarea";

const formatFecha = (fechaStr) => {
  if (!fechaStr) return null;
  const f = new Date(fechaStr);
  const now = new Date();
  const diff = Math.ceil((f - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Vencida", urgencia: "vencida" };
  if (diff === 0) return { label: "Hoy", urgencia: "hoy" };
  if (diff === 1) return { label: "Mañana", urgencia: "manana" };
  if (diff <= 3) return { label: `En ${diff} días`, urgencia: "pronto" };
  if (diff <= 7) return { label: `En ${diff} días`, urgencia: "semana" };
  return {
    label: f.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
    urgencia: "normal",
  };
};

const colorUrgencia = {
  vencida: "text-red-400 bg-red-500/10 border-red-500/20",
  hoy: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  manana: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  pronto: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  semana: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  normal: "text-gray-400 bg-white/5 border-white/5",
};

const prioridadIcon = { alta: "🔴", media: "🟡", baja: "🟢" };
const FILTROS = ["Todas", "Alta", "Media", "Baja", "Vencidas"];

const SeccionTareas = ({ materia, materias }) => {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [menuContextual, setMenuContextual] = useState(null); // { x: 0, y: 0, tareaId: null }
  const [editandoTarea, setEditandoTarea] = useState(null); // Tarea que se va a editar
  const [tareaAEditar, setTareaAEditar] = useState(null);

  const cargarTareas = async () => {
    const data = await window.electronAPI.invoke(
      "tareas:getByMateria",
      materia.id,
    );
    setTareas(data);
  };

  useEffect(() => {
    cargarTareas();
  }, [materia.id]);

  const toggleTarea = async (id) => {
    await window.electronAPI.invoke("tareas:toggleCompletada", id);
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completada: t.completada ? 0 : 1 } : t,
      ),
    );
  };

  const handleCrear = async ({
    nombre,
    descripcion,
    prioridad,
    fecha_limite,
  }) => {
    await window.electronAPI.invoke("tareas:crear", {
      nombre,
      descripcion,
      prioridad,
      materia_id: materia.id,
      fecha_limite,
      proyecto_id: null,
    });
    cargarTareas();
  };

  const handleContextMenu = (e, tarea) => {
    e.preventDefault(); // Bloquea el menú normal
    setMenuContextual({
      x: e.pageX,
      y: e.pageY,
      tarea: tarea,
    });
  };

  const handleGuardar = async (datos) => {
    if (tareaAEditar) {
      // Lógica para actualizar (puedes crear este invoke en tu main de Electron)
      await window.electronAPI.invoke("tareas:actualizar", {
        ...datos,
        id: tareaAEditar.id,
      });
    } else {
      // Tu lógica actual de crear
      await window.electronAPI.invoke("tareas:crear", {
        ...datos,
        materia_id: materia.id,
        proyecto_id: null,
      });
    }
    setTareaAEditar(null); // Limpiamos después de guardar
    cargarTareas();
  };

  // Función para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const cerrarMenu = () => setMenuContextual(null);
    window.addEventListener("click", cerrarMenu);
    return () => window.removeEventListener("click", cerrarMenu);
  }, []);

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((t) => {
      if (filtro === "Todas") return true;
      if (filtro === "Alta") return t.prioridad === "alta";
      if (filtro === "Media") return t.prioridad === "media";
      if (filtro === "Baja") return t.prioridad === "baja";
      if (filtro === "Vencidas") {
        if (!t.fecha_limite || t.completada) return false;
        return new Date(t.fecha_limite) < new Date();
      }
      return true;
    });
  }, [tareas, filtro]);

  const pendientes = tareas.filter((t) => !t.completada).length;

  return (
    <div className="mt-10">
      {/* Header sección */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            ✅ Tareas
            <span className="text-xs font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
              {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
            </span>
          </h2>
        </div>
        <button
          onClick={() => {
            setTareaAEditar(null); // Nos aseguramos de limpiar cualquier tarea que se estuviera editando
            setModalOpen(true)}
          }
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 rounded-xl text-xs font-bold transition-all"
        >
          + Nueva
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filtro === f
                ? "bg-white/10 text-white border border-white/20"
                : "text-gray-600 hover:text-white hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {tareasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-xs">
              Sin tareas{" "}
              {filtro !== "Todas" ? `con filtro "${filtro}"` : "registradas"}
            </p>
          </div>
        ) : (
          tareasFiltradas
            .sort((a, b) => {
              if (a.completada !== b.completada) return a.completada ? 1 : -1;
              if (!a.fecha_limite) return 1;
              if (!b.fecha_limite) return -1;
              return new Date(a.fecha_limite) - new Date(b.fecha_limite);
            })
            .map((tarea) => {
              const fecha = formatFecha(tarea.fecha_limite);
              return (
                <div
                  key={tarea.id}
                  onContextMenu={(e) => handleContextMenu(e, tarea)}
                  className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <button
                    onClick={() => toggleTarea(tarea.id)}
                    className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                    style={{ borderColor: materia.color || "#3b82f6" }}
                  >
                    {tarea.completada === 1 && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: materia.color }}
                      />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${tarea.completada ? "line-through text-gray-600" : "text-white"}`}
                    >
                      {tarea.nombre}
                    </p>
                    {tarea.descripcion && (
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {tarea.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px]">
                        {prioridadIcon[tarea.prioridad] || "🟡"}
                      </span>
                      {fecha && !tarea.completada && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorUrgencia[fecha.urgencia]}`}
                        >
                          {fecha.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
        {menuContextual && (
          <div
            className="fixed z-50 bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-lg py-1 w-40 overflow-hidden"
            style={{ top: menuContextual.y, left: menuContextual.x }}
          > 
            <button
              onClick={() => {
                setTareaAEditar(menuContextual.tarea); // Guardamos la tarea a editar
                setModalOpen(true); // Reutilizamos tu modal
                setMenuContextual(null); // Cerramos el menú
              }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-gray-300 hover:bg-orange-500 hover:text-white transition-colors flex items-center gap-2"
            >
              ✏️ Editar tarea
            </button>
            <button
              onClick={async () => {
                // Aquí podrías llamar a una función de borrar
                await window.electron.invoke(
                  "tareas:eliminar",
                  menuContextual.tarea.id,
                );
                cargarTareas();
              }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              🗑️ Eliminar
            </button>
          </div>
        )}
      </div>

      <ModalNuevaTarea
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setTareaAEditar(null); // Limpiamos la tarea a editar al cerrar
        }}
        onSave={handleGuardar}
        materias={materias}
        tarea={tareaAEditar} // Pasamos la tarea a editar (si es que hay)
        fechaInicial={null}
      />
    </div>
  );
};

export default SeccionTareas;
