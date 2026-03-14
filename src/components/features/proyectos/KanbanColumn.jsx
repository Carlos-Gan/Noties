// /components/features/proyectos/components/KanbanColumn.jsx
import { AnimatePresence } from "framer-motion";
import ProyectoCard from "./ProyectoCard";

const KanbanColumn = ({
  estado,
  info,
  proyectos,
  materiaId,
  onDragEnd,
  onEditar,
  onVerDetalles,
}) => {
  const proyectosFiltrados = proyectos.filter(
    (p) => p.materia_id === materiaId && p.estado === estado,
  );

  const IconComponent = info.icon; // 👈 Obtenemos el componente de icono

  return (
    <div
      className="flex flex-col gap-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        const id = window.draggedProjectId;
        if (id) onDragEnd(id, estado);
      }}
    >
      <div className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 ml-2">
        <IconComponent size={14} /> {info.label}{" "}
        {/* 👈 Renderizamos el componente */}
      </div>

      <div className="space-y-4 min-h-[200px] p-2 bg-white/[0.01] rounded-[2rem] border border-transparent hover:border-white/5 transition-all">
        <AnimatePresence mode="popLayout">
          {proyectosFiltrados.map((p) => (
            <ProyectoCard
              key={p.id}
              proyecto={p}
              onContextMenu={(e) => onEditar(e, p)}
              onClick={() => onVerDetalles(p)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KanbanColumn;