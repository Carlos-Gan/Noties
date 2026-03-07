import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

const MateriaDetalle = ({ materia, onVolver, configSecciones }) => {
  const [notas, setNotas] = useState([]);
  const [notaActiva, setNotaActiva] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");

  // 1. Cargar notas de esta materia al entrar
  const cargarNotas = useCallback(async () => {
    const data = await window.electron.invoke("notas:getByMateria", materia.id);
    setNotas(data);
    if (data.length > 0 && !notaActiva) {
      seleccionarNota(data[0]);
    }
  }, [materia.id]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  // 2. Lógica de Auto-guardado (Debounce)
  useEffect(() => {
    if (!notaActiva) return;

    const delayDebounceFn = setTimeout(async () => {
      await window.electron.invoke("notas:update", {
        id: notaActiva.id,
        titulo,
        contenido
      });
      // Actualizar la lista lateral sin recargar todo
      setNotas(prev => prev.map(n => n.id === notaActiva.id ? { ...n, titulo } : n));
    }, 1000); // Guarda tras 1 segundo de inactividad

    return () => clearTimeout(delayDebounceFn);
  }, [titulo, contenido, notaActiva]);

  const seleccionarNota = (nota) => {
    setNotaActiva(nota);
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
  };

  const crearNota = async () => {
    const nueva = await window.electron.invoke("notas:crear", {
      materia_id: materia.id,
      titulo: "Nuevo Apunte",
      contenido: ""
    });
    setNotas([nueva, ...notas]);
    seleccionarNota(nueva);
  };

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white">
      {/* Panel Izquierdo: Lista de Apuntes */}
      <aside className="w-72 border-r border-white/5 flex flex-col bg-[#161616]">
        <div className="p-6">
          <button onClick={onVolver} className="text-[10px] text-gray-500 uppercase font-black mb-4 hover:text-white transition-colors">
            ← Dashboard
          </button>
          <h2 className="text-xl font-bold truncate mb-1">{materia.nombre}</h2>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-6">Apuntes de Clase</p>
          
          <button 
            onClick={crearNota}
            className={`w-full py-3 ${configSecciones?.Apuntes?.color || 'bg-blue-600'} rounded-2xl text-xs font-bold shadow-lg transition-transform active:scale-95`}
          >
            + Nueva Nota
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {notas.map(nota => (
            <div
              key={nota.id}
              onClick={() => seleccionarNota(nota)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${notaActiva?.id === nota.id ? 'bg-white/5 border border-white/10' : 'hover:bg-white/[0.02] border border-transparent'}`}
            >
              <p className="text-sm font-bold truncate">{nota.titulo || "Sin título"}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-black">
                {new Date(nota.fecha_creacion).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Panel Derecho: Editor dual (Markdown) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {notaActiva ? (
          <>
            <div className="p-10 pb-4">
              <input 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="bg-transparent text-5xl font-black outline-none w-full placeholder:text-white/10" 
                placeholder="Título del apunte..." 
              />
            </div>
            
            <div className="flex-1 flex overflow-hidden p-10 pt-0 gap-10">
              {/* Editor de Texto Plano */}
              <textarea 
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="flex-1 bg-transparent outline-none resize-none font-mono text-gray-400 leading-relaxed border-r border-white/5 pr-10 focus:text-gray-200 transition-colors"
                placeholder="Escribe en Markdown... (Ej: # Tema 1)"
              />
              
              {/* Vista Previa Renderizada */}
              <div className="flex-1 overflow-y-auto prose prose-invert prose-blue max-w-none">
                <ReactMarkdown>{contenido}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <p className="italic">Selecciona o crea una nota para empezar.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MateriaDetalle;