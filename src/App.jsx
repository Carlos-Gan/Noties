import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import CardMateria from "./components/CardMateria";
import ModalNuevaMateria from "./components/Modals/ModalNuevaMateria";
import ModalAdminParametros from "./components/Modals/ModalAdminParametros";
import WelcomeScreen from "./pages/Welcome";
import ModalNombre from "./components/Modals/ModalNombre";

function App() {
  // --- Estados ---
  const [vaultListo, setVaultListo] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [tareasPorMateria, setTareasPorMateria] = useState({});
  const [proyectosPorMateria, setProyectosPorMateria] = useState({});
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [pidioNombre, setPidioNombre] = useState(false);

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

  // --- Handlers ---
  const handleGuardarMateria = async ({ nombre, fields }) => {
    const metadata = {};
    fields.forEach((f) => {
      metadata[f.id] = f.value;
    });

    await window.electron.invoke("materias:crear", {
      nombre,
      color: "#3b82f6",
      icono: "📚",
      metadata: JSON.stringify(metadata),
    });
    setModalOpen(false);
    cargarMaterias();
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

  // --- Renderizado Condicional de Pantallas Completas ---\
  // 1. Cargando Inicial (Circulito)
  if (vaultListo === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#141414]">
        <motion.div
          className="w-4 h-4 rounded-full bg-blue-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
    );
  }

  // 2. Si no hay Vault configurado (Ir a Welcome)
  if (vaultListo === false) {
    return <WelcomeScreen onVaultListo={() => setVaultListo(true)} />;
  }
  // 3. Si hay Vault pero falta nombre
  if (pidioNombre) {
    return (
      <ModalNombre
        onGuardar={async (nombre) => {
          await window.electron.invoke("config:set", "nombre_usuario", nombre);
          setNombreUsuario(nombre);
          setPidioNombre(false);
        }}
      />
    );
  }

  // --- Renderizado App Principal ---
  return (
    <div className="flex h-screen w-full bg-[#3d3d3d] overflow-hidden font-sans text-white">
      <CommandPalette isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />

      <Sidebar
        onSearchClick={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        configSecciones={configSecciones}
        onColorChange={cambiarColorSeccion}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="h-14 w-full flex items-center justify-between px-8 border-b border-white/5 bg-[#3d3d3d]/50 backdrop-blur-md sticky top-0 z-10">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
            Dashboard // Mis Clases
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-full transition-all font-medium shadow-lg shadow-blue-900/20"
          >
            + Nueva Materia
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 max-w-6xl mx-auto w-full"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">
              ¡Hola, {nombreUsuario}! 👋
            </h1>
            <p className="text-gray-400 text-sm">
              Tienes {materias.length} materias activas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materias.map((m) => {
              const meta = JSON.parse(m.metadata || "{}");
              return (
                <CardMateria
                  key={m.id}
                  titulo={m.nombre}
                  profesor={meta.prof || "No asignado"}
                  estado={meta.estado || "En curso"}
                  semestre={meta.semestre || 1}
                  color="bg-blue-500/20"
                  tareasPendientes={tareasPorMateria[m.id] || []}
                  proyectoPendientes={proyectosPorMateria[m.id] || []}
                  configSecciones={configSecciones}
                />
              );
            })}

            <div
              onClick={() => setModalOpen(true)}
              className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 hover:bg-white/5 cursor-pointer transition-all group"
            >
              <span className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity">
                ➕
              </span>
              <span className="text-xs text-gray-500 mt-2 font-medium">
                Añadir materia
              </span>
            </div>
          </div>
        </motion.div>

        {/* Modales */}
        <AnimatePresence>
          {isModalOpen && (
            <ModalNuevaMateria
              isOpen={isModalOpen}
              plantilla={plantillaGlobal}
              onClose={() => setModalOpen(false)}
              onSave={handleGuardarMateria}
            />
          )}
          {isAdminOpen && (
            <ModalAdminParametros
              isOpen={isAdminOpen}
              onClose={() => setIsAdminOpen(false)}
              onAdd={agregarParametroGlobal}
              camposActuales={plantillaGlobal}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
