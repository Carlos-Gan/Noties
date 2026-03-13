import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const UNIDADES = ["Sin Unidad", "Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];

const formatFecha = (f) => {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  });
};

// ─── Dropdown custom ──────────────────────────────────
const Dropdown = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-400 hover:border-white/15 hover:text-white transition-all min-w-[160px]"
      >
        {selected?.color && (
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: selected.color }} />
        )}
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : placeholder}
        </span>
        <span className={`transition-transform duration-200 text-[10px] ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-all flex items-center gap-2 ${
                  String(value) === String(opt.value)
                    ? "bg-white/10 text-white font-bold"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {opt.color && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: opt.color }} />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Componente principal ──────────────────────────────
const NotasDashboard = ({ notas = [], navigateTo }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroUnidad, setFiltroUnidad] = useState("todas");
  const [vista, setVista] = useState("grid");

  // Extraer materias únicas directo de las notas
  const materiasUnicas = useMemo(() => {
    const map = new Map();
    notas.forEach((n) => {
      if (n.materia_id && !map.has(n.materia_id)) {
        map.set(n.materia_id, {
          id: n.materia_id,
          nombre: n.materia_nombre || "Sin materia",
          color: n.materia_color || "#3b82f6",
        });
      }
    });
    return [...map.values()];
  }, [notas]);

  const unidadesConNotas = useMemo(() =>
    UNIDADES.filter((u) => notas.some((n) => (n.unidad || "Sin Unidad") === u)),
  [notas]);

  const metrics = useMemo(() => {
    const porUnidad = {};
    const porMateria = {};

    notas.forEach((n) => {
      const u = n.unidad || "Sin Unidad";
      const m = n.materia_nombre || "Sin materia";
      porUnidad[u] = (porUnidad[u] || 0) + 1;
      porMateria[m] = (porMateria[m] || 0) + 1;
    });

    const recientes = [...notas]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

    const todosLosTags = notas.flatMap((n) => Array.isArray(n.tags) ? n.tags : []);
    const tagCount = {};
    todosLosTags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; });
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return { porUnidad, porMateria, recientes, topTags };
  }, [notas]);

  const notasFiltradas = useMemo(() => {
    return notas.filter((n) => {
      const matchBusqueda =
        !busqueda ||
        n.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.materia_nombre?.toLowerCase().includes(busqueda.toLowerCase());
      const matchMateria =
        filtroMateria === "todas" || n.materia_id === parseInt(filtroMateria);
      const matchUnidad =
        filtroUnidad === "todas" || (n.unidad || "Sin Unidad") === filtroUnidad;
      return matchBusqueda && matchMateria && matchUnidad;
    });
  }, [notas, busqueda, filtroMateria, filtroUnidad]);

  const irANota = (nota) => {
    const materia = materiasUnicas.find((m) => m.id === nota.materia_id);
    if (materia) navigateTo("materia-detalle", { ...materia, notaId: nota.id });
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-y-auto">
      {/* ─── Header ─── */}
      <div className="px-10 pt-10 pb-6 border-b border-white/5">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Biblioteca</p>
            <h1 className="text-4xl font-black text-white">Apuntes</h1>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl gap-0.5">
            {[["grid", "⊞"], ["lista", "☰"]].map(([v, icon]) => (
              <button key={v} onClick={() => setVista(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vista === v ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-400"
                }`}
              >{icon}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total notas",  val: notas.length },
            { label: "Materias",     val: materiasUnicas.length },
            { label: "Unidades",     val: unidadesConNotas.length },
            { label: "Tags únicos",  val: metrics.topTags.length },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-2xl font-black text-white">{s.val}</p>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar apuntes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-white/15 transition-all"
            />
          </div>

          <Dropdown
            value={filtroMateria}
            onChange={setFiltroMateria}
            placeholder="Todas las materias"
            options={[
              { value: "todas", label: "Todas las materias" },
              ...materiasUnicas.map((m) => ({ value: m.id, label: m.nombre, color: m.color })),
            ]}
          />

          <Dropdown
            value={filtroUnidad}
            onChange={setFiltroUnidad}
            placeholder="Todas las unidades"
            options={[
              { value: "todas", label: "Todas las unidades" },
              ...unidadesConNotas.map((u) => ({ value: u, label: u })),
            ]}
          />
        </div>
      </div>

      <div className="flex gap-8 px-10 py-8 flex-1 min-h-0">
        {/* ─── Contenido principal ─── */}
        <div className="flex-1 min-w-0">

          {/* Distribución por unidad */}
          {filtroUnidad === "todas" && filtroMateria === "todas" && !busqueda && (
            <div className="mb-8">
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-4">Por unidad</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(metrics.porUnidad).map(([unidad, count]) => (
                  <button key={unidad} onClick={() => setFiltroUnidad(unidad)}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/15 hover:bg-white/[0.04] transition-all text-left"
                  >
                    <p className="text-xl font-black text-white">{count}</p>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">{unidad}</p>
                    <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / notas.length) * 100}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contador y limpiar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">
              {notasFiltradas.length} nota{notasFiltradas.length !== 1 ? "s" : ""}
              {busqueda || filtroMateria !== "todas" || filtroUnidad !== "todas" ? " encontradas" : " en total"}
            </p>
            {(busqueda || filtroMateria !== "todas" || filtroUnidad !== "todas") && (
              <button
                onClick={() => { setBusqueda(""); setFiltroMateria("todas"); setFiltroUnidad("todas"); }}
                className="text-[10px] text-gray-600 hover:text-white transition-colors"
              >Limpiar filtros ✕</button>
            )}
          </div>

          {/* Notas */}
          {notasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-700">
              <span className="text-4xl mb-3 opacity-30">📭</span>
              <p className="text-sm font-bold">No hay apuntes</p>
              <p className="text-xs mt-1 opacity-60">Prueba cambiando los filtros</p>
            </div>
          ) : vista === "grid" ? (
            <div className="grid grid-cols-2 gap-3">
              {notasFiltradas.map((nota) => (
                <motion.button
                  key={nota.id}
                  onClick={() => irANota(nota)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-left p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/15 hover:bg-white/[0.04] transition-all"
                >
                  <p className="text-sm font-bold text-white truncate mb-2">
                    {nota.titulo || "Sin título"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {nota.materia_nombre && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
                        style={{
                          color: nota.materia_color || "#3b82f6",
                          backgroundColor: `${nota.materia_color || "#3b82f6"}15`,
                        }}
                      >{nota.materia_nombre}</span>
                    )}
                    <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
                      {nota.unidad || "Sin Unidad"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-700 mt-3">{formatFecha(nota.updated_at)}</p>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {notasFiltradas.map((nota) => (
                <motion.button
                  key={nota.id}
                  onClick={() => irANota(nota)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: nota.materia_color || "#3b82f6" }} />
                  <p className="flex-1 text-sm text-white font-medium truncate">
                    {nota.titulo || "Sin título"}
                  </p>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
                    style={{
                      color: nota.materia_color || "#3b82f6",
                      backgroundColor: `${nota.materia_color || "#3b82f6"}15`,
                    }}
                  >{nota.materia_nombre}</span>
                  <span className="text-[9px] text-blue-400 font-black uppercase">{nota.unidad || "General"}</span>
                  <span className="text-[10px] text-gray-700 w-24 text-right">{formatFecha(nota.updated_at)}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Panel lateral ─── */}
        <div className="w-56 flex-shrink-0 space-y-6">

          <div>
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3">Recientes</p>
            <div className="space-y-1">
              {metrics.recientes.map((nota) => (
                <button key={nota.id} onClick={() => irANota(nota)}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5"
                >
                  <p className="text-xs text-white font-medium truncate">{nota.titulo || "Sin título"}</p>
                  <p className="text-[10px] text-gray-700 mt-0.5">{formatFecha(nota.updated_at)}</p>
                </button>
              ))}
            </div>
          </div>

          {metrics.topTags.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3">Tags frecuentes</p>
              <div className="flex flex-wrap gap-1.5">
                {metrics.topTags.map(([tag, count]) => (
                  <button key={tag} onClick={() => setBusqueda(tag)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg hover:border-white/15 transition-all"
                  >
                    <span className="text-blue-400 text-[9px]">#</span>
                    <span className="text-[10px] text-gray-400 font-bold">{tag}</span>
                    <span className="text-[9px] text-gray-700 ml-0.5">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3">Por materia</p>
            <div className="space-y-2">
              {Object.entries(metrics.porMateria).map(([nombre, count]) => {
                const color = notas.find((n) => n.materia_nombre === nombre)?.materia_color || "#3b82f6";
                return (
                  <div key={nombre}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500 truncate max-w-[120px]">{nombre}</span>
                      <span className="text-white font-bold">{count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / notas.length) * 100}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotasDashboard;