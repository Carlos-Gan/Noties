import { useState, useMemo, useCallback, useEffect } from "react";

// --- Sub-componentes para limpiar el componente principal ---

const StatBox = ({ label, value }) => (
  <div className="flex flex-col items-center py-4 border-r border-white/5 last:border-r-0">
    <span className="text-lg font-black text-white">{value}</span>
    <span className="text-[9px] text-gray-600 uppercase font-bold">
      {label}
    </span>
  </div>
);

const Badge = ({ children, color, className = "" }) => (
  <span
    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${className}`}
    style={color ? { color: color, backgroundColor: `${color}25` } : {}}
  >
    {children}
  </span>
);

// --- Componente Principal ---

const SidebarMateria = ({ materia, stats, onVerApuntes }) => {
  const [editando, setEditando] = useState(null);
  const [editandoCampo, setEditandoCampo] = useState(false);
  const [metadataLocal, setMetadataLocal] = useState(null);

  // Función para normalizar el horario (siempre usar 'horario' como propiedad única)
  const normalizarMetadata = (metadata) => {
    // Si existe 'horarios' pero no 'horario', usar 'horarios' como 'horario'
    if (metadata.horarios && !metadata.horario) {
      metadata.horario = metadata.horarios;
    }

    // Si existen ambos, asegurarse de que sean iguales y eliminar 'horarios'
    if (metadata.horario && metadata.horarios) {
      // Ya tenemos horario, podemos eliminar horarios
      delete metadata.horarios;
    }

    return metadata;
  };

  // Función para parsear el horario correctamente
  const parsearHorario = (horarioData) => {
    // Si ya es un array, retornarlo
    if (Array.isArray(horarioData)) {
      return horarioData;
    }

    // Si es un string, intentar parsearlo como JSON
    if (typeof horarioData === "string") {
      try {
        // Intentar parsear como JSON primero
        const parsed = JSON.parse(horarioData);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Si no es JSON válido, verificar si es el caso de "[object Object]"
        if (horarioData.includes("[object Object]")) {
          // Extraer los objetos del string y reconstruirlos
          const matches = horarioData.match(/\[object Object\]/g) || [];
          if (matches.length > 0) {
            // Devolver un array de objetos vacíos con valores por defecto
            return matches.map(() => ({
              dia: "Lunes",
              inicio: "08:00",
              fin: "10:00",
              salon: "",
            }));
          }
        }
      }
    }

    // Si todo falla, retornar array vacío
    return [];
  };

  // Actualizar metadataLocal cuando cambia materia
  useEffect(() => {
    try {
      const parsed = JSON.parse(materia.metadata || "{}");

      // Normalizar para usar siempre 'horario'
      const metadataNormalizado = normalizarMetadata(parsed);

      // Asegurar que existan campos por defecto
      if (!metadataNormalizado.prof) metadataNormalizado.prof = "";
      if (!metadataNormalizado.horario) metadataNormalizado.horario = [];
      if (!metadataNormalizado.links) metadataNormalizado.links = "";
      if (!metadataNormalizado.semestre) metadataNormalizado.semestre = 1;
      if (!metadataNormalizado.estado) metadataNormalizado.estado = "En curso";

      // Procesar el horario para asegurar que sea array
      metadataNormalizado.horario = parsearHorario(metadataNormalizado.horario);

      setMetadataLocal(metadataNormalizado);

      // Si había 'horarios', actualizar la base de datos para limpiarlo
      if (parsed.horarios) {
        guardarCambioSilencioso(metadataNormalizado);
      }
    } catch {
      // Valores por defecto si no hay metadata
      setMetadataLocal({
        prof: "",
        horario: [],
        links: "",
        semestre: 1,
        estado: "En curso",
      });
    }
  }, [materia.metadata]);

  // Función para guardar cambios sin disparar eventos (para limpieza)
  const guardarCambioSilencioso = async (metadata) => {
    try {
      await window.electronAPI.invoke("materias:updateMetadata", {
        id: materia.id,
        metadata: JSON.stringify(metadata),
      });
    } catch (error) {
      // Error silencioso
    }
  };

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleMateriasUpdated = (e) => {
      // Solo actualizar si no es el mismo componente el que disparó el evento
      if (e.detail?.materiaId !== materia.id) {
        try {
          const parsed = JSON.parse(materia.metadata || "{}");
          const metadataNormalizado = normalizarMetadata(parsed);
          metadataNormalizado.horario = parsearHorario(
            metadataNormalizado.horario || [],
          );
          setMetadataLocal((prev) => ({ ...prev, ...metadataNormalizado }));
        } catch (error) {
          // Error silencioso
        }
      }
    };

    window.addEventListener("materias-updated", handleMateriasUpdated);
    return () =>
      window.removeEventListener("materias-updated", handleMateriasUpdated);
  }, [materia.id, materia.metadata]);

  const ICONOS_CAMPO = {
    prof: "👨‍🏫",
    horario: "🕒",
    links: "🔗",
    semestre: "🔢",
    estado: "📊",
  };

  const guardarCambio = useCallback(
    async (key, nuevoValor) => {
      if (!metadataLocal) return;

      // Asegurarse de que horario siempre sea un array válido
      let valorParaGuardar = nuevoValor;

      if (key === "horario") {
        // Si no es un array, convertirlo a array vacío
        if (!Array.isArray(valorParaGuardar)) {
          valorParaGuardar = [];
        }

        // Limpiar cada objeto de horario para asegurar que tiene el formato correcto
        valorParaGuardar = valorParaGuardar.map((h) => ({
          dia: h.dia || "Lunes",
          inicio: h.inicio || "08:00",
          fin: h.fin || "10:00",
          salon: h.salon || "",
        }));
      }

      if (key === "semestre") {
        // Asegurar que semestre sea número
        valorParaGuardar = parseInt(valorParaGuardar) || 1;
      }

      // Crear nuevo metadata SOLO con la propiedad actualizada
      const nuevoMetadataLocal = {
        ...metadataLocal,
        [key]: valorParaGuardar,
      };

      // Actualizar estado local inmediatamente para feedback visual
      setMetadataLocal(nuevoMetadataLocal);

      try {
        await window.electronAPI.invoke("materias:updateMetadata", {
          id: materia.id,
          metadata: JSON.stringify(nuevoMetadataLocal),
        });

        // Disparar evento para actualizar otros componentes
        window.dispatchEvent(
          new CustomEvent("materias-updated", {
            detail: { materiaId: materia.id, campo: key },
          }),
        );
      } catch (error) {
        // Revertir cambio local si hay error
        setMetadataLocal(metadataLocal);
      } finally {
        setEditando(null);
        setEditandoCampo(false);
      }
    },
    [metadataLocal, materia.id],
  );

  const iniciarEdicion = (key, valorActual) => {
    setEditando(key);
    setEditandoCampo(true);
  };

  // --- Lógica de Renderizado de Celda ---

  const renderEditor = (key, val) => {
    const baseInputClass =
      "bg-black/40 border border-white/10 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-blue-500/50 transition-colors";

    if (key === "estado") {
      return (
        <select
          autoFocus
          value={val || "En curso"}
          onChange={(e) => guardarCambio(key, e.target.value)}
          onBlur={() => setEditando(null)}
          className={baseInputClass}
        >
          {["En curso", "Pendiente", "Finalizada"].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (key === "horario") {
      // Asegurarse de que horarios sea un array
      const horarios = Array.isArray(val) ? val : [];

      const actualizar = (i, campo, valor) => {
        const copia = [...horarios];
        copia[i] = { ...copia[i], [campo]: valor };
        guardarCambio(key, copia);
      };

      const agregarHorario = () => {
        const nuevoHorario = [
          ...horarios,
          { dia: "Lunes", inicio: "08:00", fin: "10:00", salon: "" },
        ];
        guardarCambio(key, nuevoHorario);
      };

      const eliminarHorario = (i) => {
        const copia = horarios.filter((_, index) => index !== i);
        guardarCambio(key, copia);
      };

      // Normalizar días para mostrar
      const diasSemana = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];

      return (
        <div className="space-y-2 animate-in fade-in duration-200">
          {horarios.map((h, i) => (
            <div
              key={i}
              className="flex gap-1 items-center bg-white/5 p-1 rounded-md relative group/horario"
            >
              <select
                value={h.dia || "Lunes"}
                onChange={(e) => actualizar(i, "dia", e.target.value)}
                className="bg-transparent text-[10px] p-1 w-20 text-white"
              >
                {diasSemana.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={h.inicio || "08:00"}
                onChange={(e) => actualizar(i, "inicio", e.target.value)}
                className="bg-transparent text-[10px] w-14 text-white"
              />
              <input
                type="time"
                value={h.fin || "10:00"}
                onChange={(e) => actualizar(i, "fin", e.target.value)}
                className="bg-transparent text-[10px] w-14 text-white"
              />
              <input
                type="text"
                value={h.salon || ""}
                onChange={(e) => actualizar(i, "salon", e.target.value)}
                placeholder="Salón"
                className="bg-transparent text-[10px] w-12 text-white placeholder:text-gray-600"
              />
              <button
                onClick={() => eliminarHorario(i)}
                className="text-gray-500 hover:text-red-400 text-xs ml-1 opacity-0 group-hover/horario:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button
              onClick={agregarHorario}
              className="text-[9px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded"
            >
              + Agregar horario
            </button>
            <button
              onClick={() => setEditando(null)}
              className="text-[9px] text-gray-500 hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      );
    }

    if (key === "semestre") {
      return (
        <input
          autoFocus
          type="number"
          min="1"
          max="12"
          value={val || 1}
          onChange={(e) => {
            // Solo actualizar el estado local, no guardar
            setMetadataLocal((prev) => ({
              ...prev,
              [key]: e.target.value,
            }));
          }}
          onBlur={(e) => guardarCambio(key, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              guardarCambio(key, e.target.value);
            }
          }}
          className={baseInputClass}
        />
      );
    }

    // Para prof, links y otros campos de texto
    return (
      <input
        autoFocus
        type="text"
        value={val || ""}
        onChange={(e) => {
          // SOLO actualizar el estado local, NO guardar todavía
          setMetadataLocal((prev) => ({
            ...prev,
            [key]: e.target.value,
          }));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            guardarCambio(key, e.target.value);
          }
        }}
        onBlur={(e) => guardarCambio(key, e.target.value)}
        className={baseInputClass}
      />
    );
  };

  const renderValor = (key, val) => {
    // valores vacíos
    if (!val || (Array.isArray(val) && val.length === 0)) {
      return <span className="text-gray-600 italic text-xs">Sin definir</span>;
    }

    // 📅 horario
    if (key === "horario") {
      // Asegurarse de que sea un array válido
      const horarios = Array.isArray(val) ? val : [];

      if (horarios.length === 0) {
        return (
          <span className="text-gray-600 italic text-xs">Sin horario</span>
        );
      }

      return (
        <div className="flex flex-col gap-1.5 mt-2">
          {horarios.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-tight">
                  {h.dia || "Sin día"}
                </span>

                <span className="text-[9px] text-gray-400">
                  {h.inicio || "00:00"} – {h.fin || "00:00"}
                </span>
              </div>

              {h.salon && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                  {h.salon}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }

    // 📊 estado
    if (key === "estado") {
      const colores = {
        "En curso": "text-green-400 bg-green-500/10",
        Finalizada: "text-gray-400 bg-white/5",
        Pendiente: "text-yellow-400 bg-yellow-500/10",
      };

      return (
        <span
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${colores[val] || ""}`}
        >
          {val}
        </span>
      );
    }

    // 🔗 links
    if (key === "links" && typeof val === "string" && val.startsWith("http")) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 text-xs hover:underline truncate block"
        >
          {val.replace(/(^\w+:|^)\/\//, "")}
        </a>
      );
    }

    // Profesor y otros textos
    if (typeof val === "string" && val.length > 0) {
      return <span className="text-gray-200 text-sm">{val}</span>;
    }

    // Números (semestre)
    if (typeof val === "number") {
      return <span className="text-gray-200 text-sm">{val}</span>;
    }

    // fallback seguro
    return <span className="text-gray-200 text-xs">{String(val)}</span>;
  };

  // Si metadataLocal es null, mostrar loading
  if (!metadataLocal) {
    return <div className="w-72 bg-[#0F0F0F] h-full" />;
  }

  return (
    <aside className="w-72 border-r border-white/5 flex flex-col bg-[#0F0F0F] text-slate-200 h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg"
          style={{
            backgroundColor: `${materia.color}20`,
            border: `1px solid ${materia.color}30`,
          }}
        >
          {materia.icono || "📚"}
        </div>
        <h2 className="text-lg font-bold text-white mb-1 leading-tight">
          {materia.nombre}
        </h2>
        <Badge color={materia.color}>
          {metadataLocal.estado || "En curso"}
        </Badge>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border-b border-white/5 bg-black/20">
        <StatBox label="Notas" value={stats.apuntes} />
        <StatBox label="Tareas" value={stats.tareasPendientes} />
        <StatBox label="Proyectos" value={stats.proyectos} />
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-center">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">
            Información
          </p>
          {!editandoCampo && (
            <span className="text-[8px] text-gray-600">
              Doble clic para editar
            </span>
          )}
        </header>

        <div className="space-y-5">
          {/* Campo Profesor */}
          <div
            onDoubleClick={() => iniciarEdicion("prof", metadataLocal.prof)}
            className="group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs grayscale group-hover:grayscale-0 transition-all">
                {ICONOS_CAMPO.prof}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Profesor
              </span>
            </div>

            <div className="pl-5 border-l border-white/5 group-hover:border-white/10 transition-colors">
              {editando === "prof"
                ? renderEditor("prof", metadataLocal.prof)
                : renderValor("prof", metadataLocal.prof)}
            </div>
          </div>

          {/* Campo Horario */}
          <div
            onDoubleClick={() =>
              iniciarEdicion("horario", metadataLocal.horario)
            }
            className="group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs grayscale group-hover:grayscale-0 transition-all">
                {ICONOS_CAMPO.horario}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Horario
              </span>
            </div>

            <div className="pl-5 border-l border-white/5 group-hover:border-white/10 transition-colors">
              {editando === "horario"
                ? renderEditor("horario", metadataLocal.horario)
                : renderValor("horario", metadataLocal.horario)}
            </div>
          </div>

          {/* Campo Links */}
          <div
            onDoubleClick={() => iniciarEdicion("links", metadataLocal.links)}
            className="group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs grayscale group-hover:grayscale-0 transition-all">
                {ICONOS_CAMPO.links}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Link / Aula Virtual
              </span>
            </div>

            <div className="pl-5 border-l border-white/5 group-hover:border-white/10 transition-colors">
              {editando === "links"
                ? renderEditor("links", metadataLocal.links)
                : renderValor("links", metadataLocal.links)}
            </div>
          </div>

          {/* Campo Semestre */}
          <div
            onDoubleClick={() =>
              iniciarEdicion("semestre", metadataLocal.semestre)
            }
            className="group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs grayscale group-hover:grayscale-0 transition-all">
                {ICONOS_CAMPO.semestre}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Semestre
              </span>
            </div>

            <div className="pl-5 border-l border-white/5 group-hover:border-white/10 transition-colors">
              {editando === "semestre"
                ? renderEditor("semestre", metadataLocal.semestre)
                : renderValor("semestre", metadataLocal.semestre)}
            </div>
          </div>

          {/* Campo Estado */}
          <div
            onDoubleClick={() => iniciarEdicion("estado", metadataLocal.estado)}
            className="group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs grayscale group-hover:grayscale-0 transition-all">
                {ICONOS_CAMPO.estado}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Estado
              </span>
            </div>

            <div className="pl-5 border-l border-white/5 group-hover:border-white/10 transition-colors">
              {editando === "estado"
                ? renderEditor("estado", metadataLocal.estado)
                : renderValor("estado", metadataLocal.estado)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-5 border-t border-white/5 bg-[#161616]">
        <button
          onClick={onVerApuntes}
          className="w-full py-3 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          📝 Ver Apuntes
        </button>
      </div>
    </aside>
  );
};

export default SidebarMateria;