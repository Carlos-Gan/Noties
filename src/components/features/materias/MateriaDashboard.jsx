import { useState, useEffect, useMemo } from "react";
import SeccionTareas from "./SeccionTareas";
import SeccionProyectos from "./SeccionProyectos";

// ─── Helpers ──────────────────────────────────────────────────────
const formatFecha = (fechaStr) => {
  if (!fechaStr) return null;
  const f = new Date(fechaStr);
  const now = new Date();
  const diff = Math.ceil((f - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Vencida", urgencia: "vencida" };
  if (diff === 0) return { label: "Hoy", urgencia: "hoy" };
  if (diff === 1) return { label: "Mañana", urgencia: "manana" };
  if (diff <= 7) return { label: `En ${diff} días`, urgencia: "pronto" };
  return { label: f.toLocaleDateString("es-MX", { day: "numeric", month: "short" }), urgencia: "normal" };
};

const colorUrgencia = {
  vencida: "text-red-400 bg-red-500/10",
  hoy:     "text-orange-400 bg-orange-500/10",
  manana:  "text-yellow-400 bg-yellow-500/10",
  pronto:  "text-blue-400 bg-blue-500/10",
  normal:  "text-gray-400 bg-white/5",
};

// ─── Sidebar con metadata ──────────────────────────────────────────
const SidebarMateria = ({ materia, stats, onVerApuntes }) => {
  const metadata = useMemo(() => {
    try { return JSON.parse(materia.metadata || "{}"); }
    catch { return {}; }
  }, [materia.metadata]);

  const ICONOS_CAMPO = {
    prof: "👨‍🏫", dias: "📅", hora: "⏰",
    links: "🔗", semestre: "🔢", estado: "✅",
  };

  const renderValor = (key, val) => {
    if (!val || val === "" || (Array.isArray(val) && val.length === 0)) {
      return <span className="text-gray-600 italic text-xs">Sin definir</span>;
    }
    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {val.map((v, i) => (
            <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
              style={{ color: materia.color, borderColor: `${materia.color}40`, backgroundColor: `${materia.color}15` }}>
              {v}
            </span>
          ))}
        </div>
      );
    }
    if (key === "estado") {
      const colores = {
        "En curso":   "text-green-400 bg-green-500/10",
        "Finalizada": "text-gray-400 bg-white/5",
        "Pendiente":  "text-yellow-400 bg-yellow-500/10",
      };
      return (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${colores[val] || "text-gray-400"}`}>
          {val}
        </span>
      );
    }
    if (key === "links" && val.startsWith("http")) {
      return (
        <a href={val} target="_blank" rel="noreferrer"
          className="text-blue-400 text-xs hover:underline truncate block max-w-full">
          {val}
        </a>
      );
    }
    return <span className="text-white text-xs">{val}</span>;
  };

  return (
    <aside className="w-72 border-r border-white/5 flex flex-col bg-[#161616] overflow-y-auto">
      {/* Header materia */}
      <div className="p-6 border-b border-white/5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: `${materia.color}20` }}
        >
          {materia.icono || "📚"}
        </div>
        <h2 className="text-lg font-black text-white leading-tight mb-1">{materia.nombre}</h2>
        <div
          className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold mt-1"
          style={{ color: materia.color, backgroundColor: `${materia.color}20` }}
        >
          {metadata.estado || "En curso"}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 border-b border-white/5">
        {[
          { label: "Notas", val: stats.apuntes, icon: "📝" },
          { label: "Tareas", val: stats.tareasPendientes, icon: "✅" },
          { label: "Proyectos", val: stats.proyectos, icon: "🚀" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center py-4 border-r border-white/5 last:border-r-0">
            <span className="text-lg font-black text-white">{s.val}</span>
            <span className="text-[9px] text-gray-600 uppercase font-bold mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="p-5 flex-1 space-y-4">
        <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Información</p>
        {Object.entries(metadata).map(([key, val]) => (
          <div key={key}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs opacity-50">{ICONOS_CAMPO[key] || "🔹"}</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest capitalize">{key}</span>
            </div>
            {renderValor(key, val)}
          </div>
        ))}
      </div>

      {/* Botón ver apuntes */}
      <div className="p-5 border-t border-white/5">
        <button
          onClick={onVerApuntes}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
        >
          <span>📝</span> Ver Apuntes
        </button>
      </div>
    </aside>
  );
};

// ─── Dashboard principal ───────────────────────────────────────────
const MateriaDashboard = ({ materia, onVolver, onVerApuntes, configSecciones }) => {
  const [stats, setStats] = useState({ apuntes: 0, tareasPendientes: 0, proyectos: 0 });
  const [notasRecientes, setNotasRecientes] = useState([]);
  const [tareasPorVencer, setTareasPorVencer] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [apuntes, tareas, proyectos] = await Promise.all([
          window.electron.invoke("apuntes:getByMateria", materia.id),
          window.electron.invoke("tareas:getByMateria", materia.id),
          window.electron.invoke("proyectos:getByMateria", materia.id),
        ]);

        setStats({
          apuntes: apuntes.length,
          tareasPendientes: tareas.filter((t) => !t.completada).length,
          proyectos: proyectos.length,
        });

        setNotasRecientes(apuntes.slice(0, 4));

        const proximas = tareas
          .filter((t) => !t.completada && t.fecha_limite)
          .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
          .slice(0, 3);
        setTareasPorVencer(proximas);
      } catch (err) {
        console.error("Error cargando dashboard materia:", err);
      }
    };
    cargar();
  }, [materia.id]);

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white overflow-hidden">
      <SidebarMateria
        materia={materia}
        stats={stats}
        onVerApuntes={onVerApuntes}
      />

      {/* ─── Contenido principal ─── */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-10 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={onVolver}
            className="text-[10px] text-gray-500 uppercase font-black hover:text-white transition-colors"
          >
            ← Dashboard
          </button>
        </div>

        <div className="px-10 py-8 space-y-10 max-w-4xl">

          {/* ─── Notas recientes ─── */}
          {notasRecientes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Apuntes recientes
                </h3>
                <button
                  onClick={onVerApuntes}
                  className="text-[10px] text-gray-600 hover:text-white transition-colors"
                >
                  Ver todos →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {notasRecientes.map((nota) => (
                  <button
                    key={nota.id}
                    onClick={onVerApuntes}
                    className="text-left p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all"
                  >
                    <p className="text-sm font-bold text-white truncate">{nota.titulo || "Sin título"}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-blue-400 font-bold uppercase">
                        {nota.unidad || "General"}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {nota.updated_at
                          ? new Date(nota.updated_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })
                          : "—"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ─── Tareas por vencer ─── */}
          {tareasPorVencer.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                Próximas a vencer
              </h3>
              <div className="space-y-2">
                {tareasPorVencer.map((t) => {
                  const fecha = formatFecha(t.fecha_limite);
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: materia.color }} />
                        <p className="text-sm text-white font-medium">{t.nombre}</p>
                      </div>
                      {fecha && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${colorUrgencia[fecha.urgencia]}`}>
                          {fecha.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── Tareas completas ─── */}
          <SeccionTareas materia={materia} materias={[materia]} />

          {/* ─── Proyectos ─── */}
          <div className="border-t border-white/5 pt-10">
            <SeccionProyectos materia={materia} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MateriaDashboard;