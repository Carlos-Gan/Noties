
const CardMateria = ({
  titulo,
  profesor,
  estado,
  semestre,
  color = "bg-blue-600",
  tareasPendientes = [],
  proyectosPendientes = [],
  configSecciones,
  notasCount = 0,
  onClick,
}) => {

  const estadoColors = {
    "En curso": "bg-green-500/20 text-green-400 border-green-500/10",
    "Finalizada": "bg-blue-500/20 text-blue-400 border-blue-500/10",
    "Pendiente": "bg-yellow-500/20 text-yellow-400 border-yellow-500/10",
  };

  return (
    <div
      onClick={onClick}
      className="
      group
      bg-[#2a2a2a]
      p-6
      rounded-[28px]
      border border-white/5
      hover:border-white/10
      hover:bg-[#2f2f2f]
      transition-all
      cursor-pointer
      shadow-xl
      relative
      overflow-hidden
      flex flex-col
      min-h-[340px]
      active:scale-[0.98]
      "
    >

      {/* SEMESTRE GRANDE */}
      <div className="absolute right-[-10px] top-[-20px] pointer-events-none select-none z-0">
        <span className="text-[140px] font-black text-white/[0.03] group-hover:text-white/[0.07] transition-colors leading-none">
          {semestre}
        </span>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 z-10">

        <div
          className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}
        >
          📚
        </div>

        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
            estadoColors[estado] || "bg-white/5 text-gray-400"
          }`}
        >
          {estado}
        </span>

      </div>

      {/* TITULO */}
      <div className="mb-6 z-10">

        <h3 className="font-bold text-2xl text-white group-hover:text-blue-400 transition-colors leading-tight mb-1">
          {titulo}
        </h3>

        <p className="text-sm text-gray-500 font-medium">
          Prof. {profesor || "No asignado"}
        </p>

      </div>

      {/* PENDIENTES */}
      <div className="flex-1 z-10">

        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black mb-3 italic">
          Pendientes críticos
        </p>

        <div className="space-y-2">

          {tareasPendientes.length > 0 || proyectosPendientes.length > 0 ? (
            <>
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

              {proyectosPendientes.slice(0, 1).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20"
                >
                  <span className="text-xs">🚀</span>
                  <p className="text-[11px] text-blue-200 font-bold truncate">
                    {item.nombre}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <p className="text-[11px] text-gray-700 italic py-2">
              Sin pendientes ✨
            </p>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between z-10">

        <span className="text-[10px] text-gray-500 font-bold uppercase">
          Semestre {semestre}º
        </span>

        <div className="flex items-center -space-x-2">

          {/* TAREAS */}
          <div
            className={`w-7 h-7 rounded-full ${
              configSecciones?.Tareas?.color || "bg-blue-600"
            } border-[3px] border-[#2a2a2a] flex items-center justify-center text-[10px] text-white font-bold shadow-lg`}
            title="Tareas"
          >
            {tareasPendientes.length}
          </div>

          {/* PROYECTOS */}
          <div
            className={`w-7 h-7 rounded-full ${
              configSecciones?.Proyectos?.color || "bg-orange-500"
            } border-[3px] border-[#2a2a2a] flex items-center justify-center text-[10px] text-white font-bold shadow-lg`}
            title="Proyectos"
          >
            {proyectosPendientes.length}
          </div>

        </div>

      </div>
    </div>
  );
};

export default CardMateria;