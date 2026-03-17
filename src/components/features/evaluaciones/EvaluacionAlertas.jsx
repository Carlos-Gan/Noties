import { FiAlertTriangle } from "react-icons/fi";

const EvaluacionAlertas = ({ alertasUnidad, errorPorcentaje }) => {
  if (Object.keys(alertasUnidad).length === 0 && !errorPorcentaje) return null;

  return (
    <>
      {Object.keys(alertasUnidad).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <FiAlertTriangle size={18} />
            <h3 className="text-sm font-bold">Alertas de porcentaje</h3>
          </div>
          <div className="space-y-2">
            {Object.values(alertasUnidad).map((alerta) => (
              <div
                key={
                  alerta.tipo === "materia"
                    ? alerta.nombre
                    : `${alerta.materia}-${alerta.unidad}`
                }
                className="text-xs text-red-400/80 bg-red-500/5 p-2 rounded-lg"
              >
                {alerta.tipo === "materia" ? (
                  <>
                    La materia{" "}
                    <span className="font-bold text-white">
                      {alerta.nombre}
                    </span>{" "}
                    tiene {alerta.total}% (exceso de {alerta.exceso}%)
                  </>
                ) : (
                  <>
                    La{" "}
                    <span className="font-bold text-white">
                      {alerta.unidad}
                    </span>{" "}
                    de{" "}
                    <span className="font-bold text-white">
                      {alerta.materia}
                    </span>{" "}
                    tiene {alerta.total}% (exceso de {alerta.exceso}%)
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {errorPorcentaje && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <p className="text-xs text-red-400">{errorPorcentaje}</p>
        </div>
      )}
    </>
  );
};

export default EvaluacionAlertas;