import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const backdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modal = {
  hidden: { opacity: 0, scale: 0.95, y: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.95, y: -30 },
};

const CommandPalette = ({
  isOpen,
  setIsOpen,
  materias = [],
  notas = [],
  navigateTo,
}) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState("Todo");

  const TIPOS = ["Todo", "Materia", "Apunte", "Tag", "Unidad"];

  const allData = useMemo(() => {
    const formatMaterias = materias.map((m) => ({
      id: m.id,
      icon: m.icono || "📚",
      title: m.nombre,
      type: "Materia",
      desc: "Ver todos los apuntes",
      original: m,
    }));

    const formatNotas = notas.map((n) => ({
      id: n.id,
      icon: "📝",
      title: n.titulo || "Nota sin título",
      type: "Apunte",
      desc: n.materia_nombre || "General",
      materia_id: n.materia_id,
      original: n,
    }));

    // Tags únicos de todas las notas
    const tagsMap = new Map();
    notas.forEach((n) => {
      if (!Array.isArray(n.tags)) return;
      n.tags.forEach((tag) => {
        if (!tagsMap.has(tag)) {
          tagsMap.set(tag, {
            id: `tag-${tag}`,
            icon: "🏷️",
            title: tag,
            type: "Tag",
            desc: `${notas.filter(x => x.tags?.includes(tag)).length} apunte(s)`,
            tag,
          });
        }
      });
    });

    // Unidades únicas de todas las notas
    const unidadesMap = new Map();
    notas.forEach((n) => {
      const u = n.unidad || "Sin Unidad";
      if (!unidadesMap.has(u)) {
        unidadesMap.set(u, {
          id: `unidad-${u}`,
          icon: "📂",
          title: u,
          type: "Unidad",
          desc: `${notas.filter(x => (x.unidad || "Sin Unidad") === u).length} apunte(s)`,
          unidad: u,
        });
      }
    });

    return [
      ...formatMaterias,
      ...formatNotas,
      ...Array.from(tagsMap.values()),
      ...Array.from(unidadesMap.values()),
    ];
  }, [materias, notas]);

  const results = useMemo(() => {
    let filtered = allData;

    // Filtro por tipo
    if (filtroTipo !== "Todo") {
      filtered = filtered.filter((item) => item.type === filtroTipo);
    }

    // Filtro por query
    if (query) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      filtered = filtered.slice(0, 6);
    }

    return filtered.slice(0, 10);
  }, [query, allData, filtroTipo]);

  const handleSelect = (item) => {
    if (!item) return;

    if (item.type === "Materia") {
      navigateTo("materia-detalle", item.original);
    } else if (item.type === "Apunte") {
      const materiaDeLaNota = materias.find((m) => m.id === item.materia_id);
      navigateTo("materia-detalle", materiaDeLaNota, item.id);
    } else if (item.type === "Tag") {
      // Navega a la primera materia que tenga notas con ese tag
      const notaConTag = notas.find((n) => n.tags?.includes(item.tag));
      if (notaConTag) {
        const materia = materias.find((m) => m.id === notaConTag.materia_id);
        navigateTo("materia-detalle", materia);
      }
    } else if (item.type === "Unidad") {
      // Navega a la primera materia que tenga notas con esa unidad
      const notaConUnidad = notas.find(
        (n) => (n.unidad || "Sin Unidad") === item.unidad
      );
      if (notaConUnidad) {
        const materia = materias.find((m) => m.id === notaConUnidad.materia_id);
        navigateTo("materia-detalle", materia);
      }
    }

    setQuery("");
    setFiltroTipo("Todo");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => (s + 1) % results.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => (s - 1 + results.length) % results.length);
      }
      if (e.key === "Enter") handleSelect(results[selected]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selected]);

  useEffect(() => { setSelected(0); }, [query, filtroTipo]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdrop}
            initial="hidden" animate="visible" exit="hidden"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            variants={modal}
            initial="hidden" animate="visible" exit="exit"
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-[#1a1a1a]/95 border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden backdrop-blur-xl"
          >
            {/* Input */}
            <div className="flex items-center p-4 border-b border-white/5">
              <span className="text-xl mr-3 opacity-50">🔍</span>
              <input
                autoFocus
                placeholder="Busca materias, apuntes, tags, unidades..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-lg text-white placeholder-gray-500"
              />
              <kbd className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-500 border border-white/10">
                ESC
              </kbd>
            </div>

            {/* Filtros de tipo */}
            <div className="flex gap-1 px-3 pt-2 pb-1">
              {TIPOS.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    filtroTipo === tipo
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Resultados */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">
                  No hay coincidencias para "{query}"
                </p>
              ) : (
                results.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                      index === selected
                        ? "bg-blue-600 shadow-lg shadow-blue-900/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${index === selected ? "bg-white/20" : "bg-white/5"}`}>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${index === selected ? "text-white" : "text-gray-200"}`}>
                        {item.title}
                      </p>
                      <p className={`text-[10px] uppercase tracking-wider ${index === selected ? "text-blue-100/70" : "text-gray-500"}`}>
                        {item.type} • {item.desc}
                      </p>
                    </div>
                    {index === selected && (
                      <span className="text-[10px] font-black text-white/50 bg-white/10 px-2 py-1 rounded">
                        ENTER
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;