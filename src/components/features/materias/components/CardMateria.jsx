import { useMemo } from "react";

const CardMateria = ({
  titulo,
  profesor,
  estado,
  semestre,
  color = "bg-blue-600",
  tareasPendientes = [],
  proyectosPendientes = [], // <--- Ya tienes los proyectos de ESTA materia aquí
  configSecciones,
  onClick,
  onContextMenu
}) => {
  const estadoColors = {
    "En curso": "bg-green-500/20 text-green-400 border-green-500/10",
    Finalizada: "bg-blue-500/20 text-blue-400 border-blue-500/10",
    Pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/10",
  };

  // CORRECCIÓN: Contamos los proyectos pendientes de esta materia específica
  const totalPendientesMateria = useMemo(() => {
    return proyectosPendientes.filter((p) => p.estado !== "entregado").length;
  }, [proyectosPendientes]);

  return (
    <div
      onClick={onClick}
      className="group bg-[#2a2a2a] p-6 rounded-[28px] border border-white/5 hover:border-white/10 hover:bg-[#2f2f2f] transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col min-h-[340px] active:scale-[0.98]"
      onContextMenu={onContextMenu}
    >
      {/* SEMESTRE DE FONDO */}
      <div className="absolute right-[-10px] top-[-20px] pointer-events-none select-none z-0">
        <span className="text-[140px] font-black text-white/[0.03] group-hover:text-white/[0.07] transition-colors leading-none">
          {semestre}
        </span>
      </div>

      {/* HEADER: ICONO Y ESTADO */}
      <div className="flex justify-between items-start mb-6 z-10">
        <div
          className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-black/20`}
        >
          📚
        </div>

        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${estadoColors[estado] || "bg-white/5 text-gray-400"}`}
        >
          {estado}
        </span>
      </div>

      {/* TÍTULO Y PROFESOR */}
      <div className="mb-6 z-10">
        <h3 className="font-bold text-2xl text-white group-hover:text-blue-400 transition-colors leading-tight mb-1">
          {titulo}
        </h3>
        <p className="text-sm text-gray-500 font-medium">
          Prof. {profesor || "No asignado"}
        </p>
      </div>

      {/* SECCIÓN DE PENDIENTES */}
      <div className="flex-1 z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black mb-3 italic">
          Pendientes críticos
        </p>

        <div className="space-y-2">
          {/* TAREAS (Muestra las 2 primeras) */}
          {tareasPendientes.slice(0, 2).map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5"
            >
              <span className="text-xs">✅</span>
              <p className="text-[11px] text-gray-200 font-bold truncate">
                {item.nombre}
              </p>
            </div>
          ))}

          {/* PROYECTO (Muestra el más próximo + contador) */}
          {proyectosPendientes.length > 0 ? (
            <div className="space-y-2">
              {proyectosPendientes.slice(0, 1).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between bg-blue-500/10 p-2.5 rounded-2xl border border-blue-400/20 group-hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs">🚀</span>
                    <p className="text-[11px] text-blue-100 font-black truncate tracking-tight">
                      {item.nombre}
                    </p>
                  </div>

                  {totalPendientesMateria > 1 && (
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg font-black">
                      +{totalPendientesMateria - 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            tareasPendientes.length === 0 && (
              <p className="text-[11px] text-gray-700 italic py-2">
                Sin pendientes ✨
              </p>
            )
          )}
        </div>
      </div>

      {/* FOOTER: INDICADORES CIRCULARES */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between z-10">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Semestre {semestre}º
        </span>

        <div className="flex items-center -space-x-2">
          {/* Contador Tareas */}
          <div
            className={`w-8 h-8 rounded-full bg-blue-600 border-[3px] border-[#2a2a2a] flex items-center justify-center text-[10px] text-white font-black shadow-lg`}
            title="Tareas pendientes"
          >
            {tareasPendientes.length}
          </div>

          {/* Contador Proyectos */}
          <div
            className={`w-8 h-8 rounded-full bg-orange-500 border-[3px] border-[#2a2a2a] flex items-center justify-center text-[10px] text-white font-black shadow-lg`}
            title="Proyectos pendientes"
          >
            {proyectosPendientes.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardMateria;
