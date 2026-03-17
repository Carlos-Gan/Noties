import {
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiTarget,
  FiLayers,
  FiArrowRight,
} from "react-icons/fi";

const PredictorHeader = ({ vista, setVista, onNavigateToDashboard }) => {
  const tabs = [
    { id: "general", icon: FiPieChart, label: "General" },
    { id: "unidades", icon: FiLayers, label: "Unidades" },
    { id: "detalle", icon: FiBarChart2, label: "Detalle" },
    { id: "simulacion", icon: FiTarget, label: "Simular" },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <FiTrendingUp className="text-purple-400" size={20} />
        <h2 className="text-lg font-bold text-white">Grade Predictor</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setVista(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  vista === tab.id
                    ? "text-white bg-purple-600"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onNavigateToDashboard?.("evaluaciones")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all group"
        >
          <span>Gestionar evaluaciones</span>
          <FiArrowRight
            className="group-hover:translate-x-1 transition-transform"
            size={14}
          />
        </button>
      </div>
    </div>
  );
};

export default PredictorHeader;
