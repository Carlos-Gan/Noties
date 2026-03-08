import { motion } from 'framer-motion';

const ContextMenu = ({ x, y, section, onClose, onEditStructure, onColorChange }) => {
  const colores = [
    { name: 'Azul', class: 'bg-blue-600' },
    { name: 'Naranja', class: 'bg-orange-500' },
    { name: 'Púrpura', class: 'bg-purple-600' },
    { name: 'Verde', class: 'bg-green-500' },
    { name: 'Rojo', class: 'bg-red-500' },
    { name: 'Rosa', class: 'bg-pink-500' },
  ];

  return (
    <>
      {/* Overlay para cerrar el menú */}
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ top: y, left: x }}
        className="fixed z-[101] w-52 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl p-2 backdrop-blur-xl"
      >
        <div className="text-[10px] text-gray-400 font-black px-3 py-2 uppercase tracking-[0.15em] border-b border-white/5 mb-1">
          {section}
        </div>

        {/* 1. Opción especial para Clases */}
        {section === "Clases" && (
          <button 
            onClick={() => { onEditStructure(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-white/5 rounded-lg transition-all"
          >
            <span>⚙️</span> Configurar Parámetros
          </button>
        )}

        {/* 2. Paleta de colores para TODAS las secciones */}
        <div className="px-3 py-2">
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-2">Color del Icono</p>
          <div className="grid grid-cols-3 gap-2">
            {colores.map((c) => (
              <button
                key={c.class}
                onClick={() => { 
                  onColorChange(section, c.class); 
                  onClose(); 
                }}
                className={`w-10 h-8 rounded-lg ${c.class} border-2 border-transparent hover:border-white transition-all shadow-lg`}
              />
            ))}
          </div>
        </div>

        <div className="h-[1px] bg-white/5 my-1" />
        
        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
          <span>🗑️</span> Ocultar de la barra
        </button>
      </motion.div>
    </>
  );
};

export default ContextMenu;