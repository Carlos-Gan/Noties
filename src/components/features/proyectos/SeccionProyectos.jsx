import { useState } from "react";

const ESTADOS = [
  { key: "pendiente", label: "Pendiente", color: "bg-blue-500" },
  { key: "en_progreso", label: "En Progreso", color: "bg-green-500" },
  { key: "entregado", label: "Entregado", color: "bg-orange-500" },
];

const PRIORIDAD_COLOR = {
  alta: "text-red-400",
  media: "text-yellow-400",
  baja: "text-gray-500",
};

const SeccionProyectos = ({
  proyectos = [],
  materias = [],
  filtroMateria = "Todas",
  setFiltroMateria,
}) => {
  const proyectosFiltrados = proyectos.filter(p =>
    filtroMateria === "Todas" || p.materia_nombre === filtroMateria
  );

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Proyectos</h2>

        <select
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
          className="bg-[#252525] border border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest p-2 outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
        >
          <option value="Todas">Todas las materias</option>
          {materias.map(m => (
            <option key={m.id} value={m.nombre}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {ESTADOS.map(({ key, label, color }) => {
          const lista = proyectosFiltrados.filter(p => p.estado === key);
          return (
            <div key={key} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  {label}
                </span>
                <span className="text-[10px] text-gray-600 font-bold ml-auto">
                  {lista.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 min-h-[100px]">
                {lista.map(proyecto => (
                  <div
                    key={proyecto.id}
                    className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl group hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-lg mt-0.5">🔨</span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                          {proyecto.nombre}
                        </h3>
                        <p className="text-[10px] text-blue-500/80 font-black uppercase tracking-wider">
                          {proyecto.materia_nombre}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                      <span className="text-gray-600">
                        📅 {proyecto.fecha_limite || "Sin fecha"}
                      </span>
                      {proyecto.prioridad && (
                        <span className={PRIORIDAD_COLOR[proyecto.prioridad]}>
                          {proyecto.prioridad}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {lista.length === 0 && (
                  <div className="h-24 border border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] text-gray-700 font-bold uppercase">Vacío</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccionProyectos;