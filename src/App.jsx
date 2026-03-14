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
import { useEffect } from "react";
import ModalSemestreArchivado from "./components/Modals/ModalSemestreArchivado";
import NotasDashboard from "./components/features/notas/NotasDashboard";
import DashboardHorario from "./components/features/horario/DashboardHorario";
import MateriaApuntes from "./components/features/materias/MateriaApuntes";

function App() {
  const Logic = useAppLogic();

  useEffect(() => {
    const handleMouseBack = (e) => {
      if (e.button === 3) {
        e.preventDefault();
        Logic.goBack();
      }
    };
    window.addEventListener("mousedown", handleMouseBack);
    return () => window.removeEventListener("mousedown", handleMouseBack);
  }, [Logic.goBack]);

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

  if (Logic.vaultListo === false) {
    return <WelcomeScreen onVaultListo={() => Logic.setVaultListo(true)} />;
  }

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
        materias={Logic.materias}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Modal fuera del AnimatePresence principal */}
        <ModalSemestreArchivado
          isOpen={Logic.semestreModal.mostrar}
          onClose={Logic.semestreModal.cerrar}
          materias={Logic.semestreModal.materias}
        />

        <AnimatePresence mode="wait">
          {/* Vista principal con keys únicas */}
          {Logic.view.type === "dashboard" && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <Dashboard
                nombreUsuario={Logic.nombreUsuario}
                materias={Logic.materias}
                tareasPorMateria={Logic.tareasPorMateria}
                proyectosPorMateria={Logic.proyectosPorMateria}
                configSecciones={Logic.configSecciones}
                navigateTo={Logic.navigateTo}
                setModalOpen={Logic.setModalOpen}
                eliminarMateria={Logic.eliminarMateria}
              />
            </motion.div>
          )}
          {Logic.view.type === "tasks" && (
            <motion.div
              key="tasks-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <TareasView materias={Logic.materias} />
            </motion.div>
          )}
          {Logic.view.type === "projects" && (
            <motion.div
              key="projects-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <ProyectoDashboard materias={Logic.materias} />
            </motion.div>
          )}
          {Logic.view.type === "notes" && (
            <motion.div
              key="notes-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <NotasDashboard
                notas={Logic.todasLasNotas}
                materias={Logic.materias}
                navigateTo={Logic.navigateTo}
              />
            </motion.div>
          )}
          {Logic.view.type === "materia-detalle" && (
            <motion.div
              key={`materia-detalle-${Logic.view.data?.id || Logic.view.data?.materiaId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <MateriaDetalle
                materia={{
                  id: Logic.view.data.materiaId || Logic.view.data.id,
                  nombre:
                    Logic.view.data.materiaNombre || Logic.view.data.nombre,
                  color:
                    Logic.view.data.materiaColor ||
                    Logic.view.data.color ||
                    "#3b82f6",
                }}
                onVolver={() => Logic.navigateTo("dashboard")}
                configSecciones={Logic.configSecciones}
                idNotaInicial={Logic.view.data.notaId}
                vistaInicial={
                  Logic.view.data.tab ||
                  Logic.view.data.openVista ||
                  "dashboard"
                }
              />
            </motion.div>
          )}
          {Logic.view.type === "clases" && (
            <motion.div
              key="clases-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <ClasesAgregadasView
                materias={Logic.materias}
                resumen={Logic.resumenGlobal}
                onMateriaClick={(m) =>
                  Logic.navigateTo("materia-detalle", {
                    ...m,
                    tab: "dashboard",
                  })
                }
              />
            </motion.div>
          )}
          {Logic.view.type === "horario" && (
            <motion.div
              key="horario-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <DashboardHorario materias={Logic.materias} />
            </motion.div>
          )}

          {Logic.view.type === "materia-apuntes" && (
            <motion.div
              key={`materia-apuntes-${Logic.view.data?.materiaId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <MateriaApuntes
                materia={{
                  id: Logic.view.data.materiaId,
                  nombre: Logic.view.data.materiaNombre,
                  color: Logic.view.data.materiaColor || "#3b82f6",
                }}
                onVolver={() => Logic.navigateTo("notes")}
                configSecciones={Logic.configSecciones}
                idNotaInicial={Logic.view.data.notaId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales con su propio AnimatePresence */}
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
