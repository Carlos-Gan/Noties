import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DIAS,
  MESES,
  diasEnMes,
  primerDiaSemana,
  mismodia,
} from "./tareaHelpers";

// ─── Componente Calendario ─────────────────────────────────────────
const CalendarioView = ({
  tareas,
  materias,
  onDiaClick,
  onDiaClickDerecho,
  diaSeleccionado,
}) => {
  const [mes, setMes] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const colorMateria = useMemo(() => {
    const map = {};
    materias.forEach((m) => {
      map[m.id] = m.color || "#3b82f6";
    });
    return map;
  }, [materias]);

  // Indexar tareas por día
  const tareasPorDia = useMemo(() => {
    const map = {};
    tareas.forEach((t) => {
      if (!t.fecha_limite) return;
      const f = new Date(t.fecha_limite);
      if (f.getMonth() !== mes || f.getFullYear() !== year) return;
      const key = f.getDate();
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tareas, mes, year]);

  const totalDias = diasEnMes(year, mes);
  const offset = primerDiaSemana(year, mes);
  const celdas = Array.from({ length: offset + totalDias }, (_, i) =>
    i < offset ? null : i - offset + 1,
  );

  const cambiarMes = (dir) => {
    let nm = mes + dir;
    let ny = year;
    if (nm < 0) {
      nm = 11;
      ny--;
    }
    if (nm > 11) {
      nm = 0;
      ny++;
    }
    setMes(nm);
    setYear(ny);
  };

  // Función para manejar clic izquierdo
  const handleClick = (e, fechaDelDia) => {
    e.preventDefault(); // Por si acaso
    onDiaClick(fechaDelDia);
  };

  // Función para manejar clic derecho
  const handleContextMenu = (e, fechaDelDia) => {
    e.preventDefault(); // Evita el menú contextual del navegador
    if (onDiaClickDerecho) {
      onDiaClickDerecho(fechaDelDia);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-6">
      {/* Header mes */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => cambiarMes(-1)}
          className="text-gray-500 hover:text-white transition-colors p-1 text-lg"
        >
          ‹
        </button>
        <h3 className="text-white font-bold text-sm">
          {MESES[mes]} {year}
        </h3>
        <button
          onClick={() => cambiarMes(1)}
          className="text-gray-500 hover:text-white transition-colors p-1 text-lg"
        >
          ›
        </button>
      </div>

      {/* Días de semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-gray-600 font-black uppercase py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`empty-${i}`} className="aspect-square" />;

          const fechaDelDia = new Date(year, mes, dia);
          const esHoy = mismodia(fechaDelDia, new Date());
          const esSel =
            diaSeleccionado && mismodia(fechaDelDia, diaSeleccionado);
          const tareasDelDia = tareasPorDia[dia] || [];

          return (
            <motion.button
              key={dia}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => handleClick(e, fechaDelDia)}
              onContextMenu={(e) => handleContextMenu(e, fechaDelDia)}
              className={`relative flex flex-col items-center p-2 rounded-xl transition-all min-h-[52px] group ${
                esSel
                  ? "bg-blue-600 ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1e1e1e]"
                  : esHoy
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5 cursor-pointer"
              }`}
            >
              <span
                className={`text-[11px] font-bold ${
                  esSel ? "text-white" : esHoy ? "text-white" : "text-gray-400"
                }`}
              >
                {dia}
              </span>

              {/* Indicadores de tareas */}
              {tareasDelDia.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-0.5 mt-1 px-1">
                  {tareasDelDia.slice(0, 3).map((t, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          colorMateria[t.materia_id] || "#3b82f6",
                      }}
                      title={t.nombre}
                    />
                  ))}
                  {tareasDelDia.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                  +
                </span>
              )}

              {/* Tooltip con info */}
              {tareasDelDia.length > 0 && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#2a2a2a] border border-white/10 rounded-lg text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {tareasDelDia.length} tarea
                  {tareasDelDia.length !== 1 ? "s" : ""}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-[9px] text-gray-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Clic izquierdo: filtrar día</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Clic derecho: crear tarea</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-white/20 rounded" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioView;