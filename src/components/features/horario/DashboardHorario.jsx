import { useMemo } from "react";
import { motion } from "framer-motion";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

// Convierte "08:00" → minutos desde medianoche
const toMin = (t = "") => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

// Altura proporcional por minuto
const PX_PER_MIN = 1;
const HORA_INICIO = 7 * 60; // 07:00
const HORA_FIN = 22 * 60; // 22:00
const TOTAL_H = HORA_FIN - HORA_INICIO;

const horas = Array.from({ length: 16 }, (_, i) => i + 7); // 7..22 (inclusive)

export default function DashboardHorario({ materias = [] }) {
  const horarioPorDia = useMemo(() => {
    const mapa = {};
    DIAS.forEach((d) => (mapa[d] = []));

    materias.forEach((m) => {
      try {
        const meta = JSON.parse(m.metadata || "{}");
        // Usar 'horario' en lugar de 'horarios' para consistencia
        const horarios = meta.horario || meta.horarios || [];

        horarios.forEach((h) => {
          if (mapa[h.dia]) {
            mapa[h.dia].push({
              ...h,
              materia: m.nombre,
              color: m.color || "#3b82f6",
              icono: m.icono || "📚",
              aula: h.salon || h.aula || "", // Compatibilidad con ambos nombres
            });
          }
        });
      } catch (error) {
        console.error("Error parseando metadata:", error);
      }
    });

    // Ordenar por hora de inicio
    DIAS.forEach((d) => {
      mapa[d].sort((a, b) => a.inicio.localeCompare(b.inicio));
    });

    return mapa;
  }, [materias]);

  const totalAltura = TOTAL_H * PX_PER_MIN;

  // Verificar si hay clases para mostrar
  const tieneClases = Object.values(horarioPorDia).some(
    (arr) => arr.length > 0,
  );

  return (
    <div className="w-full h-full overflow-auto bg-[#111111] text-white px-6 py-6">
      {/* ── Header ── */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600 font-black mb-1">
          Semana actual
        </p>
        <h1 className="text-2xl font-black text-white">Horario</h1>
      </div>

      {!tieneClases ? (
        <div className="flex items-center justify-center h-64 bg-white/[0.02] rounded-2xl border border-white/5">
          <p className="text-gray-600 text-sm">No hay horarios definidos</p>
        </div>
      ) : (
        <div className="flex gap-3 min-w-0">
          {/* ── Eje de horas ── */}
          <div
            className="relative flex-shrink-0 w-12"
            style={{ height: totalAltura }}
          >
            {horas.map((h) => {
              const top = (h * 60 - HORA_INICIO) * PX_PER_MIN - 7;
              // Solo mostrar horas dentro del rango visible
              if (top < 0 || top > totalAltura) return null;

              return (
                <div
                  key={h}
                  className="absolute right-0 flex items-center justify-end pr-2"
                  style={{ top }}
                >
                  <span className="text-[9px] text-gray-600 font-bold tabular-nums">
                    {h.toString().padStart(2, "0")}:00
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Columnas por día ── */}
          {DIAS.map((dia, dIdx) => (
            <div key={dia} className="flex-1 flex flex-col min-w-[130px]">
              {/* Cabecera del día */}
              <div className="mb-2 text-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                  {dia}
                </span>
              </div>

              {/* Grid con líneas de horas */}
              <div
                className="relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5"
                style={{ height: totalAltura }}
              >
                {/* Líneas horizontales cada hora */}
                {horas.map((h) => {
                  const top = (h * 60 - HORA_INICIO) * PX_PER_MIN;
                  if (top < 0 || top > totalAltura) return null;

                  return (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-white/[0.04]"
                      style={{ top }}
                    />
                  );
                })}

                {/* Línea "hora actual" solo si hoy cae en ese día */}
                <HoraActual dia={dIdx} totalAltura={totalAltura} />

                {/* Bloques de clase */}
                {horarioPorDia[dia].map((clase, i) => {
                  const top = (toMin(clase.inicio) - HORA_INICIO) * PX_PER_MIN;
                  const height = Math.max(
                    (toMin(clase.fin) - toMin(clase.inicio)) * PX_PER_MIN,
                    32, // Altura mínima para legibilidad
                  );

                  // Evitar que se salga del contenedor
                  if (top + height > totalAltura || top < 0) return null;

                  return (
                    <motion.div
                      key={`${clase.materia}-${i}`}
                      initial={{ opacity: 0, scaleY: 0.85 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{
                        delay: dIdx * 0.05 + i * 0.04,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="absolute left-1 right-1 rounded-xl overflow-hidden flex flex-col justify-between px-2.5 py-2 cursor-default group hover:brightness-110 transition-all"
                      style={{
                        top,
                        height,
                        backgroundColor: `${clase.color}22`,
                        borderLeft: `3px solid ${clase.color}`,
                        boxShadow: `0 4px 12px ${clase.color}20`,
                      }}
                    >
                      <div>
                        <p
                          className="text-[11px] font-black leading-tight truncate"
                          style={{ color: clase.color }}
                        >
                          {clase.icono} {clase.materia}
                        </p>
                        {height > 40 && (
                          <p className="text-[8px] text-gray-500 font-bold mt-1 tabular-nums">
                            {clase.inicio} – {clase.fin}
                          </p>
                        )}
                      </div>
                      {clase.aula && height > 56 && (
                        <p className="text-[8px] text-gray-600 font-bold truncate">
                          🏫 {clase.aula}
                        </p>
                      )}
                    </motion.div>
                  );
                })}

                {/* Estado vacío para el día */}
                {horarioPorDia[dia].length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-gray-800 font-bold">
                      Sin clases
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Línea roja de hora actual ──────────────────────────────────────
function HoraActual({ dia, totalAltura }) {
  const hoy = new Date().getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  const diasSemana = [1, 2, 3, 4, 5]; // Lun=1, Mar=2, Mié=3, Jue=4, Vie=5

  // Si no es el día actual o el día no está en nuestro rango
  if (hoy !== diasSemana[dia]) return null;

  const now = new Date();
  const minNow = now.getHours() * 60 + now.getMinutes();

  // Solo mostrar si está dentro del horario visible
  if (minNow < HORA_INICIO || minNow > HORA_FIN) return null;

  const top = (minNow - HORA_INICIO) * PX_PER_MIN;

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
      style={{ top }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1 flex-shrink-0 shadow-lg shadow-red-500/50" />
      <div className="flex-1 h-px bg-gradient-to-r from-red-500/60 to-red-500/20" />
    </div>
  );
}
