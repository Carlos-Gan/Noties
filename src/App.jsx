import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/layout/Sidebar";
import CommandPalette from "./components/CommandPalette";
import ModalNuevaMateria from "./components/Modals/ModalNuevaMateria";
import ModalAdminParametros from "./components/Modals/ModalAdminParametros";
import WelcomeScreen from "./pages/Welcome";
import ModalNombre from "./components/Modals/ModalNombre";
import MateriaDetalle from "./components/features/materias/MateriaDetalle";
import Dashboard from "./components/features/dashboard/Dashboard";
import ClasesAgregadasView from "./components/features/materias/ClasesView";
import { useAppLogic } from "./hooks/useAppLogic";
import ModalSettings from "./components/Modals/ModalSettings";
import TareasView from "./components/features/tareas/TareasView";
import ProyectoDashboard from "./components/features/proyectos/DashboardProyectos";

function App() {
  // Encapsulamos toda la lógica en un solo objeto
  const Logic = useAppLogic();

  // 1. Cargando Inicial (Usando el estado de la lógica)
  if (Logic.vaultListo === null) {
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

  // 2. Si no hay Vault configurado
  if (Logic.vaultListo === false) {
    return <WelcomeScreen onVaultListo={() => Logic.setVaultListo(true)} />;
  }

  // 3. Si hay Vault pero falta nombre
  if (Logic.pidioNombre) {
    return <ModalNombre onGuardar={Logic.guardarNombreUsuario} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#3d3d3d] overflow-hidden font-sans text-white">
      <CommandPalette
        isOpen={Logic.isSearchOpen}
        setIsOpen={Logic.setIsSearchOpen}
        materias={Logic.materias}
        notas={Logic.todasLasNotas}
        navigateTo={Logic.navigateTo}
      />

      <Sidebar
        view={Logic.view}
        configSecciones={Logic.configSecciones}
        onNavigate={Logic.navigateTo}
        onOpenSettings={() => Logic.setIsSettingsOpen(true)}
        onSearchClick={() => Logic.setIsSearchOpen(true)}
        onOpenAdmin={() => Logic.setIsAdminOpen(true)}
        onColorChange={Logic.cambiarColorSeccion}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Vista principal */}
          {Logic.view.type === "dashboard" && (
            <Dashboard
              key="dashboard"
              nombreUsuario={Logic.nombreUsuario}
              materias={Logic.materias}
              tareasPorMateria={Logic.tareasPorMateria}
              proyectosPorMateria={Logic.proyectosPorMateria}
              configSecciones={Logic.configSecciones}
              navigateTo={Logic.navigateTo}
              setModalOpen={Logic.setModalOpen}
            />
          )}

          {/* Tareas */}
          {Logic.view.type === "tasks" && (
            <TareasView key="tasks" materias={Logic.materias} />
          )}

          {/* Proyectos */}
          {Logic.view.type === "projects" && (
            <ProyectoDashboard key="projects" materias={Logic.materias} />
          )}

          {/* Vista de detalle de materia */}
          {Logic.view.type === "materia-detalle" && (
            <motion.div
              key="materia-detalle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <MateriaDetalle
                materia={Logic.view.data}
                onVolver={() => Logic.navigateTo("dashboard")}
                idNotaInicial={Logic.view.data?.notaId}
                configSecciones={Logic.configSecciones}
              />
            </motion.div>
          )}
          {/* Vista de clases agregadas */}
          {Logic.view.type === "clases" && (
            <ClasesAgregadasView
              key="clases-view"
              materias={Logic.materias}
              resumen={Logic.resumenGlobal}
              onMateriaClick={(m) => Logic.navigateTo("materia-detalle", m)}
            />
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {Logic.isModalOpen && (
            <ModalNuevaMateria
              isOpen={Logic.isModalOpen}
              plantilla={Logic.plantillaGlobal}
              onClose={() => Logic.setModalOpen(false)}
              onSave={Logic.handleGuardarMateria}
            />
          )}
          {Logic.isAdminOpen && (
            <ModalAdminParametros
              isOpen={Logic.isAdminOpen}
              onClose={() => Logic.setIsAdminOpen(false)}
              onAdd={Logic.agregarParametroGlobal}
              camposActuales={Logic.plantillaGlobal}
              formatoHora={Logic.formatoHora}
              onCambiarFormatoHora={Logic.cambiarFormatoHora}
            />
          )}
          {Logic.isSettingsOpen && (
            <ModalSettings
              isOpen={Logic.isSettingsOpen}
              onClose={() => Logic.setIsSettingsOpen(false)}
              formatoHora={Logic.formatoHora}
              onCambiarFormatoHora={Logic.cambiarFormatoHora}
              onAbrirAdmin={() => Logic.setIsAdminOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
