import { FiSearch, FiBarChart2, FiCalendar, FiPieChart } from "react-icons/fi";
import { TIPOS_EVALUACION } from "./constants";

const EvaluacionFiltros = ({
  vista,
  setVista,
  filtroMateria,
  setFiltroMateria,
  filtroTipo,
  setFiltroTipo,
  filtroUnidad,
  setFiltroUnidad,
  busqueda,
  setBusqueda,
  orden,
  setOrden,
  materias,
  unidadesUnicas,
}) => {
  const tabs = [
    { id: "lista", icon: FiBarChart2, label: "Lista" },
    { id: "calendario", icon: FiCalendar, label: "Calendario" },
    { id: "estadisticas", icon: FiPieChart, label: "Estadísticas" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setVista(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                vista === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-[#1e1e1e] text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* Búsqueda */}
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            size={14}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-[#1e1e1e] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-gray-700 outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filtro materia */}
        <select
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
          className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50"
        >
          <option value="todas">Todas las materias</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>

        {/* Filtro tipo */}
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50"
        >
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPOS_EVALUACION).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>

        {/* Filtro por unidad */}
        <select
          value={filtroUnidad}
          onChange={(e) => setFiltroUnidad(e.target.value)}
          className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50"
        >
          <option value="todas">Todas las unidades</option>
          {unidadesUnicas
            .filter((u) => u !== "todas")
            .map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
        </select>

        {/* Orden */}
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50"
        >
          <option value="fecha">Por fecha</option>
          <option value="materia">Por materia</option>
          <option value="tipo">Por tipo</option>
          <option value="unidad">Por unidad</option>
        </select>
      </div>
    </div>
  );
};

export default EvaluacionFiltros;