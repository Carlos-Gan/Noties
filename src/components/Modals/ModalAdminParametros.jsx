import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ModalAdminParametros = ({ isOpen, onClose, onAdd, camposActuales }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('text');

  const handleAdd = () => {
    if (!nombre) return;
    onAdd({
      id: nombre.toLowerCase().replace(/\s/g, '_'),
      label: nombre,
      type: tipo,
      value: tipo === 'multi-select' ? [] : '',
      icon: tipo === 'text' ? '🔗' : '🔹'
    });
    setNombre('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#242424] w-full max-w-md rounded-[32px] border border-white/10 p-8 relative shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Configurar Estructura de Clases</h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Campos actuales</p>
              {camposActuales.map(c => (
                <div key={c.id} className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/5 text-sm text-gray-300">
                  <span>{c.label}</span>
                  <span className="opacity-30 text-[10px] uppercase font-black">{c.type}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/20">
              <label className="text-[10px] text-blue-400 font-black uppercase mb-2 block">Añadir Nuevo Parámetro</label>
              <input 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white text-sm outline-none mb-3"
                placeholder="Ej: Link de Zoom, Salón..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <select 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-white text-sm outline-none cursor-pointer"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="text">Texto / Link</option>
                <option value="multi-select">Selección Múltiple (Días)</option>
                <option value="select">Selección Única (Horario)</option>
              </select>
              <button 
                onClick={handleAdd}
                className="w-full mt-4 bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
              >
                + Aplicar a todas las materias
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalAdminParametros;