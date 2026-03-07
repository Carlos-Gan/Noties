import { useState } from "react";
import { motion } from "framer-motion";
import SeccionProyectos from "./SeccionProyectos";

const ClasesAgregadasView = ({
  materias = [],
  resumen = { notas: [], proyectos: [] },
  onMateriaClick,
}) => {
  const [filtroMateria, setFiltroMateria] = useState("Todas");

  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    return isNaN(d) ? "Sin fecha" : d.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 max-w-7xl mx-auto w-full"
    >
      <div className="grid grid-cols-12 gap-16">
        {/* COLUMNA 1: CLASES */}
        <div className="col-span-4">
          <h2 className="text-2xl font-bold mb-8 flex items-center justify-between">
            Clases
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
              {materias.length}
            </span>
          </h2>
          <div className="space-y-1">
            {materias.map((m) => (
              <div
                key={m.id}
                onClick={() => onMateriaClick?.(m)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] cursor-pointer group transition-all"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-lg group-hover:scale-110 transition-transform">
                  {m.icono || "📚"}
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white">
                  {m.nombre}
                </span>
              </div>
            ))}
            {materias.length === 0 && (
              <p className="text-sm text-gray-600 italic p-2">
                No hay clases aún.
              </p>
            )}
          </div>
        </div>

        {/* COLUMNA 2: NOTAS RECIENTES */}
        <div className="col-span-8">
          <h2 className="text-2xl font-bold mb-8 flex items-center justify-between">
            Notas
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
              Recent
            </span>
          </h2>
          <div className="border-t border-white/5 pt-2">
            {resumen.notas.map((nota) => (
              <div
                key={nota.id}
                className="grid grid-cols-12 px-4 py-3 rounded-xl hover:bg-white/[0.02] cursor-pointer group border-b border-white/[0.01]"
              >
                <div className="col-span-7 text-sm text-gray-300 group-hover:text-white font-medium">
                  {nota.titulo}
                </div>
                <div className="col-span-5 text-right text-[11px] text-gray-500 font-bold self-center uppercase">
                  {nota.materia_nombre} • {formatFecha(nota.updated_at)}
                </div>
              </div>
            ))}
            {resumen.notas.length === 0 && (
              <p className="p-4 text-gray-600 italic text-sm text-center">
                No hay apuntes aún.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.03] my-12" />

      <SeccionProyectos
        proyectos={resumen.proyectos}
        materias={materias}
        filtroMateria={filtroMateria}
        setFiltroMateria={setFiltroMateria}
      />
    </motion.div>
  );
};

export default ClasesAgregadasView;