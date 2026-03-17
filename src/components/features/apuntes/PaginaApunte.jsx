import { useState, useEffect, useCallback, useRef } from "react";
import EditorApunte from "./EditorApunte/EditorApunte";

export default function PaginaApunte({ apunteId }) {
  const [apunte, setApunte] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!apunteId) return;

    const cargarApunte = async () => {
      try {
        const data = await window.electronAPI.apuntes.getOne(apunteId);
        setApunte({
          ...data,
          contenido: data.contenido ? JSON.parse(data.contenido) : null,
        });
        setError(null);
      } catch (err) {
        console.error("Error cargando apunte:", err);
        setError("No se pudo cargar el apunte");
      }
    };

    cargarApunte();
  }, [apunteId]);

  const guardarApunte = useCallback(
    async (nuevoContenido, nuevoTitulo) => {
      try {
        await window.electronAPI.apuntes.guardar({
          id: apunteId,
          titulo: nuevoTitulo,
          contenido: nuevoContenido,
        });
        setGuardando(false);
      } catch (err) {
        console.error("Error guardando apunte:", err);
        setGuardando(false);
      }
    },
    [apunteId],
  );

  const handleCambio = useCallback(
    (nuevoContenido) => {
      setApunte((prev) => ({ ...prev, contenido: nuevoContenido }));

      if (timerRef.current) clearTimeout(timerRef.current);
      setGuardando(true);

      timerRef.current = setTimeout(() => {
        guardarApunte(nuevoContenido, apunte?.titulo);
      }, 1500);
    },
    [guardarApunte, apunte?.titulo],
  );

  const handleTituloChange = (e) => {
    const nuevoTitulo = e.target.value;
    setApunte((prev) => ({ ...prev, titulo: nuevoTitulo }));

    if (timerRef.current) clearTimeout(timerRef.current);
    setGuardando(true);

    timerRef.current = setTimeout(() => {
      guardarApunte(apunte?.contenido, nuevoTitulo);
    }, 1500);
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        {error}
      </div>
    );
  }

  if (!apunte) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Cargando apunte...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <input
          value={apunte.titulo || ""}
          onChange={handleTituloChange}
          className="bg-transparent text-white text-xl font-semibold focus:outline-none w-full placeholder:text-gray-700"
          placeholder="Sin título"
        />
        <span className="text-white/30 text-xs ml-4 shrink-0">
          {guardando ? "Guardando..." : "Guardado"}
        </span>
      </div>

      {/* Editor */}
      <EditorApunte contenido={apunte.contenido} onChange={handleCambio} />
    </div>
  );
}
