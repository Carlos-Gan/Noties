import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarMateria from "./SiderbarMateria";
import SeccionTareas from "../tareas/SeccionTareas";
import SeccionProyectos from "./SeccionProyectos";
import MateriaStats from "./components/MateriaStats";
import MateriaEmptyState from "./components/MateriaEmptyState";

const MateriaDashboard = ({
  materia,
  onVolver,
  onVerApuntes,

  onNuevaTarea,
  onNuevoProyecto,
}) => {
  const [stats, setStats] = useState({
    apuntes: 0,
    tareasPendientes: 0,
    tareasCompletadas: 0,
    proyectos: 0,
    proyectosCompletados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("tareas");
  const [refreshing, setRefreshing] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  // Función para recargar SOLO las estadísticas (más rápida)
  const recargarStats = useCallback(async () => {
    if (!materia?.id) return;

    try {
      const [apuntes, tareasData, proyectosData] = await Promise.all([
        window.electronAPI.invoke("apuntes:getByMateria", materia.id),
        window.electronAPI.invoke("tareas:getByMateria", materia.id),
        window.electronAPI.invoke("proyectos:getByMateria", materia.id),
      ]);

      setTareas(tareasData);
      setProyectos(proyectosData);

      setStats({
        apuntes: apuntes.length,
        tareasPendientes: tareasData.filter((t) => !t.completada).length,
        tareasCompletadas: tareasData.filter((t) => t.completada).length,
        proyectos: proyectosData.length,
        proyectosCompletados: proyectosData.filter(
          (p) => p.estado === "entregado",
        ).length,
      });
    } catch (error) {
      console.error("Error recargando stats:", error);
    }
  }, [materia?.id]);

  // Función para recargar todo (con indicador visual)
  const cargarDatos = useCallback(
    async (showRefreshing = false) => {
      if (!materia?.id) return;

      try {
        if (showRefreshing) setRefreshing(true);
        await recargarStats();
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
        if (showRefreshing) setRefreshing(false);
      }
    },
    [recargarStats, materia?.id],
  );

  // Carga inicial
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Escuchar TODOS los eventos que puedan afectar a esta materia
  useEffect(() => {
    const handleUpdate = (e) => {
      // Determinar si la actualización afecta a esta materia
      const materiaId = e.detail?.materiaId || e.detail?.materia_id;

      if (!materiaId || materiaId === materia.id) {
        // Recargar stats sin mostrar el indicador de refreshing para que sea instantáneo
        recargarStats();
      }
    };

    // Eventos específicos
    window.addEventListener("tarea-actualizada", handleUpdate);
    window.addEventListener("tareas-updated", handleUpdate);
    window.addEventListener("proyectos-updated", handleUpdate);
    window.addEventListener("notas-updated", handleUpdate);

    // Evento genérico por si acaso
    window.addEventListener("materias-updated", handleUpdate);

    return () => {
      window.removeEventListener("tarea-actualizada", handleUpdate);
      window.removeEventListener("tareas-updated", handleUpdate);
      window.removeEventListener("proyectos-updated", handleUpdate);
      window.removeEventListener("notas-updated", handleUpdate);
      window.removeEventListener("materias-updated", handleUpdate);
    };
  }, [materia.id, recargarStats]);

  // Calcular progreso total de ESTA materia
  const progresoTotal = useMemo(() => {
    const totalTareas = stats.tareasPendientes + stats.tareasCompletadas;
    const totalProyectos = stats.proyectos;
    const totalItems = totalTareas + totalProyectos + stats.apuntes;

    if (totalItems === 0) return 0;

    const completados = stats.tareasCompletadas + stats.proyectosCompletados;
    return Math.round((completados / totalItems) * 100);
  }, [stats]);

  // Verificar si hay contenido en ESTA materia
  const tieneContenido = useMemo(() => {
    return (
      stats.apuntes > 0 ||
      stats.tareasPendientes > 0 ||
      stats.tareasCompletadas > 0 ||
      stats.proyectos > 0
    );
  }, [stats]);

  // Tabs de navegación
  const tabs = [
    { id: "tareas", label: "Tareas", icon: "✓", count: stats.tareasPendientes },
    { id: "proyectos", label: "Proyectos", icon: "📊", count: stats.proyectos },
  ];

  if (!materia) return null;

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white">
      <SidebarMateria
        materia={materia}
        stats={stats}
        onVerApuntes={onVerApuntes}
      />

      <div className="flex-1 overflow-y-auto relative">
        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/5">
          <div className="px-10 pt-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onVolver}
                className="group flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform">
                  ←
                </span>
                <span>Dashboard</span>
              </button>

              {/* Indicador de progreso de ESTA materia */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      key={progresoTotal} // Forzar animación cuando cambia
                      initial={{ width: 0 }}
                      animate={{ width: `${progresoTotal}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: materia.color }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {progresoTotal}% completo
                  </span>
                </div>

                {refreshing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                  />
                )}
              </div>
            </div>

            {/* Info rápida de la materia */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${materia.color}20` }}
              >
                {materia.icono || "📚"}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{materia.nombre}</p>
                <p className="text-[10px] text-gray-500">
                  Prof. {materia.profesor || "No asignado"}
                </p>
              </div>
            </div>

            {/* Tabs de navegación */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeSection === tab.id
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {activeSection === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {tab.icon} {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          activeSection === tab.id
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-10 py-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : !tieneContenido ? (
              <MateriaEmptyState
                materia={materia}
                onCrearApunte={onVerApuntes}
                onCrearTarea={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-creator", {
                      detail: { type: "tarea", materiaId: materia.id },
                    }),
                  );
                }}
                onCrearProyecto={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-creator", {
                      detail: { type: "proyecto", materiaId: materia.id },
                    }),
                  );
                }}
              />
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-10 max-w-4xl"
              >
                {/* Stats de ESTA materia */}
                <MateriaStats stats={stats} />

                {/* Sección activa */}
                {activeSection === "tareas" ? (
                  <SeccionTareas
                    materia={materia}
                    materias={[materia]}
                    onUpdate={recargarStats} // Usar recargarStats en lugar de cargarDatos
                  />
                ) : (
                  <SeccionProyectos
                    materia={materia}
                    onUpdate={() => recargarStats()} // Usar recargarStats en lugar de cargarDatos
                  />
                )}

                {/* Resumen rápido de ESTA materia */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                  <div className="bg-white/[0.02] rounded-2xl p-4">
                    <p className="text-2xl font-black text-white">
                      {stats.apuntes}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">
                      Apuntes
                    </p>
                  </div>
                  <div className="bg-white/[0.02] rounded-2xl p-4">
                    <p className="text-2xl font-black text-white">
                      {stats.tareasCompletadas}/
                      {stats.tareasPendientes + stats.tareasCompletadas}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">
                      Tareas completadas
                    </p>
                  </div>
                  <div className="bg-white/[0.02] rounded-2xl p-4">
                    <p className="text-2xl font-black text-white">
                      {stats.proyectos}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">
                      Proyectos
                    </p>
                  </div>
                </div>

                {/* Botón rápido para nueva tarea/proyecto */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open-creator", {
                          detail: {
                            type: activeSection,
                            materiaId: materia.id,
                          },
                        }),
                      );
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                  >
                    <span className="text-lg text-gray-600 group-hover:text-white">
                      +
                    </span>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-white">
                      Nueva {activeSection === "tareas" ? "tarea" : "proyecto"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MateriaDashboard;
