import { useState, useEffect, useMemo } from "react";

// ─── Helpers ──────────────────────────────────────────────────────
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const hoy = () => new Date();

const mismodia = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const diasEnMes = (year, month) => new Date(year, month + 1, 0).getDate();
const primerDiaSemana = (year, month) => new Date(year, month, 1).getDay();

const colorUrgencia = {
  vencida: "text-red-400 bg-red-500/10 border-red-500/20",
  hoy: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  manana: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  pronto: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  semana: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  normal: "text-gray-400 bg-white/5 border-white/5",
};

const prioridadIcon = { alta: "🔴", media: "🟡", baja: "🟢" };

// ─── Componente Calendario ─────────────────────────────────────────
const CalendarioView = ({ tareas, materias, onDiaClick, diaSeleccionado }) => {
  const [mes, setMes] = useState(hoy().getMonth());
  const [year, setYear] = useState(hoy().getFullYear());

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

  return (
    <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-6">
      {/* Header mes */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => cambiarMes(-1)}
          className="text-gray-500 hover:text-white transition-colors p-1"
        >
          ‹
        </button>
        <h3 className="text-white font-bold text-sm">
          {MESES[mes]} {year}
        </h3>
        <button
          onClick={() => cambiarMes(1)}
          className="text-gray-500 hover:text-white transition-colors p-1"
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
          if (!dia) return <div key={`empty-${i}`} />;
          const fechaDelDia = new Date(year, mes, dia);
          const esHoy = mismodia(fechaDelDia, hoy());
          const esSel =
            diaSeleccionado && mismodia(fechaDelDia, diaSeleccionado);
          const tareasDelDia = tareasPorDia[dia] || [];

          return (
            // Cambia el botón de cada celda por esto:
            <button
              key={dia}
              onClick={() => onDiaClick(fechaDelDia)} // ← siempre pasa la fecha, no solo si hay tareas
              className={`relative flex flex-col items-center p-1.5 rounded-xl transition-all min-h-[44px] group ${
                esSel
                  ? "bg-blue-600"
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

              {tareasDelDia.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                  {tareasDelDia.slice(0, 3).map((t, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          colorMateria[t.materia_id] || "#3b82f6",
                      }}
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
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarioView;
