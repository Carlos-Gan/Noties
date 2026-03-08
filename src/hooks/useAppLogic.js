import { useState, useEffect } from "react";

// ─── Fuera del hook ───────────────────────────────────
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
  const [view, setView] = useState({ type: "dashboard", data: null });
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [filtroUnidad, setFiltroUnidad] = useState("Todas");
  const [resumenGlobal, setResumenGlobal] = useState({ notas: [], tareas: [] });
  const [formatoHora, setFormatoHora] = useState("12h"); // ← nuevo
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [todasLasNotas, setTodasLasNotas] = useState([]);

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
      options: generarHoras("12h"),
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

  // ─── Cambiar formato hora ─────────────────────────────
  const cambiarFormatoHora = async (formato) => {
    setFormatoHora(formato);
    await window.electron.invoke("config:set", "formato_hora", formato);
    setPlantillaGlobal((prev) =>
      prev.map((f) =>
        f.id === "hora" ? { ...f, options: generarHoras(formato) } : f,
      ),
    );
  };

  const cargarMaterias = async () => {
    try {
      const data = await window.electron.invoke("materias:getAll");
      setMaterias(data);
      const tareas = {};
      const proyectos = {};
      let notasAcumuladas = [];

      for (const m of data) {
        tareas[m.id] = await window.electron.invoke("tareas:getSueltas", m.id);
        proyectos[m.id] = await window.electron.invoke(
          "proyectos:getByMateria",
          m.id,
        );
        const notasDeMateria = await window.electron.invoke(
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
  };

  // Agregamos selectedNotaId como tercer parámetro opcional
  const navigateTo = (type, data = null, selectedNotaId = null) => {
    if (type === "clases") cargarResumenGlobal();

    // Guardamos el tipo de vista, la data de la materia y el ID de la nota
    setView({
      type,
      data,
      selectedNotaId,
    });
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

  const guardarNombreUsuario = async (nombre) => {
    await window.electron.invoke("config:set", "nombre_usuario", nombre);
    setNombreUsuario(nombre);
    setPidioNombre(false);
  };

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

  // ─── Efectos ──────────────────────────────────────────
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
          const nombre = await window.electron.invoke(
            "config:get",
            "nombre_usuario",
          );
          if (nombre) {
            setNombreUsuario(nombre);
            setPidioNombre(false);
          } else {
            setNombreUsuario("");
            setPidioNombre(true);
          }

          // ← Cargar formato hora guardado
          const formato = await window.electron.invoke(
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
    vaultListo,
    setVaultListo,
    nombreUsuario,
    pidioNombre,
    materias,
    tareasPorMateria,
    proyectosPorMateria,
    view,
    navigateTo,
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
    formatoHora, // ← exportar
    cambiarFormatoHora, // ← exportar
    isSettingsOpen,
    setIsSettingsOpen,
    todasLasNotas,
    setTodasLasNotas,
  };
}
