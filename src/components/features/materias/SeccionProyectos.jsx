import { useState, useEffect } from "react";

const ESTADOS = {
  pendiente: {
    label: "Pendiente",
    color: "text-gray-400 bg-white/5 border-white/10",
  },
  en_progreso: {
    label: "En progreso",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  entregado: {
    label: "Entregado",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
};

const PRIORIDAD_ICON = { alta: "🔴", media: "🟡", baja: "🟢" };

const SeccionProyectos = ({ materia }) => {
  const [proyectos, setProyectos] = useState([]);
  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");

  const cargarProyectos = async () => {
    const data = await window.electron.invoke(
      "proyectos:getByMateria",
      materia.id,
    );
    setProyectos(data);
  };

  useEffect(() => {
    cargarProyectos();
  }, [materia.id]);

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return;
    await window.electron.invoke("proyectos:crear", {
      nombre: nuevoNombre.trim(),
      descripcion: nuevaDesc.trim(),
      materia_id: materia.id,
      estado: "pendiente",
      prioridad: "media",
    });
    setNuevoNombre("");
    setNuevaDesc("");
    setCreando(false);
    cargarProyectos();
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    // 1. Buscamos el proyecto actual para no perder sus datos (evita error de NOT NULL)
    const proyectoActual = proyectos.find((p) => p.id === id);
    if (!proyectoActual || proyectoActual.estado === nuevoEstado) return;

    // 2. Preparamos el objeto completo
    const datosActualizados = {
      ...proyectoActual,
      estado: nuevoEstado,
    };

    try {
      // 3. Invocamos el canal de actualización
      await window.electron.invoke("proyectos:actualizar", datosActualizados);

      // 4. Actualizamos el estado local para que la UI responda al instante
      setProyectos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // Opcional: recargar para sincronizar si hubo error
      cargarProyectos();
    }
  };

  return (
    <div className="mt-10 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          🚀 Proyectos
          <span className="text-xs font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
            {proyectos.length}
          </span>
        </h2>
        <button
          onClick={() => setCreando(!creando)}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all"
        >
          + Nuevo
        </button>
      </div>

      {/* Form inline crear */}
      {creando && (
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 mb-4 space-y-3">
          <input
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500/40"
            placeholder="Nombre del proyecto..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCrear()}
          />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none placeholder:text-gray-600"
            placeholder="Descripción (opcional)..."
            value={nuevaDesc}
            onChange={(e) => setNuevaDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setCreando(false)}
              className="flex-1 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={!nuevoNombre.trim()}
              className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-40"
            >
              Crear Proyecto
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {proyectos.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p className="text-2xl mb-2">🚀</p>
          <p className="text-xs">Sin proyectos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proyectos.map((p) => {
            const estado = ESTADOS[p.estado] || ESTADOS.pendiente;
            return (
              <div
                key={p.id}
                className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {p.nombre}
                    </p>
                    {p.descripcion && (
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {p.descripcion}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px]">
                    {PRIORIDAD_ICON[p.prioridad] || "🟡"}
                  </span>
                </div>

                {/* Selector de estado */}
                <div className="flex gap-1.5 mt-3">
                  {Object.entries(ESTADOS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => cambiarEstado(p.id, key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        p.estado === key
                          ? val.color
                          : "text-gray-600 border-transparent hover:border-white/10 hover:text-gray-400"
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>

                {p.fecha_limite && (
                  <p className="text-[10px] text-gray-600 mt-2">
                    📅{" "}
                    {new Date(p.fecha_limite).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeccionProyectos;
