import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import ModalNuevaEvaluacion from "../../Modals/ModalNuevaEvaluacion";

// Importar subcomponentes
import EvaluacionHeader from "../evaluaciones/EvaluacionHeader";
import EvaluacionKPIs from "../evaluaciones/EvaluacionKPIs";
import EvaluacionFiltros from "../evaluaciones/EvaluacionFiltros";
import EvaluacionAlertas from "../evaluaciones/EvaluacionAlertas";
import VistaLista from "../evaluaciones/VistaLista";
import VistaCalendario from "../evaluaciones/VistaCalendario";
import VistaEstadisticas from "../evaluaciones/VistaEstadisticas";
import EvaluacionMenuContextual from "../evaluaciones/EvaluacionMenuContextual";

const DashboardEvaluaciones = ({ materias = [], onMateriaClick }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [vista, setVista] = useState("lista");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroUnidad, setFiltroUnidad] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("fecha");
  const [modalOpen, setModalOpen] = useState(false);
  const [evaluacionAEditar, setEvaluacionAEditar] = useState(null);
  const [menuContextual, setMenuContextual] = useState(null);
  const [errorPorcentaje, setErrorPorcentaje] = useState(null);
  const [alertasUnidad, setAlertasUnidad] = useState({});

  // Cargar evaluaciones
  const cargarEvaluaciones = async () => {
    try {
      const data = await window.electronAPI.evaluaciones.getAll();
      setEvaluaciones(data);
    } catch (error) {
      console.error("Error cargando evaluaciones:", error);
    }
  };

  useEffect(() => {
    cargarEvaluaciones();
    const handleUpdate = () => cargarEvaluaciones();
    window.addEventListener("evaluaciones-updated", handleUpdate);
    return () =>
      window.removeEventListener("evaluaciones-updated", handleUpdate);
  }, []);

  // Verificar porcentajes por materia y unidad
  const verificarPorcentajes = useMemo(() => {
    const alertas = {};

    // SOLO verificar por unidad (cada unidad es independiente)
    const evaluacionesPorUnidad = {};
    evaluaciones.forEach((e) => {
      if (e.unidad) {
        const key = `${e.materia_id}-${e.unidad}`;
        if (!evaluacionesPorUnidad[key]) {
          evaluacionesPorUnidad[key] = {
            materia: e.materia_nombre,
            unidad: e.unidad,
            color: e.materia_color,
            total: 0,
            items: [],
          };
        }
        evaluacionesPorUnidad[key].total += e.porcentaje;
        evaluacionesPorUnidad[key].items.push(e);
      }
    });

    // Verificar excesos por unidad (cada unidad máximo 100%)
    Object.values(evaluacionesPorUnidad).forEach((u) => {
      if (u.total > 100) {
        alertas[`unidad-${u.materia}-${u.unidad}`] = {
          tipo: "unidad",
          materia: u.materia,
          unidad: u.unidad,
          total: u.total,
          exceso: u.total - 100,
          items: u.items,
        };
      }
    });

    return alertas;
  }, [evaluaciones]);

  // Obtener unidades únicas para el filtro
  const unidadesUnicas = useMemo(() => {
    const unidades = new Set();
    evaluaciones.forEach((e) => {
      if (e.unidad) unidades.add(e.unidad);
    });
    return ["todas", ...Array.from(unidades).sort()];
  }, [evaluaciones]);

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
        if (filtroUnidad !== "todas" && e.unidad !== filtroUnidad) return false;
        if (busqueda) {
          const searchTerm = busqueda.toLowerCase();
          return (
            e.nombre.toLowerCase().includes(searchTerm) ||
            e.materia_nombre?.toLowerCase().includes(searchTerm) ||
            (e.unidad && e.unidad.toLowerCase().includes(searchTerm))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (orden === "fecha") return new Date(b.fecha) - new Date(a.fecha);
        if (orden === "materia")
          return (a.materia_nombre || "").localeCompare(b.materia_nombre || "");
        if (orden === "tipo") return a.tipo.localeCompare(b.tipo);
        if (orden === "unidad") {
          if (!a.unidad) return 1;
          if (!b.unidad) return -1;
          return a.unidad.localeCompare(b.unidad);
        }
        return 0;
      });
  }, [evaluaciones, filtroMateria, filtroTipo, filtroUnidad, busqueda, orden]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = evaluaciones.length;
    const evaluadas = evaluaciones.filter(
      (e) => e.calificacion !== null,
    ).length;
    const pendientes = total - evaluadas;

    const porMateria = {};
    const porTipo = {};
    const porUnidad = {};

    evaluaciones.forEach((e) => {
      // Por materia
      if (!porMateria[e.materia_id]) {
        porMateria[e.materia_id] = {
          materia: e.materia_nombre,
          color: e.materia_color,
          total: 0,
          evaluadas: 0,
          suma: 0,
          porcentajeTotal: 0,
        };
      }
      porMateria[e.materia_id].total++;
      porMateria[e.materia_id].porcentajeTotal += e.porcentaje;
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

      // Por unidad
      if (e.unidad) {
        const key = `${e.materia_id}-${e.unidad}`;
        if (!porUnidad[key]) {
          porUnidad[key] = {
            materia: e.materia_nombre,
            unidad: e.unidad,
            color: e.materia_color,
            total: 0,
            evaluadas: 0,
            suma: 0,
            porcentajeTotal: 0,
          };
        }
        porUnidad[key].total++;
        porUnidad[key].porcentajeTotal += e.porcentaje;
        if (e.calificacion !== null) {
          porUnidad[key].evaluadas++;
          porUnidad[key].suma += e.calificacion;
        }
      }
    });

    // Calcular promedios
    Object.keys(porMateria).forEach((id) => {
      const m = porMateria[id];
      m.promedio = m.evaluadas > 0 ? (m.suma / m.evaluadas).toFixed(1) : "-";
    });

    Object.keys(porUnidad).forEach((key) => {
      const u = porUnidad[key];
      u.promedio = u.evaluadas > 0 ? (u.suma / u.evaluadas).toFixed(1) : "-";
    });

    // Próximas evaluaciones pendientes
    const proximas = evaluaciones
      .filter((e) => e.calificacion === null && new Date(e.fecha) > new Date())
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 5);

    return {
      total,
      evaluadas,
      pendientes,
      porMateria,
      porTipo,
      porUnidad,
      proximas,
    };
  }, [evaluaciones]);

  const handleGuardar = async (datos) => {
    console.log("Guardando evaluación:", datos);

    // SOLO verificar por unidad (NO por materia global)
    if (datos.unidad) {
      // Buscar evaluaciones de la MISMA unidad (excluyendo la actual si es edición)
      const evaluacionesMismaUnidad = evaluaciones.filter(
        (e) =>
          e.materia_id === datos.materia_id &&
          e.unidad === datos.unidad &&
          (!evaluacionAEditar || e.id !== evaluacionAEditar.id),
      );

      const totalUnidadActual = evaluacionesMismaUnidad.reduce(
        (sum, e) => sum + e.porcentaje,
        0,
      );
      const nuevoTotalUnidad = totalUnidadActual + datos.porcentaje;

      if (nuevoTotalUnidad > 100) {
        setErrorPorcentaje(
          `El total de porcentajes para la ${datos.unidad} sería ${nuevoTotalUnidad}%. Debe ser máximo 100%.`,
        );
        return;
      }
    }

    setErrorPorcentaje(null);

    try {
      if (evaluacionAEditar) {
        await window.electronAPI.evaluaciones.actualizar({
          id: evaluacionAEditar.id,
          ...datos,
        });
      } else {
        await window.electronAPI.evaluaciones.crear(datos);
      }

      // Recargar evaluaciones
      await cargarEvaluaciones();
      setModalOpen(false);
      setEvaluacionAEditar(null);
    } catch (error) {
      console.error("Error guardando evaluación:", error);
      setErrorPorcentaje("Error al guardar la evaluación. Intenta de nuevo.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar esta evaluación?")) {
      try {
        await window.electronAPI.evaluaciones.eliminar(id);
        await cargarEvaluaciones();
      } catch (error) {
        console.error("Error eliminando evaluación:", error);
      }
    }
  };

  const handleContextMenu = (e, evaluacion) => {
    e.preventDefault();
    setMenuContextual({
      x: e.pageX,
      y: e.pageY,
      evaluacion,
    });
  };

  useEffect(() => {
    const cerrarMenu = () => setMenuContextual(null);
    window.addEventListener("click", cerrarMenu);
    return () => window.removeEventListener("click", cerrarMenu);
  }, []);

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
    <div className="space-y-6">
      <EvaluacionHeader
        total={evaluaciones.length}
        pendientes={estadisticas.pendientes}
        onNuevaEvaluacion={() => {
          setEvaluacionAEditar(null);
          setModalOpen(true);
          setErrorPorcentaje(null);
        }}
      />

      <EvaluacionAlertas
        alertasUnidad={verificarPorcentajes}
        errorPorcentaje={errorPorcentaje}
      />

      <EvaluacionKPIs estadisticas={estadisticas} />

      <EvaluacionFiltros
        vista={vista}
        setVista={setVista}
        filtroMateria={filtroMateria}
        setFiltroMateria={setFiltroMateria}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroUnidad={filtroUnidad}
        setFiltroUnidad={setFiltroUnidad}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        orden={orden}
        setOrden={setOrden}
        materias={materias}
        unidadesUnicas={unidadesUnicas}
      />

      <AnimatePresence mode="wait">
        {vista === "lista" && (
          <VistaLista
            evaluaciones={evaluacionesFiltradas}
            onContextMenu={handleContextMenu}
          />
        )}
        {vista === "calendario" && (
          <VistaCalendario
            evaluacionesPorFecha={evaluacionesPorFecha}
            onContextMenu={handleContextMenu}
          />
        )}
        {vista === "estadisticas" && (
          <VistaEstadisticas estadisticas={estadisticas} />
        )}
      </AnimatePresence>

      <EvaluacionMenuContextual
        menuContextual={menuContextual}
        onClose={() => setMenuContextual(null)}
        onEditar={(evaluacion) => {
          setEvaluacionAEditar(evaluacion);
          setModalOpen(true);
          setMenuContextual(null);
          setErrorPorcentaje(null);
        }}
        onEliminar={handleEliminar}
      />

      <ModalNuevaEvaluacion
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEvaluacionAEditar(null);
          setErrorPorcentaje(null);
        }}
        onSave={handleGuardar}
        materias={materias}
        evaluacionInicial={evaluacionAEditar}
        materiaIdInicial={null}
      />
    </div>
  );
};

export default DashboardEvaluaciones;
