import { FiBarChart2, FiCheckCircle, FiClock, FiAward } from "react-icons/fi";

const EvaluacionKPIs = ({ estadisticas }) => {
  const kpis = [
    {
      id: "total",
      icon: FiBarChart2,
      value: estadisticas.total,
      label: "Total evaluaciones",
      bg: "bg-gradient-to-br from-purple-600 to-indigo-800",
      color: "text-white/80",
    },
    {
      id: "evaluadas",
      icon: FiCheckCircle,
      value: estadisticas.evaluadas,
      label: "Evaluadas",
      bg: "bg-green-600/20 border border-green-500/30",
      color: "text-green-400",
    },
    {
      id: "pendientes",
      icon: FiClock,
      value: estadisticas.pendientes,
      label: "Pendientes",
      bg: "bg-yellow-600/20 border border-yellow-500/30",
      color: "text-yellow-400",
    },
    {
      id: "materias",
      icon: FiAward,
      value: Object.keys(estadisticas.porMateria).length,
      label: "Materias",
      bg: "bg-blue-600/20 border border-blue-500/30",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.id} className={`${kpi.bg} rounded-2xl p-4`}>
            <Icon className={`${kpi.color} mb-2`} size={20} />
            <p className="text-2xl font-black text-white">{kpi.value}</p>
            <p className="text-xs text-gray-400">{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default EvaluacionKPIs;