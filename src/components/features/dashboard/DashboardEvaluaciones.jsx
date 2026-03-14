import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiCalendar,
  FiTrendingUp,
  FiPieChart,
  FiDownload,
  FiFilter,
  FiSearch,
  FiAward,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const TIPOS_EVALUACION = {
  examen: {
    label: "Examen",
    color: "text-red-400",
    bg: "bg-red-500/10",
    icon: "📝",
  },
  tarea: {
    label: "Tarea",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: "📋",
  },
  proyecto: {
    label: "Proyecto",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    icon: "🚀",
  },
  participacion: {
    label: "Participación",
    color: "text-green-400",
    bg: "bg-green-500/10",
    icon: "🗣️",
  },
  practica: {
    label: "Práctica",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    icon: "🔬",
  },
  otro: {
    label: "Otro",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    icon: "📌",
  },
};

const DashboardEvaluaciones = ({ materias = [], onMateriaClick }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [vista, setVista] = useState("calendario"); // calendario, lista, estadisticas
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("fecha"); // fecha, materia, tipo

  // Cargar evaluaciones
  useEffect(() => {
    const cargarEvaluaciones = async () => {
      const data = await window.electronAPI.evaluaciones.getAll();
      setEvaluaciones(data);
    };
    cargarEvaluaciones();

    // Escuchar actualizaciones
    const handleUpdate = () => {
      window.electronAPI.evaluaciones.getAll().then(setEvaluaciones);
    };
    window.addEventListener("evaluaciones-updated", handleUpdate);
    return () =>
      window.removeEventListener("evaluaciones-updated", handleUpdate);
  }, []);

  // Filtrar evaluaciones
  const evaluacionesFiltradas = useMemo(() => {
    return evaluaciones
      .filter((e) => {
        if (
          filtroMateria !== "todas" &&
          e.materia_id !== parseInt(filtroMateria)
        )
          return false;
        if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
        if (busqueda) {
          const searchTerm = busqueda.toLowerCase();
          return (
            e.nombre.toLowerCase().includes(searchTerm) ||
            e.materia_nombre?.toLowerCase().includes(searchTerm)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (orden === "fecha") return new Date(b.fecha) - new Date(a.fecha);
        if (orden === "materia")
          return (a.materia_nombre || "").localeCompare(b.materia_nombre || "");
        if (orden === "tipo") return a.tipo.localeCompare(b.tipo);
        return 0;
      });
  }, [evaluaciones, filtroMateria, filtroTipo, busqueda, orden]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = evaluaciones.length;
    const evaluadas = evaluaciones.filter(
      (e) => e.calificacion !== null,
    ).length;
    const pendientes = total - evaluadas;

    const porMateria = {};
    const porTipo = {};

    evaluaciones.forEach((e) => {
      // Por materia
      if (!porMateria[e.materia_id]) {
        porMateria[e.materia_id] = {
          materia: e.materia_nombre,
          color: e.materia_color,
          total: 0,
          evaluadas: 0,
          suma: 0,
        };
      }
      porMateria[e.materia_id].total++;
      if (e.calificacion !== null) {
        porMateria[e.materia_id].evaluadas++;
        porMateria[e.materia_id].suma += e.calificacion;
      }

      // Por tipo
      if (!porTipo[e.tipo]) {
        porTipo[e.tipo] = { total: 0, evaluadas: 0 };
      }
      porTipo[e.tipo].total++;
      if (e.calificacion !== null) porTipo[e.tipo].evaluadas++;
    });

    // Calcular promedios
    Object.keys(porMateria).forEach((id) => {
      const m = porMateria[id];
      m.promedio = m.evaluadas > 0 ? (m.suma / m.evaluadas).toFixed(1) : "-";
    });

    return {
      total,
      evaluadas,
      pendientes,
      porMateria,
      porTipo,
      proximas: evaluaciones
        .filter(
          (e) => e.calificacion === null && new Date(e.fecha) > new Date(),
        )
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(0, 5),
    };
  }, [evaluaciones]);

  // Agrupar por fecha para calendario
  const evaluacionesPorFecha = useMemo(() => {
    const grupos = {};
    evaluacionesFiltradas.forEach((e) => {
      const fecha = e.fecha;
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(e);
    });
    return grupos;
  }, [evaluacionesFiltradas]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">
          Dashboard de Evaluaciones
        </h1>
        <p className="text-gray-500">
          {evaluaciones.length} evaluaciones · {estadisticas.pendientes}{" "}
          pendientes
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6"
        >
          <FiBarChart2 className="text-white/60 mb-3" size={24} />
          <p className="text-3xl font-black text-white">{estadisticas.total}</p>
          <p className="text-sm text-white/80">Total evaluaciones</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6"
        >
          <FiCheckCircle className="text-green-400 mb-3" size={24} />
          <p className="text-3xl font-black text-white">
            {estadisticas.evaluadas}
          </p>
          <p className="text-sm text-gray-400">Evaluadas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6"
        >
          <FiClock className="text-yellow-400 mb-3" size={24} />
          <p className="text-3xl font-black text-white">
            {estadisticas.pendientes}
          </p>
          <p className="text-sm text-gray-400">Pendientes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-600/20 border border-purple-500/30 rounded-2xl p-6"
        >
          <FiAward className="text-purple-400 mb-3" size={24} />
          <p className="text-3xl font-black text-white">
            {Object.keys(estadisticas.porMateria).length}
          </p>
          <p className="text-sm text-gray-400">Materias</p>
        </motion.div>
      </div>

      {/* Tabs y filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {[
            { id: "calendario", icon: FiCalendar, label: "Calendario" },
            { id: "lista", icon: FiBarChart2, label: "Lista" },
            { id: "estadisticas", icon: FiPieChart, label: "Estadísticas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVista(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                vista === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-[#1e1e1e] text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
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

          {/* Orden */}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-[#1e1e1e] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/50"
          >
            <option value="fecha">Por fecha</option>
            <option value="materia">Por materia</option>
            <option value="tipo">Por tipo</option>
          </select>
        </div>
      </div>

      {/* Contenido según vista */}
      <AnimatePresence mode="wait">
        {/* VISTA CALENDARIO */}
        {vista === "calendario" && (
          <motion.div
            key="calendario"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Object.entries(evaluacionesPorFecha)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([fecha, items]) => (
                <div
                  key={fecha}
                  className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FiCalendar className="text-purple-400" />
                    <h3 className="font-bold text-white">
                      {new Date(fecha).toLocaleDateString("es-MX", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded-full">
                      {items.length} evaluación{items.length !== 1 ? "es" : ""}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {items.map((item) => {
                      const tipo =
                        TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                      return (
                        <div
                          key={item.id}
                          onClick={() =>
                            onMateriaClick?.(
                              materias.find((m) => m.id === item.materia_id),
                            )
                          }
                          className="flex items-center gap-4 p-3 bg-[#2a2a2a] rounded-xl hover:bg-[#333] cursor-pointer transition-all"
                        >
                          <div
                            className={`w-10 h-10 ${tipo.bg} rounded-xl flex items-center justify-center text-xl`}
                          >
                            {tipo.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white">
                              {item.nombre}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {item.materia_nombre} · {tipo.label} ·{" "}
                              {item.porcentaje}%
                            </p>
                          </div>
                          {item.calificacion ? (
                            <div className="text-right">
                              <p className="text-xl font-black text-white">
                                {item.calificacion}
                              </p>
                              <p className="text-[8px] text-gray-600">
                                Calificado
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                              Pendiente
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </motion.div>
        )}

        {/* VISTA LISTA */}
        {vista === "lista" && (
          <motion.div
            key="lista"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="grid grid-cols-12 gap-4 p-4 bg-[#2a2a2a] text-[10px] font-bold text-gray-500 uppercase">
              <div className="col-span-4">Nombre</div>
              <div className="col-span-2">Materia</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-1">%</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-1">Calif</div>
            </div>

            <div className="divide-y divide-white/5">
              {evaluacionesFiltradas.map((item) => {
                const tipo =
                  TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      onMateriaClick?.(
                        materias.find((m) => m.id === item.materia_id),
                      )
                    }
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors text-sm"
                  >
                    <div className="col-span-4 font-medium text-white">
                      {item.nombre}
                    </div>
                    <div className="col-span-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          color: item.materia_color,
                          backgroundColor: `${item.materia_color}20`,
                        }}
                      >
                        {item.materia_nombre}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs ${tipo.color}`}>
                        {tipo.label}
                      </span>
                    </div>
                    <div className="col-span-1 text-gray-400">
                      {item.porcentaje}%
                    </div>
                    <div className="col-span-2 text-gray-400">
                      {new Date(item.fecha).toLocaleDateString()}
                    </div>
                    <div className="col-span-1">
                      {item.calificacion ? (
                        <span className="font-bold text-white">
                          {item.calificacion}
                        </span>
                      ) : (
                        <span className="text-yellow-400">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VISTA ESTADÍSTICAS */}
        {vista === "estadisticas" && (
          <motion.div
            key="estadisticas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Por materia */}
            <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Por Materia</h3>
              <div className="space-y-4">
                {Object.values(estadisticas.porMateria).map((m) => (
                  <div key={m.materia}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="text-sm text-white">{m.materia}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {m.evaluadas}/{m.total} · Prom {m.promedio}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(m.evaluadas / m.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Por tipo */}
            <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Por Tipo</h3>
              <div className="space-y-4">
                {Object.entries(estadisticas.porTipo).map(([tipo, data]) => {
                  const tipoInfo =
                    TIPOS_EVALUACION[tipo] || TIPOS_EVALUACION.otro;
                  return (
                    <div key={tipo}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${tipoInfo.color}`}>
                          {tipoInfo.icon} {tipoInfo.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {data.evaluadas}/{data.total} evaluadas
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${(data.evaluadas / data.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Próximas evaluaciones */}
            <div className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FiAlertCircle />
                Próximas evaluaciones pendientes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {estadisticas.proximas.map((item) => {
                  const tipo =
                    TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                  const dias = Math.ceil(
                    (new Date(item.fecha) - new Date()) / (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div
                      key={item.id}
                      className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <p className="font-bold text-white">{item.nombre}</p>
                      <p className="text-xs text-white/80 mt-1">
                        {item.materia_nombre}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-white/60">
                          {tipo.icon} {tipo.label}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {dias === 0
                            ? "Hoy"
                            : dias === 1
                              ? "Mañana"
                              : `${dias} días`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardEvaluaciones;
