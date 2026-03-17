const PredictorKPIs = ({ statsGenerales }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-2xl font-black text-white">
          {statsGenerales.promedioGeneral}
        </p>
        <p className="text-[9px] text-gray-600 mt-1">Promedio Actual</p>
      </div>
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <p className="text-2xl font-black text-white">
          {statsGenerales.materiasBien}
        </p>
        <p className="text-[9px] text-gray-600 mt-1">Materias bien</p>
      </div>
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-2xl font-black text-white">
          {statsGenerales.materiasRiesgo}
        </p>
        <p className="text-[9px] text-gray-600 mt-1">En riesgo</p>
      </div>
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <p className="text-2xl font-black text-white">
          {statsGenerales.evaluacionesPendientes}
        </p>
        <p className="text-[9px] text-gray-600 mt-1">Por calificar</p>
      </div>
    </div>
  );
};

export default PredictorKPIs;
