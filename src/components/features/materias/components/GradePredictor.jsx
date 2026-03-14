import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
  FiPieChart,
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

const GradePredictorWidget = ({ materias = [], onMateriaClick, onNavigateToDashboard }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [modoSimulacion, setModoSimulacion] = useState(false);
  const [simulacionData, setSimulacionData] = useState({});
  const [vista, setVista] = useState("general"); // general, detalle, simulacion

  // Cargar todas las evaluaciones
  useEffect(() => {
    const cargarEvaluaciones = async () => {
      const data = await window.electronAPI.evaluaciones.getAll();
      setEvaluaciones(data);
    };
    cargarEvaluaciones();
  }, []);

  // Escuchar actualizaciones
  useEffect(() => {
    const handleUpdate = () => {
      window.electronAPI.evaluaciones.getAll().then(setEvaluaciones);
    };
    window.addEventListener("evaluaciones-updated", handleUpdate);
    return () =>
      window.removeEventListener("evaluaciones-updated", handleUpdate);
  }, []);

  // Calcular estadísticas por materia
  const statsPorMateria = useMemo(() => {
    const stats = {};

    materias.forEach((materia) => {
      const evalsMateria = evaluaciones.filter(
        (e) => e.materia_id === materia.id,
      );

      let totalPorcentaje = 0;
      let sumaPonderada = 0;
      let proyectado = 0;

      evalsMateria.forEach((e) => {
        if (e.calificacion !== null && e.calificacion !== undefined) {
          totalPorcentaje += e.porcentaje;
          sumaPonderada += (e.calificacion / 10) * e.porcentaje;
        }
      });

      const promedioActual =
        totalPorcentaje > 0 ? (sumaPonderada / totalPorcentaje) * 10 : 0;
      const porcentajeRestante = 100 - totalPorcentaje;

      // Calcular diferentes escenarios
      const escenarios = {
        pesimista:
          porcentajeRestante > 0
            ? (sumaPonderada + porcentajeRestante * 6) / 100
            : promedioActual, // Asume 6 en lo que falta
        realista:
          porcentajeRestante > 0
            ? (sumaPonderada + porcentajeRestante * 8) / 100
            : promedioActual, // Asume 8 en lo que falta
        optimista:
          porcentajeRestante > 0
            ? (sumaPonderada + porcentajeRestante * 10) / 100
            : promedioActual, // Asume 10 en lo que falta
      };

      stats[materia.id] = {
        materia,
        evaluaciones: evalsMateria,
        totalEvals: evalsMateria.length,
        evaluadas: evalsMateria.filter((e) => e.calificacion !== null).length,
        pendientes: evalsMateria.filter((e) => e.calificacion === null).length,
        porcentajeCompletado: totalPorcentaje,
        promedioActual: promedioActual.toFixed(1),
        escenarios,
        contribucion: evalsMateria.map((item) => ({
          ...item,
          contribucion: item.calificacion
            ? ((item.calificacion / 10) * item.porcentaje).toFixed(1)
            : 0,
        })),
      };
    });

    return stats;
  }, [evaluaciones, materias]);

  // Calcular estadísticas generales
  const statsGenerales = useMemo(() => {
    const materiasConEvals = Object.values(statsPorMateria).filter(
      (s) => s.totalEvals > 0,
    );

    const promedios = materiasConEvals.map((s) => parseFloat(s.promedioActual));
    const promedioGeneral =
      promedios.length > 0
        ? (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1)
        : 0;

    const materiasRiesgo = materiasConEvals.filter(
      (s) => parseFloat(s.promedioActual) < 7 && s.porcentajeCompletado > 50,
    ).length;

    const materiasBien = materiasConEvals.filter(
      (s) => parseFloat(s.promedioActual) >= 8,
    ).length;

    return {
      materiasConEvals: materiasConEvals.length,
      promedioGeneral,
      materiasRiesgo,
      materiasBien,
      totalEvaluaciones: evaluaciones.length,
      evaluacionesPendientes: evaluaciones.filter(
        (e) => e.calificacion === null,
      ).length,
    };
  }, [statsPorMateria, evaluaciones]);

  // Manejar simulación
  const handleSimulacion = (materiaId, tipo, valor) => {
    setSimulacionData((prev) => ({
      ...prev,
      [materiaId]: {
        ...prev[materiaId],
        [tipo]: valor,
      },
    }));
  };

  const calcularSimulacion = (materiaId) => {
    const stats = statsPorMateria[materiaId];
    if (!stats) return null;

    const simulacion = simulacionData[materiaId] || {};
    let sumaPonderada = 0;
    let totalPorcentaje = 0;

    // Usar calificaciones reales donde existan
    stats.evaluaciones.forEach((item) => {
      if (item.calificacion !== null) {
        sumaPonderada += (item.calificacion / 10) * item.porcentaje;
        totalPorcentaje += item.porcentaje;
      }
    });

    // Agregar simulaciones
    Object.entries(simulacion).forEach(([tipo, valor]) => {
      const itemPendiente = stats.evaluaciones.find(
        (item) => item.tipo === tipo && item.calificacion === null,
      );
      if (itemPendiente) {
        sumaPonderada += (valor / 10) * itemPendiente.porcentaje;
        totalPorcentaje += itemPendiente.porcentaje;
      }
    });

    return totalPorcentaje > 0 ? (sumaPonderada / totalPorcentaje) * 10 : 0;
  };

  const materiaDetalle = selectedMateria
    ? statsPorMateria[selectedMateria.id]
    : null;

  return (
    <div 
    onClick={()=> onNavigateToDashboard?.("evaluaciones")}
    className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-6">
      {/* Header con tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-purple-400" size={20} />
          <h2 className="text-lg font-bold text-white">Grade Predictor</h2>
        </div>

        <div className="flex gap-2">
          {[
            { id: "general", icon: FiPieChart, label: "General" },
            { id: "detalle", icon: FiBarChart2, label: "Detalle" },
            { id: "simulacion", icon: FiTarget, label: "Simular" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVista(tab.id)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                vista === tab.id
                  ? "text-white bg-purple-600"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* VISTA GENERAL */}
        {vista === "general" && (
          <motion.div
            key="general"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* KPIs Generales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-2xl font-black text-white">
                  {statsGenerales.promedioGeneral}
                </p>
                <p className="text-[9px] text-gray-600 mt-1">
                  Promedio General
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-2xl font-black text-white">
                  {statsGenerales.materiasBien}
                </p>
                <p className="text-[9px] text-gray-600 mt-1">Materias bien</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-2xl font-black text-white">
                  {statsGenerales.materiasRiesgo}
                </p>
                <p className="text-[9px] text-gray-600 mt-1">En riesgo</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-2xl font-black text-white">
                  {statsGenerales.evaluacionesPendientes}
                </p>
                <p className="text-[9px] text-gray-600 mt-1">Por calificar</p>
              </div>
            </div>

            {/* Lista de materias con progreso */}
            <div className="space-y-3">
              {materias.map((materia) => {
                const stats = statsPorMateria[materia.id];
                if (!stats || stats.totalEvals === 0) return null;

                const promedio = parseFloat(stats.promedioActual);
                const colorPromedio =
                  promedio >= 8
                    ? "text-green-400"
                    : promedio >= 7
                      ? "text-yellow-400"
                      : "text-red-400";

                return (
                  <motion.div
                    key={materia.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedMateria(materia);
                      setVista("detalle");
                    }}
                    className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: materia.color }}
                        />
                        <span className="font-bold text-white">
                          {materia.nombre}
                        </span>
                      </div>
                      <span className={`text-lg font-black ${colorPromedio}`}>
                        {stats.promedioActual}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 mb-2">
                      <span>{stats.evaluadas} evaluadas</span>
                      <span>{stats.pendientes} pendientes</span>
                      <span>{stats.porcentajeCompletado}% completo</span>
                    </div>

                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.porcentajeCompletado}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>

                    {/* Mini escenarios */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-[8px]">
                      <div className="text-center">
                        <span className="text-red-400">
                          🐻 {stats.escenarios.pesimista.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-yellow-400">
                          😐 {stats.escenarios.realista.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-green-400">
                          🚀 {stats.escenarios.optimista.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VISTA DETALLE */}
        {vista === "detalle" && selectedMateria && materiaDetalle && (
          <motion.div
            key="detalle"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header de la materia */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setVista("general")}
                className="text-xs text-gray-600 hover:text-white"
              >
                ← Volver
              </button>
              <button
                onClick={() => onMateriaClick?.(selectedMateria)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Ver materia →
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${selectedMateria.color}20` }}
              >
                {selectedMateria.icono || "📚"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedMateria.nombre}
                </h3>
                <p className="text-xs text-gray-500">
                  Prof. {selectedMateria.profesor || "No asignado"}
                </p>
              </div>
            </div>

            {/* Escenarios */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Pesimista",
                  value: materiaDetalle.escenarios.pesimista,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
                {
                  label: "Realista",
                  value: materiaDetalle.escenarios.realista,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                },
                {
                  label: "Optimista",
                  value: materiaDetalle.escenarios.optimista,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                },
              ].map((esc) => (
                <div
                  key={esc.label}
                  className={`${esc.bg} rounded-xl p-4 text-center`}
                >
                  <p className={`text-2xl font-black ${esc.color}`}>
                    {esc.value.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-gray-600 mt-1">{esc.label}</p>
                </div>
              ))}
            </div>

            {/* Lista detallada de evaluaciones */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500">Evaluaciones</p>
              {materiaDetalle.contribucion.map((item) => {
                const tipo =
                  TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                return (
                  <div key={item.id} className="bg-[#1e1e1e] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={tipo.color}>{tipo.icon}</span>
                        <span className="text-sm font-bold text-white">
                          {item.nombre}
                        </span>
                      </div>
                      {item.calificacion ? (
                        <span className="text-lg font-black text-white">
                          {item.calificacion}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">Pendiente</span>
                      )}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-600 mb-1">
                      <span>
                        {tipo.label} · {item.porcentaje}%
                      </span>
                      {item.calificacion && (
                        <span>Aporta {item.contribucion} pts</span>
                      )}
                    </div>
                    {item.calificacion && (
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(item.calificacion / 10) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VISTA SIMULACIÓN */}
        {vista === "simulacion" && (
          <motion.div
            key="simulacion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <p className="text-xs text-gray-500 mb-4">
              Simula diferentes escenarios ajustando las calificaciones
              pendientes
            </p>

            {materias.map((materia) => {
              const stats = statsPorMateria[materia.id];
              if (!stats || stats.pendientes === 0) return null;

              const resultadoSimulacion = calcularSimulacion(materia.id);
              const original = parseFloat(stats.promedioActual);

              return (
                <div
                  key={materia.id}
                  className="bg-[#1e1e1e] rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: materia.color }}
                      />
                      <span className="font-bold text-white">
                        {materia.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        Actual: {original}
                      </span>
                      {resultadoSimulacion && (
                        <span className="text-sm font-bold text-purple-400">
                          → {resultadoSimulacion.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stats.evaluaciones
                      .filter((item) => item.calificacion === null)
                      .map((item) => {
                        const tipo =
                          TIPOS_EVALUACION[item.tipo] || TIPOS_EVALUACION.otro;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            <span className={`text-[10px] ${tipo.color} w-16`}>
                              {tipo.label}
                            </span>
                            <span className="text-[10px] text-gray-600 w-12">
                              {item.porcentaje}%
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={
                                simulacionData[materia.id]?.[item.tipo] || 8
                              }
                              onChange={(e) =>
                                handleSimulacion(
                                  materia.id,
                                  item.tipo,
                                  parseFloat(e.target.value),
                                )
                              }
                              className="flex-1 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                            />
                            <span className="text-xs font-bold text-white w-8">
                              {simulacionData[materia.id]?.[item.tipo] || 8}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}

            {materias.every((m) => !statsPorMateria[m.id]?.pendientes) && (
              <div className="text-center py-8 text-gray-600">
                <p className="text-2xl mb-2">🎯</p>
                <p className="text-sm">
                  No hay evaluaciones pendientes para simular
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GradePredictorWidget;