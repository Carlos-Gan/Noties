import { useState } from "react";
import { motion } from "framer-motion";
import SeccionProyectos from "../proyectos/SeccionProyectos";
import MateriaList from "./MateriaList";
import { FiBook, FiFileText, FiFolder, FiPieChart } from "react-icons/fi";
import DashboardEvaluaciones from "../../dashboard/DashboardEvaluaciones";

const ClasesAgregadasView = ({
  materias = [],
  resumen = { notas: [], proyectos: [] },
  tareasPorMateria = {},
  proyectosPorMateria = {},
  configSecciones,
  onMateriaClick,
}) => {
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [vistaActiva, setVistaActiva] = useState("materias"); // materias, notas, proyectos

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
      year: d.getFullYear() !== hoy.getFullYear() ? "numeric" : undefined,
    });
  };

  const handleNotaClick = (nota) => {
    const materiaCompleta = materias.find((m) => m.id === nota.materia_id);
    if (materiaCompleta) {
      onMateriaClick?.(materiaCompleta);
    }
  };

  const tabs = [
    { id: "materias", label: "Materias", icon: FiBook, count: materias.length },
    {
      id: "notas",
      label: "Notas recientes",
      icon: FiFileText,
      count: resumen.notas.length,
    },
    {
      id: "proyectos",
      label: "Proyectos",
      icon: FiFolder,
      count: resumen.proyectos.length,
    },
    {
      id: "evaluaciones",
      label: "Calificaciones",
      icon: FiPieChart,
      count: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 max-w-7xl mx-auto w-full"
    >
      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-8 border-b border-white/5 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
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
                <Icon size={14} />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      vistaActiva === tab.id
                        ? "bg-blue-500/20 text-blue-400"
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
        {vistaActiva === "materias" && (
          <motion.div
            key="materias"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MateriaList
              materias={materias}
              tareasPorMateria={tareasPorMateria}
              proyectosPorMateria={proyectosPorMateria}
              configSecciones={configSecciones}
              onMateriaClick={onMateriaClick}
            />
          </motion.div>
        )}

        {vistaActiva === "notas" && (
          <motion.div
            key="notas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-6">
              <h2 className="text-sm font-bold mb-4 flex items-center justify-between">
                <span>Notas recientes</span>
                <span className="text-[10px] text-gray-600">
                  {resumen.notas.length} total
                </span>
              </h2>
              <div className="space-y-1">
                {resumen.notas.map((nota, index) => (
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
                      {nota.titulo || "Sin título"}
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
                {resumen.notas.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <p className="text-4xl mb-3 opacity-20">📭</p>
                    <p className="text-sm">No hay apuntes aún</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

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

        {/* Evaluaciones */}
        {vistaActiva == "evaluaciones" && (
          <motion.div
            key="evaluaciones"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DashboardEvaluaciones
              materias={materias}
              onMateriaClick={onMateriaClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClasesAgregadasView;
