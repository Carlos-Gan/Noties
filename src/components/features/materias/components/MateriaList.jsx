import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MateriaCard from "./MateriaCard";
import { FiSearch, FiX } from "react-icons/fi";

const MateriaList = ({
  materias = [],
  tareasPorMateria = {},
  proyectosPorMateria = {},
  configSecciones,
  onMateriaClick,
  onMateriaContextMenu,
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroSemestre, setFiltroSemestre] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Obtener semestres únicos
  const semestres = useMemo(() => {
    const unique = new Set(materias.map(m => m.semestre).filter(Boolean));
    return ["todos", ...Array.from(unique).sort()];
  }, [materias]);

  // Filtrar materias
  const materiasFiltradas = useMemo(() => {
    return materias.filter(m => {
      // Búsqueda por nombre
      const matchBusqueda = !busqueda || 
        m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.profesor?.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por semestre
      const matchSemestre = filtroSemestre === "todos" || 
        m.semestre === parseInt(filtroSemestre);

      // Filtro por estado
      const matchEstado = filtroEstado === "todos" || 
        m.estado === filtroEstado;

      return matchBusqueda && matchSemestre && matchEstado;
    });
  }, [materias, busqueda, filtroSemestre, filtroEstado]);

  return (
    <div className="space-y-6">
      {/* Barra de filtros */}
      <div className="flex gap-3 flex-wrap items-center bg-[#1e1e1e] p-4 rounded-2xl border border-white/5">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
          <input
            type="text"
            placeholder="Buscar materia o profesor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#2a2a2a] border border-white/5 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-gray-700 outline-none focus:border-blue-500/50"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
            >
              <FiX size={12} />
            </button>
          )}
        </div>

        {/* Filtro semestre */}
        <select
          value={filtroSemestre}
          onChange={(e) => setFiltroSemestre(e.target.value)}
          className="bg-[#2a2a2a] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
        >
          {semestres.map(s => (
            <option key={s} value={s}>
              {s === "todos" ? "Todos los semestres" : `Semestre ${s}`}
            </option>
          ))}
        </select>

        {/* Filtro estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-[#2a2a2a] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
        >
          <option value="todos">Todos los estados</option>
          <option value="En curso">En curso</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Finalizada">Finalizada</option>
        </select>

        {/* Contador */}
        <span className="text-[10px] text-gray-600 font-black ml-auto">
          {materiasFiltradas.length} de {materias.length}
        </span>
      </div>

      {/* Grid de materias */}
      <AnimatePresence mode="popLayout">
        {materiasFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 text-gray-600"
          >
            <p className="text-4xl mb-4 opacity-20">📚</p>
            <p className="text-sm font-medium">No hay materias que coincidan</p>
            <p className="text-xs mt-2">Prueba con otros filtros</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {materiasFiltradas.map((materia, index) => (
              <MateriaCard
                key={materia.id}
                materia={materia}
                tareasPendientes={tareasPorMateria[materia.id]?.filter(t => !t.completada) || []}
                proyectosPendientes={proyectosPorMateria[materia.id] || []}
                configSecciones={configSecciones}
                onClick={() => onMateriaClick?.(materia)}
                onContextMenu={(e) => onMateriaContextMenu?.(e, materia)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MateriaList;