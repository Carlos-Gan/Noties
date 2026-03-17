import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTarget, FiArrowRight } from "react-icons/fi";

// Importar subcomponentes
import PredictorHeader from "../../widget/GradePredictor/PredictorHeader";
import PredictorKPIs from "../../widget/GradePredictor/PredictorKPIs";
import PredictorMateriaCard from "../../widget/GradePredictor/PredictorMateriaCard";
import PredictorDetalleMateria from "../../widget/GradePredictor/PredictorDetalleMateria";
import PredictorUnidades from "../../widget/GradePredictor/PredictorUnidades";
import PredictorSimulacion from "../../widget/GradePredictor/PredictorSimulacion";

const GradePredictorWidget = ({
  materias = [],
  onMateriaClick,
  onNavigateToDashboard,
}) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [selectedUnidad, setSelectedUnidad] = useState(null);
  const [simulacionData, setSimulacionData] = useState({});
  const [vista, setVista] = useState("general");

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
      let sumaPonderada = 0; // Esto será en escala 0-10

      evalsMateria.forEach((e) => {
        // Siempre sumamos el porcentaje (incluso si no tiene calificación)
        totalPorcentaje += e.porcentaje;

        // Solo sumamos a la ponderada si tiene calificación
        if (e.calificacion !== null && e.calificacion !== undefined) {
          // CORRECCIÓN: (calificación * porcentaje) / 100
          sumaPonderada += (e.calificacion * e.porcentaje) / 100;
        }
      });

      // El promedio actual considera SOLO las evaluaciones con calificación
      const porcentajeConCalificacion = evalsMateria
        .filter((e) => e.calificacion !== null)
        .reduce((sum, e) => sum + e.porcentaje, 0);

      const promedioActual =
        porcentajeConCalificacion > 0
          ? (sumaPonderada / porcentajeConCalificacion) * 100 // Escala 0-100, luego /10 para 0-10
          : 0;

      const porcentajeRestante = Math.max(0, 100 - totalPorcentaje);

      // Calcular diferentes escenarios (sobre 10)
      const escenarios = {
        pesimista: promedioActual / 10, // Si no hay restante, es el actual
        realista: promedioActual / 10,
        optimista: promedioActual / 10,
      };

      // Solo calcular escenarios si hay porcentaje restante
      if (porcentajeRestante > 0 && porcentajeConCalificacion > 0) {
        escenarios.pesimista =
          (sumaPonderada + (porcentajeRestante * 5) / 100) / 10;
        escenarios.realista =
          (sumaPonderada + (porcentajeRestante * 8) / 100) / 10;
        escenarios.optimista =
          (sumaPonderada + (porcentajeRestante * 10) / 100) / 10;
      } else if (porcentajeRestante > 0 && porcentajeConCalificacion === 0) {
        // Si no hay calificaciones, el promedio será el escenario
        escenarios.pesimista = (porcentajeRestante * 5) / 100 / 10;
        escenarios.realista = (porcentajeRestante * 8) / 100 / 10;
        escenarios.optimista = (porcentajeRestante * 10) / 100 / 10;
      }

      // Proyección final (similar a escenarios pero para el promedio final)
      const proyeccionFinal = {
        minimo: promedioActual / 10,
        esperado: promedioActual / 10,
        maximo: promedioActual / 10,
      };

      if (porcentajeRestante > 0) {
        const baseActual = sumaPonderada;
        proyeccionFinal.minimo =
          (baseActual + (porcentajeRestante * 5) / 100) / 10;
        proyeccionFinal.esperado =
          (baseActual + (porcentajeRestante * 8) / 100) / 10;
        proyeccionFinal.maximo =
          (baseActual + (porcentajeRestante * 10) / 100) / 10;
      }

      // Agrupar por unidad
      const porUnidad = {};
      evalsMateria.forEach((e) => {
        if (e.unidad) {
          if (!porUnidad[e.unidad]) {
            porUnidad[e.unidad] = {
              evaluaciones: [],
              totalPorcentaje: 0,
              sumaPonderada: 0,
              promedio: 0,
            };
          }
          porUnidad[e.unidad].evaluaciones.push(e);
          porUnidad[e.unidad].totalPorcentaje += e.porcentaje;
          if (e.calificacion !== null) {
            porUnidad[e.unidad].sumaPonderada +=
              (e.calificacion * e.porcentaje) / 100;
          }
        }
      });

      // Calcular promedios por unidad
      Object.keys(porUnidad).forEach((u) => {
        const unidad = porUnidad[u];
        const porcentajeConCalif = unidad.evaluaciones
          .filter((e) => e.calificacion !== null)
          .reduce((sum, e) => sum + e.porcentaje, 0);

        unidad.promedio =
          porcentajeConCalif > 0
            ? ((unidad.sumaPonderada / porcentajeConCalif) * 100) / 10
            : 0;
      });

      stats[materia.id] = {
        materia,
        evaluaciones: evalsMateria,
        porUnidad,
        totalEvals: evalsMateria.length,
        evaluadas: evalsMateria.filter((e) => e.calificacion !== null).length,
        pendientes: evalsMateria.filter((e) => e.calificacion === null).length,
        porcentajeCompletado: totalPorcentaje,
        promedioActual: (promedioActual / 10).toFixed(1),
        proyeccionFinal,
        escenarios,
        contribucion: evalsMateria.map((item) => ({
          ...item,
          contribucion: item.calificacion
            ? ((item.calificacion * item.porcentaje) / 100).toFixed(1)
            : 0,
        })),
      };
    });

    return stats;
  }, [evaluaciones, materias]);

  // Calcular estadísticas generales (CORREGIDO)
  const statsGenerales = useMemo(() => {
    const materiasConEvals = Object.values(statsPorMateria).filter(
      (s) => s.totalEvals > 0,
    );

    if (materiasConEvals.length === 0) {
      return {
        materiasConEvals: 0,
        promedioGeneral: "0.0",
        proyeccionGeneral: { minimo: 0, esperado: 0, maximo: 0 },
        materiasRiesgo: 0,
        materiasBien: 0,
        totalEvaluaciones: 0,
        evaluacionesPendientes: 0,
      };
    }

    const promedios = materiasConEvals.map((s) => parseFloat(s.promedioActual));
    const promedioGeneral =
      promedios.reduce((a, b) => a + b, 0) / promedios.length;

    // Calcular proyección general (CORREGIDO)
    let sumaMinimos = 0;
    let sumaEsperados = 0;
    let sumaMaximos = 0;

    materiasConEvals.forEach((s) => {
      sumaMinimos += s.proyeccionFinal.minimo;
      sumaEsperados += s.proyeccionFinal.esperado;
      sumaMaximos += s.proyeccionFinal.maximo;
    });

    const proyeccionGeneral = {
      minimo: sumaMinimos / materiasConEvals.length,
      esperado: sumaEsperados / materiasConEvals.length,
      maximo: sumaMaximos / materiasConEvals.length,
    };

    const materiasRiesgo = materiasConEvals.filter(
      (s) => parseFloat(s.promedioActual) < 7 && s.porcentajeCompletado > 50,
    ).length;

    const materiasBien = materiasConEvals.filter(
      (s) => parseFloat(s.promedioActual) >= 8,
    ).length;

    //console.log("Proyección general:", proyeccionGeneral);
    //console.log("Materias con eval:", materiasConEvals.length);

    return {
      materiasConEvals: materiasConEvals.length,
      promedioGeneral: promedioGeneral.toFixed(1),
      proyeccionGeneral,
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

  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  const handleSeleccionarUnidad = (materia, unidad) => {
    setSelectedMateria(materia);
    setSelectedUnidad(unidad);
    setVista("detalle");
  };

  const handleVolver = () => {
    if (selectedUnidad) {
      setSelectedUnidad(null);
    } else {
      setVista("general");
      setSelectedMateria(null);
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 relative"
    >
      <PredictorHeader
        vista={vista}
        setVista={(newVista) => {
          setVista(newVista);
          if (newVista !== "detalle") setSelectedMateria(null);
          if (newVista !== "unidades") setSelectedUnidad(null);
        }}
        onNavigateToDashboard={onNavigateToDashboard}
      />

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
            <PredictorKPIs statsGenerales={statsGenerales} />

            {/* Proyección General */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">
                Proyección Final General
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-white/70">Mínimo</p>
                  <p className="text-2xl font-black text-white">
                    {(statsGenerales.proyeccionGeneral?.minimo * 10).toFixed(2)}
                  </p>
                </div>
                <div className="text-center border-x border-white/20">
                  <p className="text-xs text-white/70">Esperado</p>
                  <p className="text-2xl font-black text-white">
                    {(statsGenerales.proyeccionGeneral?.esperado * 10).toFixed(
                      2,
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/70">Máximo</p>
                  <p className="text-2xl font-black text-white">
                    {(statsGenerales.proyeccionGeneral?.maximo * 10).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de materias */}
            <div className="space-y-3">
              {materias.map((materia) => {
                const stats = statsPorMateria[materia.id];
                if (!stats || stats.totalEvals === 0) return null;

                return (
                  <PredictorMateriaCard
                    key={materia.id}
                    materia={materia}
                    stats={stats}
                    onClick={() => {
                      setSelectedMateria(materia);
                      setVista("detalle");
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VISTA UNIDADES */}
        {vista === "unidades" && (
          <motion.div
            key="unidades"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PredictorUnidades
              materias={materias}
              statsPorMateria={statsPorMateria}
              onSeleccionarUnidad={handleSeleccionarUnidad}
            />
          </motion.div>
        )}

        {/* VISTA DETALLE */}
        {vista === "detalle" &&
          selectedMateria &&
          statsPorMateria[selectedMateria.id] && (
            <motion.div
              key="detalle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PredictorDetalleMateria
                materia={selectedMateria}
                stats={statsPorMateria[selectedMateria.id]}
                selectedUnidad={selectedUnidad}
                onVolver={handleVolver}
                onMateriaClick={onMateriaClick}
              />
            </motion.div>
          )}

        {/* VISTA SIMULACIÓN */}
        {vista === "simulacion" && (
          <motion.div
            key="simulacion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PredictorSimulacion
              materias={materias}
              statsPorMateria={statsPorMateria}
              simulacionData={simulacionData}
              onSimulacionChange={handleSimulacion}
              calcularSimulacion={calcularSimulacion}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onNavigateToDashboard?.("evaluaciones")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-400 transition-all group"
        >
          <FiTarget size={14} />
          <span>Gestionar evaluaciones</span>
          <FiArrowRight
            className="group-hover:translate-x-1 transition-transform"
            size={14}
          />
        </button>
      </div>
    </div>
  );
};

export default GradePredictorWidget;
