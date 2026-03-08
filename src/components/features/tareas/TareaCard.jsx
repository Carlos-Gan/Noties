import { motion } from "framer-motion";

const formatFecha = (fechaStr) => {
  if (!fechaStr) return null;
  const f = new Date(fechaStr);
  const now = new Date(); // ← directo, sin hoy()
  const diff = Math.ceil((f - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Vencida", urgencia: "vencida" };
  if (diff === 0) return { label: "Hoy", urgencia: "hoy" };
  if (diff === 1) return { label: "Mañana", urgencia: "manana" };
  if (diff <= 3) return { label: `En ${diff} días`, urgencia: "pronto" };
  if (diff <= 7) return { label: `En ${diff} días`, urgencia: "semana" };
  return {
    label: f.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
    urgencia: "normal",
  };
};

const colorUrgencia = {
  vencida: "text-red-400 bg-red-500/10 border-red-500/20",
  hoy: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  manana: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  pronto: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  semana: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  normal: "text-gray-400 bg-white/5 border-white/5",
};

const prioridadIcon = { alta: "🔴", media: "🟡", baja: "🟢" };

// ─── Tarjeta de tarea ──────────────────────────────────────────────
const TareaCard = ({ tarea, onToggle, colorMateria }) => {
  const fecha = formatFecha(tarea.fecha_limite);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 bg-[#1e1e1e] rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(tarea.id)}
        className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
        style={{ borderColor: colorMateria || "#3b82f6" }}
      >
        {tarea.completada ? (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colorMateria || "#3b82f6" }}
          />
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${tarea.completada ? "line-through text-gray-600" : "text-white"}`}
        >
          {tarea.nombre}
        </p>
        {tarea.descripcion && (
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            {tarea.descripcion}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px]">
            {prioridadIcon[tarea.prioridad] || "🟡"}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              color: colorMateria,
              backgroundColor: `${colorMateria}15`,
            }}
          >
            {tarea.materia_nombre || "Sin materia"}
          </span>
          {fecha && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorUrgencia[fecha.urgencia]}`}
            >
              {fecha.label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TareaCard;
