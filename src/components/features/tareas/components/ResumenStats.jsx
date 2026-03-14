import { motion } from "framer-motion";
import { FiAlertCircle, FiCalendar, FiClock } from "react-icons/fi";

const ResumenStats = ({ stats = { vencidas: 0, hoy: 0, semana: 0 } }) => {
  const items = [
    {
      label: "Vencidas",
      value: stats.vencidas || 0,
      icon: FiAlertCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Hoy",
      value: stats.hoy || 0,
      icon: FiClock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "7 días",
      value: stats.semana || 0,
      icon: FiCalendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${item.bg} ${item.border} border p-3 rounded-xl`}
          >
            <Icon className={`${item.color} mb-2`} size={16} />
            <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
            <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">
              {item.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ResumenStats;