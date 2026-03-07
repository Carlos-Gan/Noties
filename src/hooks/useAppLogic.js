import { useState, useEffect } from "react";

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
  const [view, setView] = useState({ type: "dashboard", data: null });

  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [filtroUnidad, setFiltroUnidad] = useState("Todas");

  const [resumenGlobal, setResumenGlobal] = useState({ notas: [], tareas: [] });

  const [plantillaGlobal, setPlantillaGlobal] = useState([
    { id: "prof", label: "Profesor", type: "text", value: "", icon: "👨‍🏫" },
    {
      id: "dias",
      label: "Dia de Clase",
      type: "multi-select",
      value: [],
      icon: "📅",
    },
    {
      id: "hora",
      label: "Horario",
      type: "select",
      options: ["7:00 AM", "9:00 AM"],
      value: "",
      icon: "⏰",
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

  // --- Funciones de Carga ---
  const cargarMaterias = async () => {
    try {
      const data = await window.electron.invoke("materias:getAll");
      setMaterias(data);

      const tareas = {};
      const proyectos = {};
      for (const m of data) {
        tareas[m.id] = await window.electron.invoke("tareas:getSueltas", m.id);
        proyectos[m.id] = await window.electron.invoke(
          "proyectos:getByMateria",
          m.id,
        );
      }
      setTareasPorMateria(tareas);
      setProyectosPorMateria(proyectos);
    } catch (error) {
      console.error("Error cargando materias:", error);
    }
  };

  const navigateTo = (type, data = null) => {
    if (type === "clases") cargarResumenGlobal();
    setView({ type, data });
  };

  const cambiarColorSeccion = (seccion, nuevoColor) => {
    setConfigSecciones((prev) => ({
      ...prev,
      [seccion]: { ...prev[seccion], color: nuevoColor },
    }));
  };

  const agregarParametroGlobal = (nuevoCampo) => {
    setPlantillaGlobal([...plantillaGlobal, nuevoCampo]);
  };

  // --- Nuevo Handler para el Modal de Nombre ---
  const guardarNombreUsuario = async (nombre) => {
    await window.electron.invoke("config:set", "nombre_usuario", nombre);
    setNombreUsuario(nombre);
    setPidioNombre(false);
  };

  // --- Handlers ---
  const handleGuardarMateria = async ({ nombre, fields }) => {
    const metadata = {};
    fields.forEach((f) => {
      metadata[f.id] = f.value;
    });

    await window.electron.invoke("materias:crear", {
      nombre: nombre || "Nueva Materia",
      color: "#3b82f6",
      icono: "📚",
      semestre: 1,
      metadata: JSON.stringify(metadata),
    });
    setModalOpen(false);
    cargarMaterias();
  };

  const cargarResumenGlobal = async () => {
    const res = await window.electron.invoke("dashboard:getResumen");
    setResumenGlobal(res);
  };

  // Función para obtener proyectos filtrados
  const getProyectosFiltrados = () => {
    // Convertimos el objeto tareasPorMateria o proyectosPorMateria en un array plano
    const todosLosProyectos = Object.values(proyectosPorMateria).flat();

    return todosLosProyectos.filter((proyecto) => {
      const coincideMateria =
        filtroMateria === "Todas" || proyecto.materia_nombre === filtroMateria;
      const coincideUnidad =
        filtroUnidad === "Todas" || proyecto.unidad === filtroUnidad;
      return coincideMateria && coincideUnidad;
    });
  };

  // --- Efectos ---
  useEffect(() => {
    const checkVault = async () => {
      try {
        let intentos = 0;
        while (!window.electron && intentos < 10) {
          await new Promise((r) => setTimeout(r, 100));
          intentos++;
        }
        if (!window.electron) return;

        const vaultPath = await window.electron.invoke("vault:check");
        if (vaultPath) {
          setVaultListo(true);
          // Si hay vault, intentamos obtener el nombre
          const nombre = await window.electron.invoke(
            "config:get",
            "nombre_usuario",
          );
          if (nombre) {
            setNombreUsuario(nombre);
            setPidioNombre(false);
          } else {
            setNombreUsuario("");
            setPidioNombre(true); // <--- Esto activará el Modal del nombre
          }
        } else setVaultListo(false);
      } catch (error) {
        console.error("Error checking vault:", error);
        setVaultListo(false);
      }
    };
    checkVault();
  }, [vaultListo]);

  useEffect(() => {
    if (vaultListo === true && !pidioNombre) {
      cargarMaterias();
    }
  }, [vaultListo, pidioNombre]);

  return {
    // Estados de conexion y Datos
    vaultListo,
    setVaultListo,
    nombreUsuario,
    pidioNombre,
    materias,
    tareasPorMateria,
    proyectosPorMateria,

    //Navegacion y Vistas
    view,
    navigateTo,
    configSecciones,
    cambiarColorSeccion,
    resumenGlobal,

    //Control de Modales/UI
    isSearchOpen,
    setIsSearchOpen,
    isAdminOpen,
    setIsAdminOpen,
    isModalOpen,
    setModalOpen,
    plantillaGlobal,

    //Handlers de Datos
    cargarMaterias,
    handleGuardarMateria,
    agregarParametroGlobal,
    guardarNombreUsuario,

    //Filtros
    filtroMateria,
    setFiltroMateria,
    filtroUnidad,
    setFiltroUnidad,
    proyectosFiltrados: getProyectosFiltrados(),
  };
}
