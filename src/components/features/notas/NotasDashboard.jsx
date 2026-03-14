import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const UNIDADES = ["Sin Unidad", "Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];

const formatFecha = (f) => {
  if (!f) return "—";
  const date = new Date(f);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  if (date.toDateString() === hoy.toDateString()) {
    return `Hoy, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  } else if (date.toDateString() === ayer.toDateString()) {
    return "Ayer";
  }

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== hoy.getFullYear() ? "numeric" : undefined,
  });
};

// ─── Dropdown custom ──────────────────────────────────
const Dropdown = ({ value, onChange, options, placeholder, icon }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => String(o.value) === String(value));

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 bg-white/[0.03] border ${
          open ? "border-white/20" : "border-white/5"
        } rounded-xl px-3 py-2.5 text-xs text-gray-400 hover:border-white/15 hover:text-white transition-all min-w-[160px]`}
      >
        {icon && <span className="text-gray-600">{icon}</span>}
        {selected?.color && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: selected.color }}
          />
        )}
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-[10px] text-gray-600"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 w-full min-w-[180px] bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-all flex items-center gap-2 ${
                    String(value) === String(opt.value)
                      ? "bg-white/10 text-white font-bold"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {opt.color && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  {opt.label}
                  {String(value) === String(opt.value) && (
                    <span className="ml-auto text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tarjeta de nota ──────────────────────────────
const NotaCard = ({ nota, onClick, variant = "grid" }) => {
  const color = nota.materia_color || "#3b82f6";

  if (variant === "grid") {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="text-left p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/15 hover:bg-white/[0.04] transition-all group"
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            {nota.icono || "📝"}
          </div>
          {nota.favorito && <span className="text-yellow-500 text-xs">⭐</span>}
        </div>
        <p className="text-sm font-bold text-white truncate mb-2 group-hover:text-blue-400 transition-colors">
          {nota.titulo || "Sin título"}
        </p>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {nota.materia_nombre && (
            <span
              className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
              style={{
                color: color,
                backgroundColor: `${color}15`,
              }}
            >
              {nota.materia_nombre}
            </span>
          )}
          <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
            {nota.unidad || "Sin Unidad"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-700">{formatFecha(nota.updated_at)}</span>
          {nota.tags?.length > 0 && (
            <span className="text-gray-600">#{nota.tags[0]}</span>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5 group"
    >
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate group-hover:text-blue-400 transition-colors">
          {nota.titulo || "Sin título"}
        </p>
        {nota.tags?.length > 0 && (
          <p className="text-[9px] text-gray-700 mt-0.5">
            #{nota.tags.join(" #")}
          </p>
        )}
      </div>
      <span
        className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg"
        style={{
          color: color,
          backgroundColor: `${color}15`,
        }}
      >
        {nota.materia_nombre}
      </span>
      <span className="text-[9px] text-blue-400 font-black uppercase">
        {nota.unidad || "General"}
      </span>
      <span className="text-[10px] text-gray-700 w-20 text-right">
        {formatFecha(nota.updated_at)}
      </span>
    </motion.button>
  );
};

// ─── Componente principal ──────────────────────────────
const NotasDashboard = ({ notas = [], navigateTo }) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroUnidad, setFiltroUnidad] = useState("todas");
  const [vista, setVista] = useState("grid");
  const [orden, setOrden] = useState("reciente");

  // Extraer materias únicas
  const materiasUnicas = useMemo(() => {
    const map = new Map();
    notas.forEach((n) => {
      if (n.materia_id && !map.has(n.materia_id)) {
        map.set(n.materia_id, {
          id: n.materia_id,
          nombre: n.materia_nombre || "Sin materia",
          color: n.materia_color || "#3b82f6",
          count: 0,
        });
      }
      if (map.has(n.materia_id)) {
        map.get(n.materia_id).count++;
      }
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [notas]);

  const unidadesConNotas = useMemo(
    () =>
      UNIDADES.filter((u) =>
        notas.some((n) => (n.unidad || "Sin Unidad") === u),
      ),
    [notas],
  );

  const metrics = useMemo(() => {
    const porUnidad = {};
    const porMateria = {};
    let totalTags = 0;
    const tagCount = {};

    notas.forEach((n) => {
      const u = n.unidad || "Sin Unidad";
      const m = n.materia_nombre || "Sin materia";
      porUnidad[u] = (porUnidad[u] || 0) + 1;
      porMateria[m] = (porMateria[m] || 0) + 1;

      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => {
          tagCount[t] = (tagCount[t] || 0) + 1;
          totalTags++;
        });
      }
    });

    const recientes = [...notas]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    return { porUnidad, porMateria, recientes, topTags, totalTags };
  }, [notas]);

  const notasFiltradas = useMemo(() => {
    let filtradas = notas.filter((n) => {
      const matchBusqueda =
        !busqueda ||
        n.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.materia_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.tags?.some((t) => t.toLowerCase().includes(busqueda.toLowerCase()));

      const matchMateria =
        filtroMateria === "todas" || n.materia_id === parseInt(filtroMateria);

      const matchUnidad =
        filtroUnidad === "todas" || (n.unidad || "Sin Unidad") === filtroUnidad;

      return matchBusqueda && matchMateria && matchUnidad;
    });

    // Aplicar ordenamiento
    if (orden === "titulo") {
      filtradas.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    } else if (orden === "materia") {
      filtradas.sort((a, b) =>
        (a.materia_nombre || "").localeCompare(b.materia_nombre || ""),
      );
    } else {
      filtradas.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    return filtradas;
  }, [notas, busqueda, filtroMateria, filtroUnidad, orden]);

  // 🔥 FUNCIÓN CORREGIDA: Navega directamente a la vista de apuntes
  // En NotasDashboard.jsx, cambia la función irANota:

  const irANota = useCallback(
    (nota) => {
      // Navegar directamente a la vista de apuntes
      navigateTo("materia-apuntes", {
        materiaId: nota.materia_id,
        materiaNombre: nota.materia_nombre,
        materiaColor: nota.materia_color,
        notaId: nota.id,
      });
    },
    [navigateTo],
  );

  const limpiarFiltros = useCallback(() => {
    setBusqueda("");
    setFiltroMateria("todas");
    setFiltroUnidad("todas");
  }, []);

  const filtrosActivos =
    busqueda || filtroMateria !== "todas" || filtroUnidad !== "todas";

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-y-auto">
      {/* ─── Header ─── */}
      <div className="px-10 pt-10 pb-6 border-b border-white/5 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">
              Biblioteca
            </p>
            <h1 className="text-4xl font-black text-white">Apuntes</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Selector de orden */}
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-400 outline-none focus:border-white/15"
            >
              <option value="reciente">Más recientes</option>
              <option value="titulo">Por título</option>
              <option value="materia">Por materia</option>
            </select>

            {/* Toggle vista */}
            <div className="flex bg-white/5 p-1 rounded-xl gap-0.5">
              {[
                ["grid", "⊞"],
                ["lista", "☰"],
              ].map(([v, icon]) => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    vista === v
                      ? "bg-white/10 text-white"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total notas", val: notas.length, icon: "📝" },
            { label: "Materias", val: materiasUnicas.length, icon: "📚" },
            { label: "Unidades", val: unidadesConNotas.length, icon: "📊" },
            { label: "Tags", val: metrics.topTags.length, icon: "🏷️" },
            {
              label: "Promedio",
              val: notas.length
                ? (notas.length / materiasUnicas.length).toFixed(1)
                : 0,
              icon: "📈",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-white">{s.val}</span>
                <span className="text-gray-600">{s.icon}</span>
              </div>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-blue-400 transition-colors">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por título, materia o tag..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <Dropdown
            value={filtroMateria}
            onChange={setFiltroMateria}
            placeholder="Todas las materias"
            icon="📚"
            options={[
              { value: "todas", label: "Todas las materias" },
              ...materiasUnicas.map((m) => ({
                value: m.id,
                label: `${m.nombre} (${m.count})`,
                color: m.color,
              })),
            ]}
          />

          <Dropdown
            value={filtroUnidad}
            onChange={setFiltroUnidad}
            placeholder="Todas las unidades"
            icon="📊"
            options={[
              { value: "todas", label: "Todas las unidades" },
              ...unidadesConNotas.map((u) => ({
                value: u,
                label: `${u} (${metrics.porUnidad[u] || 0})`,
              })),
            ]}
          />
        </div>
      </div>

      <div className="flex gap-8 px-10 py-8 flex-1 min-h-0">
        {/* ─── Contenido principal ─── */}
        <div className="flex-1 min-w-0">
          {/* Distribución por unidad */}
          {!filtrosActivos && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-4">
                  Distribución por unidad
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(metrics.porUnidad).map(([unidad, count]) => (
                    <motion.button
                      key={unidad}
                      onClick={() => setFiltroUnidad(unidad)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/15 hover:bg-white/[0.04] transition-all text-left"
                    >
                      <p className="text-xl font-black text-white">{count}</p>
                      <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">
                        {unidad}
                      </p>
                      <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(count / notas.length) * 100}%`,
                          }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Contador y limpiar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">
              <span className="text-white text-sm mr-2">
                {notasFiltradas.length}
              </span>
              nota{notasFiltradas.length !== 1 ? "s" : ""}
              {filtrosActivos ? " encontradas" : " en total"}
            </p>
            {filtrosActivos && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={limpiarFiltros}
                className="text-[10px] text-gray-600 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
              >
                Limpiar filtros ✕
              </motion.button>
            )}
          </div>

          {/* Notas */}
          <AnimatePresence mode="wait">
            {notasFiltradas.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-gray-700"
              >
                <span className="text-4xl mb-3 opacity-30">📭</span>
                <p className="text-sm font-bold">No hay apuntes</p>
                <p className="text-xs mt-1 opacity-60">
                  {filtrosActivos
                    ? "Prueba cambiando los filtros"
                    : "Crea tu primer apunte desde una materia"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={vista}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  vista === "grid" ? "grid grid-cols-2 gap-3" : "space-y-1"
                }
              >
                {notasFiltradas.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    onClick={() => irANota(nota)}
                    variant={vista}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Panel lateral ─── */}
        <div className="w-64 flex-shrink-0 space-y-6">
          {/* Recientes */}
          <div>
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3 flex items-center justify-between">
              <span>Recientes</span>
              <span className="text-gray-700 text-[9px]">últimos 5</span>
            </p>
            <div className="space-y-1">
              {metrics.recientes.map((nota) => (
                <motion.button
                  key={nota.id}
                  onClick={() => irANota(nota)}
                  whileHover={{ x: 4 }}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5 group"
                >
                  <p className="text-xs text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                    {nota.titulo || "Sin título"}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">
                      {nota.materia_nombre || "General"}
                    </span>
                    <span className="text-[9px] text-gray-700">
                      {formatFecha(nota.updated_at)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tags frecuentes */}
          {metrics.topTags.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3">
                Tags populares
              </p>
              <div className="flex flex-wrap gap-1.5">
                {metrics.topTags.map(({ tag, count }) => (
                  <motion.button
                    key={tag}
                    onClick={() => setBusqueda(tag)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                  >
                    <span className="text-blue-400 text-[9px] group-hover:text-blue-300">
                      #
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold group-hover:text-white">
                      {tag}
                    </span>
                    <span className="text-[8px] text-gray-700 ml-0.5 bg-white/5 px-1 rounded-full">
                      {count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Distribución por materia */}
          <div>
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-3">
              Notas por materia
            </p>
            <div className="space-y-3">
              {Object.entries(metrics.porMateria).map(([nombre, count]) => {
                const color =
                  notas.find((n) => n.materia_nombre === nombre)
                    ?.materia_color || "#3b82f6";
                const porcentaje = (count / notas.length) * 100;
                return (
                  <div key={nombre}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span
                        className="text-gray-500 truncate max-w-[120px]"
                        title={nombre}
                      >
                        {nombre}
                      </span>
                      <span className="text-white font-bold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentaje}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="pt-4 border-t border-white/5">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-[9px] text-gray-700">Promedio</p>
                <p className="text-lg font-black text-white">
                  {(notas.length / Math.max(materiasUnicas.length, 1)).toFixed(
                    1,
                  )}
                </p>
                <p className="text-[8px] text-gray-800">notas/materia</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-[9px] text-gray-700">Tags</p>
                <p className="text-lg font-black text-white">
                  {metrics.totalTags || 0}
                </p>
                <p className="text-[8px] text-gray-800">en total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotasDashboard;
