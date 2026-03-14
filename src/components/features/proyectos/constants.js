import { FiClock, FiLayers, FiCheckCircle } from "react-icons/fi";

export const ESTADOS = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: FiClock,
  },
  en_progreso: {
    label: "En progreso",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: FiLayers,
  },
  entregado: {
    label: "Entregado",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: FiCheckCircle,
  },
};
