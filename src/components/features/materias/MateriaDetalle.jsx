import { useState, useEffect, useCallback } from "react";
import EditorApunte from "../apuntes/EditorApunte";

const MateriaDetalle = ({
  materia,
  onVolver,
  configSecciones,
  idNotaInicial,
}) => {
  const [notas, setNotas] = useState([]);
  const [notaActiva, setNotaActiva] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [unidad, setUnidad] = useState("Sin Unidad");
  const [tags, setTags] = useState([]); // Estado para etiquetas
  const [newTag, setNewTag] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [isUnidadOpen, setIsUnidadOpen] = useState(false);
  const [menuContexto, setMenuContexto] = useState(null); // Para borrar con clic derecho

  // 1. FUNCIÓN PARA SELECCIONAR NOTA (Carga todos los datos)
  const seleccionarNota = (nota) => {
    setNotaActiva(nota);
    setTitulo(nota.titulo || "");
    setContenido(nota.contenido || "");
    setUnidad(nota.unidad || "Sin Unidad");
    // Como ya lo parseamos en el Main, aquí llega como Array
    setTags(Array.isArray(nota.tags) ? nota.tags : []);
  };

  const cargarNotas = useCallback(async () => {
    try {
      const data = await window.electron.invoke(
        "apuntes:getByMateria",
        materia.id,
      );
      setNotas(data);
      if (data.length > 0) {
        const notaAOpen = idNotaInicial
          ? data.find((n) => n.id === idNotaInicial)
          : data[0];
        if (notaAOpen) seleccionarNota(notaAOpen);
      }
    } catch (err) {
      console.error("Error cargando notas:", err);
    }
  }, [materia.id, idNotaInicial]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  // 2. LÓGICA DE AUTO-GUARDADO (Ahora incluye Tags)
  useEffect(() => {
    if (!notaActiva) return;

    const timeout = setTimeout(async () => {
      // Convertimos tags a string para guardarlo en la DB
      const tagsChanged =
        JSON.stringify(tags) !== (notaActiva.tags_cache || "[]");

      if (
        titulo === notaActiva.titulo &&
        contenido === notaActiva.contenido &&
        unidad === (notaActiva.unidad || "Sin Unidad") &&
        !tagsChanged
      )
        return;

      try {
        setGuardando(true);
        await window.electron.invoke("apuntes:guardar", {
          id: notaActiva.id,
          titulo,
          contenido: JSON.stringify(contenido),
          unidad,
          tags: tags, // Guardamos las etiquetas
        });

        setNotas((prev) =>
          prev.map((n) =>
            n.id === notaActiva.id
              ? {
                  ...n,
                  titulo,
                  contenido,
                  unidad,
                  tags_cache: JSON.stringify(tags),
                  updated_at: new Date(),
                }
              : n,
          ),
        );
      } catch (err) {
        console.error("Error al guardar:", err);
      } finally {
        setGuardando(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [titulo, contenido, unidad, tags, notaActiva]);

  // 3. FUNCIONES DE ACCIÓN
  const crearNota = async () => {
    try {
      const nueva = await window.electron.invoke("apuntes:crear", {
        materia_id: materia.id,
        titulo: "Nuevo Apunte",
      });
      setNotas((prev) => [nueva, ...prev]);
      seleccionarNota(nueva);
    } catch (err) {
      console.error("Error creando nota:", err);
    }
  };

  const eliminarNota = async (id) => {
    try {
      await window.electron.invoke("apuntes:eliminar", id);
      const nuevas = notas.filter((n) => n.id !== id);
      setNotas(nuevas);
      if (notaActiva?.id === id) {
        const siguiente = nuevas[0] || null;
        if (siguiente) seleccionarNota(siguiente);
        else setNotaActiva(null);
      }
    } catch (err) {
      console.error("Error eliminando nota:", err);
    }
  };

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white font-sans">
      <aside className="w-72 border-r border-white/5 flex flex-col bg-[#161616]">
        <div className="p-6">
          <button
            onClick={onVolver}
            className="text-[10px] text-gray-500 uppercase font-black mb-4 hover:text-white transition-colors"
          >
            ← Dashboard
          </button>
          <h2 className="text-xl font-bold truncate mb-1">{materia.nombre}</h2>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-6">
            Apuntes
          </p>
          <button
            onClick={crearNota}
            className={`w-full py-3 ${configSecciones?.Apuntes?.color || "bg-blue-600"} rounded-2xl text-xs font-bold shadow-lg transition-transform active:scale-95`}
          >
            + Nueva Nota
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
          {notas.map((nota) => (
            <div
              key={nota.id}
              onClick={() => seleccionarNota(nota)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuContexto({
                  x: e.clientX,
                  y: e.clientY,
                  notaId: nota.id,
                  titulo: nota.titulo,
                });
              }}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                notaActiva?.id === nota.id
                  ? "bg-white/5 border-white/10"
                  : "hover:bg-white/[0.02] border-transparent"
              }`}
            >
              <p className="text-sm font-bold truncate">
                {nota.titulo || "Sin título"}
              </p>
              <div className="flex justify-between items-center mt-1 text-[9px]">
                <p className="text-blue-400 font-black uppercase">
                  {nota.unidad || "General"}
                </p>
                <p className="text-gray-600 font-bold">
                  {nota.updated_at
                    ? new Date(nota.updated_at).toLocaleDateString()
                    : "Reciente"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {notaActiva ? (
          <>
            <div className="p-10 pb-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="bg-transparent text-5xl font-black outline-none w-full placeholder:text-white/5"
                  placeholder="Título..."
                />
                {guardando && (
                  <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-black text-blue-500">
                      Guardando
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {/* UNIDAD */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUnidadOpen(!isUnidadOpen)}
                      className="flex items-center h-10 gap-3 bg-white/[0.03] border border-white/10 px-4 rounded-xl hover:bg-white/[0.06]"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                          Progreso
                        </span>
                        <span className="text-[11px] font-bold text-white uppercase">
                          {unidad} ▾
                        </span>
                      </div>
                    </button>
                    {isUnidadOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUnidadOpen(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-44 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                          {[
                            "Sin Unidad",
                            "Unidad 1",
                            "Unidad 2",
                            "Unidad 3",
                            "Unidad 4",
                          ].map((u) => (
                            <button
                              key={u}
                              onClick={() => {
                                setUnidad(u);
                                setIsUnidadOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase transition-colors ${unidad === u ? "bg-blue-600" : "hover:bg-white/5 text-gray-400"}`}
                            >
                              {u === "Sin Unidad" ? "General" : u}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* MATERIA */}
                  <div
                    className="flex items-center h-10 gap-3 border px-4 rounded-xl"
                    style={{
                      backgroundColor: `${materia.color}10`,
                      borderColor: `${materia.color}30`,
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span
                        className="text-[8px] font-black uppercase tracking-widest"
                        style={{ color: materia.color }}
                      >
                        Materia
                      </span>
                      <span
                        className="text-[11px] font-bold uppercase"
                        style={{ color: materia.color }}
                      >
                        {materia.nombre}
                      </span>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center h-10 px-4 border-l border-white/5">
                    <span className="text-[9px] text-gray-600 font-bold uppercase">
                      Modificado:{" "}
                      {notaActiva?.updated_at
                        ? new Date(notaActiva.updated_at).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "--:--"}
                    </span>
                  </div>
                </div>

                {/* ETIQUETAS */}
                <div className="flex items-center flex-wrap gap-2 pt-3 border-t border-white/5">
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mr-2">
                    Tags:
                  </span>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 group"
                    >
                      <span className="text-blue-400 opacity-40">#</span>
                      {tag}
                      <button
                        onClick={() =>
                          setTags(tags.filter((_, i) => i !== index))
                        }
                        className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[8px]"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="+ Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTag.trim()) {
                        setTags([...tags, newTag.trim()]);
                        setNewTag("");
                      }
                    }}
                    className="bg-transparent border border-dashed border-white/10 rounded-lg px-3 py-1 text-[10px] outline-none focus:border-white/20 w-24 focus:w-36 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-20 scrollbar-hide">
              <div className="max-w-4xl mx-auto h-full">
                <EditorApunte contenido={contenido} onChange={setContenido} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4 text-center">
            <span className="text-5xl opacity-20">📝</span>
            <p className="italic font-medium opacity-50">
              Selecciona un apunte para continuar con tu clase.
            </p>
          </div>
        )}

        {/* MENÚ CONTEXTUAL PARA BORRAR */}
        {menuContexto && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuContexto(null)}
            />
            <div
              className="fixed z-50 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl py-2 w-48 backdrop-blur-xl"
              style={{ top: menuContexto.y, left: menuContexto.x }}
            >
              <div className="px-4 py-2 border-b border-white/5 mb-1">
                <p className="text-[9px] text-gray-500 font-black uppercase truncate">
                  {menuContexto.titulo}
                </p>
              </div>
              <button
                onClick={() => {
                  eliminarNota(menuContexto.notaId);
                  setMenuContexto(null);
                }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors"
              >
                <span>🗑</span> Eliminar apunte
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MateriaDetalle;
