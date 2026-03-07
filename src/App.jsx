import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import ModalNuevaMateria from "./components/Modals/ModalNuevaMateria";
import ModalAdminParametros from "./components/Modals/ModalAdminParametros";
import WelcomeScreen from "./pages/Welcome";
import ModalNombre from "./components/Modals/ModalNombre";
import MateriaDetalle from "./components/MateriaDetalle";
import Dashboard from "./components/Dashboard";
import ClasesAgregadasView from "./components/ClasesAgregadasView";
import { useAppLogic } from "./hooks/useAppLogic";

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
      />

      <Sidebar
        onSearchClick={() => Logic.setIsSearchOpen(true)}
        onOpenAdmin={() => Logic.setIsAdminOpen(true)}
        configSecciones={Logic.configSecciones}
        onColorChange={Logic.cambiarColorSeccion}
        onNavigate={Logic.navigateTo}
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
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
