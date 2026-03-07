import { motion } from "framer-motion";
import CardMateria from "./CardMateria";

const Dashboard = ({ 
  nombreUsuario, 
  materias, 
  tareasPorMateria, 
  proyectosPorMateria, 
  configSecciones, 
  navigateTo, 
  setModalOpen 
}) => {
  return (
    <>
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
        exit={{ opacity: 0, x: -20 }}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {materias.map((m) => {
            const meta = JSON.parse(m.metadata || "{}");
            return (
              <CardMateria
                key={m.id}
                titulo={m.nombre}
                profesor={meta.prof || "No asignado"}
                estado={meta.estado || "En curso"}
                semestre={meta.semestre || 1}
                color={m.color}
                tareasPendientes={tareasPorMateria[m.id] || []}
                proyectoPendientes={proyectosPorMateria[m.id] || []}
                notasCount={0}
                configSecciones={configSecciones}
                onClick={() => navigateTo("materia", m)}
              />
            );
          })}

          <div
            onClick={() => setModalOpen(true)}
            className="border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center p-6 hover:bg-white/5 cursor-pointer transition-all group min-h-[350px]"
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
    </>
  );
};

export default Dashboard;