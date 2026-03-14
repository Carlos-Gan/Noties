import { motion } from "framer-motion";
import CardMateria from "../materias/components/CardMateria";

const Dashboard = ({
  nombreUsuario,
  materias,
  tareasPorMateria,
  proyectosPorMateria,
  configSecciones,
  navigateTo,
  setModalOpen,
  eliminarMateria
}) => {
  return (
    <>
      <header className="h-12 w-full flex items-center justify-between px-8 border-b border-white/6 bg-[#141414]/50 backdrop-blur-md sticky top-0 z-10">
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
        <div className="mb-10 px-6">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            ¡Hola, {nombreUsuario}! 👋
          </h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
            Tienes {materias.length} materias activas en este semestre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {materias.map((m) => {
            // Intentamos parsear la metadata de forma segura
            let meta = {};
            try {
              meta =
                typeof m.metadata === "string"
                  ? JSON.parse(m.metadata)
                  : m.metadata || {};
            } catch (e) {
              meta = {};
            }

            return (
              <CardMateria
                key={m.id}
                titulo={m.nombre}
                profesor={meta.profesor || meta.prof || "Catedrático"}
                estado={meta.estado || "En curso"}
                semestre={meta.semestre}
                color={m.color}
                tareasPendientes={tareasPorMateria[m.id] || []}
                proyectoPendientes={proyectosPorMateria[m.id] || []}
                notasCount={0}
                configSecciones={configSecciones}
                // CORRECCIÓN AQUÍ: Usamos "materia-detalle" para que coincida con App.js
                onClick={() => navigateTo("materia-detalle", m)}
                onContextMenu={(e) => {
                  e.preventDefault();

                  if (confirm(`¿Eliminar la materia "${m.nombre}"?`)) {
                    eliminarMateria(m.id);
                  }
                }}
              />
            );
          })}

          {/* Botón rápido para añadir materia con el mismo estilo de Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalOpen(true)}
            className="border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center p-6 hover:bg-white/[0.02] hover:border-white/10 cursor-pointer transition-all group min-h-[350px]"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
              <span className="text-2xl">+</span>
            </div>
            <span className="text-xs text-gray-500 font-black uppercase tracking-widest">
              Añadir materia
            </span>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
