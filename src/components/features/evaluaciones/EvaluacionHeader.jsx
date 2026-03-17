import { FiPlus } from "react-icons/fi";

const EvaluacionHeader = ({ total, pendientes, onNuevaEvaluacion }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-black text-white">Evaluaciones</h2>
        <p className="text-sm text-gray-500 mt-1">
          {total} evaluaciones · {pendientes} pendientes
        </p>
      </div>
      <button
        onClick={onNuevaEvaluacion}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all"
      >
        <FiPlus size={14} />
        Nueva evaluación
      </button>
    </div>
  );
};

export default EvaluacionHeader;