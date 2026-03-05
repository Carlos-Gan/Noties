import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ModalNombre({ onGuardar }) {
  const [nombre, setNombre] = useState('');

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#141414]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="bg-[#242424] w-full max-w-md rounded-[32px] border border-white/10 p-10 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-[32px]" />

        <h2 className="text-2xl font-bold text-white mb-2">
          ¿Cómo te llamas? 👋
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Solo te lo preguntamos una vez.
        </p>

        <input
          autoFocus
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && nombre.trim() && onGuardar(nombre.trim())}
          placeholder="Tu nombre..."
          className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-white text-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 mb-6"
        />

        <button
          onClick={() => nombre.trim() && onGuardar(nombre.trim())}
          disabled={!nombre.trim()}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Entrar →
        </button>
      </motion.div>
    </div>
  );
}