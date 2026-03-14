import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "./useNavigation";
import { useSemestreAutoArchive } from "./useSemestreAutoArhive";

// ─── Funciones Auxiliares ───────────────────────────
const generarHoras = (formato) => {
  if (formato === "24h") {
    return Array.from({ length: 15 }, (_, i) => {
      const hora = i + 7;
      return `${hora.toString().padStart(2, "0")}:00`;
    });
  }
  return [
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
  ];
};

export function useAppLogic() {
  const [vaultListo, setVaultListo] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [tareasPorMateria, setTareasPorMateria] = useState({});
  const [proyectosPorMateria, setProyectosPorMateria] = useState({});
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [pidioNombre, setPidioNombre] = useState(false);
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [filtroUnidad, setFiltroUnidad] = useState("Todas");
  const [resumenGlobal, setResumenGlobal] = useState({ notas: [], tareas: [] });
  const [formatoHora, setFormatoHora] = useState("12h");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [todasLasNotas, setTodasLasNotas] = useState([]);

  const [plantillaGlobal, setPlantillaGlobal] = useState([
    { id: "prof", label: "Profesor", type: "text", value: "", icon: "👨‍🏫" },

    {
      id: "horarios",
      label: "Horarios",
      type: "schedule",
      value: [],
      icon: "📅",
    },

    { id: "links", label: "Links", type: "text", value: "", icon: "🔗" },

    { id: "semestre", label: "Semestre", type: "number", value: 1, icon: "🔢" },

    {
      id: "estado",
      label: "Estado",
      type: "select",
      options: ["En curso", "Finalizada", "Pendiente"],
      value: "En curso",
      icon: "✅",
    },
  ]);

  const [configSecciones, setConfigSecciones] = useState({
    Apuntes: { color: "bg-blue-600", icon: "📝" },
    Tareas: { color: "bg-orange-500", icon: "✅" },
    Proyectos: { color: "bg-purple-600", icon: "🚀" },
    Home: { color: "bg-gray-400", icon: "🏠" },
    Clases: { color: "bg-green-600", icon: "📚" },
  });

  const cambiarFormatoHora = async (formato) => {
    setFormatoHora(formato);
    await window.electronAPI.invoke("config:set", "formato_hora", formato);
    setPlantillaGlobal((prev) =>
      prev.map((f) =>
        f.id === "hora" ? { ...f, options: generarHoras(formato) } : f,
      ),
    );
  };

  const cargarMaterias = useCallback(async () => {
    try {
      const data = await window.electronAPI.invoke("materias:getAll");
      setMaterias(data);
      const tareas = {};
      const proyectos = {};
      let notasAcumuladas = [];

      for (const m of data) {
        tareas[m.id] = await window.electronAPI.invoke(
          "tareas:getSueltas",
          m.id,
        );
        proyectos[m.id] = await window.electronAPI.invoke(
          "proyectos:getByMateria",
          m.id,
        );
        const notasDeMateria = await window.electronAPI.invoke(
          "apuntes:getByMateria",
          m.id,
        );
        notasAcumuladas = [...notasAcumuladas, ...notasDeMateria];
      }
      setTareasPorMateria(tareas);
      setProyectosPorMateria(proyectos);
      setTodasLasNotas(notasAcumuladas);
    } catch (error) {
      console.error("Error cargando materias:", error);
    }
  }, []);

  const cargarResumenGlobal = async () => {
    const res = await window.electronAPI.invoke("dashboard:getResumen");
    setResumenGlobal(res);
  };

  const { mostrarModal, materiasArchivadas, cerrarModal } =
    useSemestreAutoArchive({
      vaultListo,
      cargarMaterias,
    });

  const { view, navigateTo, goBack, canGoBack } = useNavigation({
    onClases: cargarResumenGlobal,
  });

  const cambiarColorSeccion = (seccion, nuevoColor) => {
    setConfigSecciones((prev) => ({
      ...prev,
      [seccion]: { ...prev[seccion], color: nuevoColor },
    }));
  };

  const agregarParametroGlobal = (nuevoCampo) => {
    setPlantillaGlobal([...plantillaGlobal, nuevoCampo]);
  };

  const guardarNombreUsuario = async (nombre) => {
    await window.electronAPI.invoke("config:set", "nombre_usuario", nombre);
    setNombreUsuario(nombre);
    setPidioNombre(false);
  };

  const handleGuardarMateria = async ({ nombre, fields }) => {
    const metadata = {};
    fields.forEach((f) => {
      metadata[f.id] = f.value;
    });
    await window.electronAPI.invoke("materias:crear", {
      nombre: nombre || "Nueva Materia",
      color: "#3b82f6",
      icono: "📚",
      semestre: 1,
      metadata: JSON.stringify(metadata),
    });
    setModalOpen(false);
    cargarMaterias();
  };

  const getProyectosFiltrados = () => {
    const todosLosProyectos = Object.values(proyectosPorMateria).flat();
    return todosLosProyectos.filter((proyecto) => {
      const coincideMateria =
        filtroMateria === "Todas" || proyecto.materia_nombre === filtroMateria;
      const coincideUnidad =
        filtroUnidad === "Todas" || proyecto.unidad === filtroUnidad;
      return coincideMateria && coincideUnidad;
    });
  };

  const eliminarMateria = async (id) => {
    await window.electronAPI.invoke("materias:delete", id);

    window.dispatchEvent(new CustomEvent("materias-updated"));
  };

  // ─── Efecto de Inicialización ────────────────────────
  useEffect(() => {
    const inicializarApp = async () => {
      try {
        let intentos = 0;
        while (!window.electronAPI && intentos < 15) {
          await new Promise((r) => setTimeout(r, 100));
          intentos++;
        }
        if (!window.electronAPI) return;

        // Verificar si la DB está lista
        const isReady = await window.electronAPI.checkDB();

        if (isReady) {
          setVaultListo(true);

          // Cargar nombre de usuario
          const nombre = await window.electronAPI.invoke(
            "config:get",
            "nombre_usuario",
          );
          if (nombre) {
            setNombreUsuario(nombre);
            setPidioNombre(false);
          } else {
            setPidioNombre(true);
          }

          // Cargar formato de hora
          const formato = await window.electronAPI.invoke(
            "config:get",
            "formato_hora",
          );
          if (formato) {
            setFormatoHora(formato);
            setPlantillaGlobal((prev) =>
              prev.map((f) =>
                f.id === "hora" ? { ...f, options: generarHoras(formato) } : f,
              ),
            );
          }
        } else {
          setVaultListo(false);
        }
      } catch (error) {
        console.error("Error inicializando:", error);
        setVaultListo(false);
      }
    };
    inicializarApp();
  }, []);

  useEffect(() => {
    if (vaultListo === true && !pidioNombre) {
      cargarMaterias();
    }
  }, [vaultListo, pidioNombre, cargarMaterias]);

  useEffect(() => {
    const handler = () => cargarMaterias();
    window.addEventListener("materias-updated", handler);
    window.addEventListener("notas-updated", handler);
    return () => {
      window.removeEventListener("materias-updated", handler);
      window.removeEventListener("notas-updated", handler);
    };
  }, [cargarMaterias]);

  return {
    semestreModal: {
      mostrar: mostrarModal,
      materias: materiasArchivadas,
      cerrar: cerrarModal,
    },
    vaultListo,
    setVaultListo,
    nombreUsuario,
    pidioNombre,
    materias,
    tareasPorMateria,
    proyectosPorMateria,
    view,
    navigateTo,
    goBack,
    canGoBack,
    configSecciones,
    cambiarColorSeccion,
    resumenGlobal,
    isSearchOpen,
    setIsSearchOpen,
    isAdminOpen,
    setIsAdminOpen,
    isModalOpen,
    setModalOpen,
    plantillaGlobal,
    cargarMaterias,
    handleGuardarMateria,
    agregarParametroGlobal,
    guardarNombreUsuario,
    filtroMateria,
    setFiltroMateria,
    filtroUnidad,
    setFiltroUnidad,
    proyectosFiltrados: getProyectosFiltrados(),
    formatoHora,
    cambiarFormatoHora,
    isSettingsOpen,
    setIsSettingsOpen,
    todasLasNotas,
    setTodasLasNotas,
    eliminarMateria
  };
}
