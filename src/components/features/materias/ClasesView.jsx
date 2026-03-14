import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBook,
  FiFileText,
  FiFolder,
  FiSearch,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";
import SeccionProyectos from "../proyectos/SeccionProyectos";
import MateriaCard from "./components/CardMateria";
import GradePredictorWidget from "../materias/components/GradePredictor";
import ProximaClaseWidget from "../../widget/ProximaClaseWidget";
import StudyStreakWidget from "../../widget/StudyStreakWidget";

const ClasesAgregadasView = ({
  materias = [],
  resumen = { notas: [], proyectos: [] },
  tareasPorMateria = {},
  proyectosPorMateria = {},
  horariosPorMateria = {}, // Para el widget de próxima clase
  onMateriaClick,
}) => {
  const [vistaActiva, setVistaActiva] = useState("dashboard"); // dashboard, clases, notas, proyectos, evaluaciones
  const [busqueda, setBusqueda] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("Todas");

  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (isNaN(d)) return "Sin fecha";

    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (d.toDateString() === hoy.toDateString()) {
      return `Hoy, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    if (d.toDateString() === ayer.toDateString()) {
      return "Ayer";
    }

    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  };

  // Filtrar materias por búsqueda
  const materiasFiltradas = useMemo(() => {
    if (!busqueda) return materias;
    return materias.filter(
      (m) =>
        m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.profesor?.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [materias, busqueda]);

  // Filtrar notas por búsqueda
  const notasFiltradas = useMemo(() => {
    if (!busqueda) return resumen.notas;
    return resumen.notas.filter(
      (nota) =>
        nota.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        nota.materia_nombre?.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [resumen.notas, busqueda]);

  const handleNotaClick = (nota) => {
    const materiaCompleta = materias.find((m) => m.id === nota.materia_id);
    if (materiaCompleta) {
      onMateriaClick?.(materiaCompleta);
    }
  };

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiTrendingUp,
      count: null,
      color: "text-purple-400",
    },
    {
      id: "clases",
      label: "Clases",
      icon: FiBook,
      count: materias.length,
      color: "text-blue-400",
    },
    {
      id: "notas",
      label: "Notas",
      icon: FiFileText,
      count: resumen.notas.length,
      color: "text-green-400",
    },
    {
      id: "proyectos",
      label: "Proyectos",
      icon: FiFolder,
      count: resumen.proyectos.length,
      color: "text-purple-400",
    },
    {
      id: "evaluaciones",
      label: "Calificaciones",
      icon: FiPieChart,
      count: null,
      color: "text-orange-400",
    },
  ];

  const handleNavigateToDashboard = (dashboardType) => {
    // Navegar al dashboard de evaluaciones
    // Esto depende de cómo manejes la navegación en tu app
    if (dashboardType === "evaluaciones") {
      setVistaActiva("evaluaciones"); // Si usas tabs internos
      // O si tienes un sistema de navegación global:
      // navigateTo('dashboard-evaluaciones');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto w-full"
    >
      {/* Header con título y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Panel de Control</h1>
          <p className="text-sm text-gray-500 mt-1">
            {materias.length} materias · {resumen.notas.length} notas ·{" "}
            {
              Object.values(tareasPorMateria)
                .flat()
                .filter((t) => !t.completada).length
            }{" "}
            tareas pendientes
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative w-full md:w-64">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            size={14}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                vistaActiva === tab.id
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {vistaActiva === tab.id && (
                <motion.div
                  layoutId="activeTabClases"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon
                  className={vistaActiva === tab.id ? tab.color : ""}
                  size={14}
                />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      vistaActiva === tab.id
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido según pestaña */}
      <AnimatePresence mode="wait">
        {/* DASHBOARD PRINCIPAL con widgets */}
        {vistaActiva === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Grid de widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Widget 1: Próxima Clase */}
              <div className="lg:col-span-2">
                <ProximaClaseWidget
                  materias={materias}
                  horariosPorMateria={horariosPorMateria}
                />
              </div>

              {/* Widget 2: Racha de Estudio */}
              <div>
                <StudyStreakWidget
                  resumen={resumen}
                  tareasPorMateria={tareasPorMateria}
                  proyectosPorMateria={proyectosPorMateria}
                />
              </div>
            </div>

            {/* Widget 3: Grade Predictor */}
            <div className="mt-6">
              <GradePredictorWidget
                materias={materias}
                onMateriaClick={onMateriaClick}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </div>

            {/* Mini lista de materias recientes */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FiBook className="text-blue-400" />
                Tus materias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materias.slice(0, 3).map((materia) => (
                  <div
                    key={materia.id}
                    onClick={() => onMateriaClick?.(materia)}
                    className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${materia.color}20` }}
                      >
                        {materia.icono || "📚"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">
                          {materia.nombre}
                        </h3>
                        <p className="text-[10px] text-gray-600">
                          Prof. {materia.profesor || "No asignado"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {materias.length > 3 && (
                <button
                  onClick={() => setVistaActiva("clases")}
                  className="mt-4 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Ver todas las materias →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* VISTA CLASES (existente) */}
        {vistaActiva === "clases" && (
          <motion.div
            key="clases"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {materiasFiltradas.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <p className="text-5xl mb-4 opacity-20">📚</p>
                <p className="text-lg font-medium">No hay materias</p>
                <p className="text-sm mt-2">
                  Agrega tu primera materia para comenzar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {materiasFiltradas.map((materia) => (
                  <div
                    key={materia.id}
                    onClick={() => onMateriaClick?.(materia)}
                    className="cursor-pointer"
                  >
                    <MateriaCard
                      materia={materia}
                      tareasPendientes={
                        tareasPorMateria[materia.id]?.filter(
                          (t) => !t.completada,
                        ) || []
                      }
                      proyectosPendientes={
                        proyectosPorMateria[materia.id] || []
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* VISTA NOTAS (existente) */}
        {vistaActiva === "notas" && (
          <motion.div
            key="notas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">Notas recientes</h2>
                <span className="text-[10px] text-gray-600">
                  {notasFiltradas.length} de {resumen.notas.length}
                </span>
              </div>

              {notasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-4xl mb-3 opacity-20">📭</p>
                  <p className="text-sm">No hay notas que coincidan</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notasFiltradas.map((nota, index) => (
                    <motion.div
                      key={nota.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleNotaClick(nota)}
                      className="grid grid-cols-12 px-4 py-3 rounded-xl hover:bg-white/[0.02] cursor-pointer group border-b border-white/[0.01] transition-colors"
                    >
                      <div className="col-span-7 text-sm text-gray-300 group-hover:text-white font-medium flex items-center gap-3">
                        <span className="opacity-30 group-hover:opacity-100 transition-opacity">
                          📝
                        </span>
                        <span className="truncate">
                          {nota.titulo || "Sin título"}
                        </span>
                      </div>
                      <div className="col-span-5 text-right text-[11px] text-gray-500 font-bold self-center uppercase tracking-tighter">
                        <span className="text-blue-500/50 group-hover:text-blue-500 transition-colors">
                          {nota.materia_nombre}
                        </span>
                        <span className="mx-2 text-white/5">•</span>
                        {formatFecha(nota.updated_at)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VISTA PROYECTOS (existente) */}
        {vistaActiva === "proyectos" && (
          <motion.div
            key="proyectos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SeccionProyectos
              proyectos={resumen.proyectos}
              materias={materias}
              filtroMateria={filtroMateria}
              setFiltroMateria={setFiltroMateria}
            />
          </motion.div>
        )}

        {/* VISTA EVALUACIONES */}
        {vistaActiva === "evaluaciones" && (
          <motion.div
            key="evaluaciones"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GradePredictorWidget
              materias={materias}
              onMateriaClick={onMateriaClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separador visual cuando hay búsqueda activa */}
      {busqueda && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <button
            onClick={() => setBusqueda("")}
            className="text-[10px] text-gray-600 hover:text-white transition-colors"
          >
            Limpiar búsqueda ✕
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClasesAgregadasView;
