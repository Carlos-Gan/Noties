import { motion } from "framer-motion";
import { FiTarget, FiArrowRight } from "react-icons/fi";

const HeroSection = ({ porcentaje, urgente, onVerDetalles, onNuevoProyecto }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2.5rem] p-10 shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <FiTarget /> Objetivo Prioritario
          </div>
          {urgente ? (
            <>
              <h2 className="text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
                {urgente.nombre}
              </h2>
              <button
                onClick={() => onVerDetalles(urgente)}
                className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-xs hover:scale-105 transition-all flex items-center gap-2 uppercase"
              >
                Ver Detalles <FiArrowRight />
              </button>
            </>
          ) : (
            <h2 className="text-4xl font-black text-white uppercase">
              Todo al día
            </h2>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between"
      >
        <div className="text-5xl font-black text-white tracking-tighter">
          {porcentaje}%
        </div>
        <button
          onClick={onNuevoProyecto}
          className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px]"
        >
          + Nuevo Proyecto
        </button>
      </motion.div>
    </section>
  );
};

export default HeroSection;