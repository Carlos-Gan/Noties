// /components/features/tareas/utils/tareaHelpers.js
export const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const hoy = () => new Date();

export const mismodia = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const diasEnMes = (year, month) => new Date(year, month + 1, 0).getDate();
export const primerDiaSemana = (year, month) => new Date(year, month, 1).getDay();

export const colorUrgencia = {
  vencida: "text-red-400 bg-red-500/10 border-red-500/20",
  hoy: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  manana: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  pronto: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  semana: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  normal: "text-gray-400 bg-white/5 border-white/5",
};

export const prioridadIcon = { alta: "🔴", media: "🟡", baja: "🟢" };

export const formatFecha = (fechaStr) => {
  if (!fechaStr) return null;
  const f = new Date(fechaStr);
  const now = new Date();
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