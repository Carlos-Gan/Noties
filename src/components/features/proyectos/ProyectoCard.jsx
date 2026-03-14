import { motion } from "framer-motion";
import { FiCalendar } from "react-icons/fi";

const ProyectoCard = ({ proyecto, onContextMenu, onClick }) => {
  return (
    <motion.div
      layoutId={proyecto.id}
      draggable
      onDragStart={() => {
        window.draggedProjectId = proyecto.id;
      }}
      onContextMenu={onContextMenu}
      onClick={onClick}
      className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 hover:bg-[#1e1e1e] transition-all group cursor-pointer relative"
    >
      <div className="absolute top-4 right-4 text-[9px] font-black text-gray-700 group-hover:text-indigo-500 transition-colors uppercase">
        Editar
      </div>
      <h4 className="text-sm font-bold text-gray-200">{proyecto.nombre}</h4>
      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase">
        <span>
          <FiCalendar className="inline mr-1" />{" "}
          {proyecto.fecha_limite || "S/F"}
        </span>
        {proyecto.unidad && <span>U{proyecto.unidad}</span>}
      </div>
    </motion.div>
  );
};

export default ProyectoCard;
