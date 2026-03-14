import { useEffect, useState } from "react";
import ContextMenu from "../ContextMenu";
import {
  Home,
  CheckSquare,
  FileText,
  Settings,
  PanelLeft,
  GraduationCap,
  Hammer,
  Archive,
  RotateCcw,
  ChevronDown,
  Calendar,
} from "lucide-react";

const bgToTextColor = (bg) => {
  if (!bg) return "text-gray-400";
  return bg.replace("bg-", "text-");
};

const sidebarItems = [
  { name: "Home", icon: Home, view: "dashboard", section: "Home" },
  { name: "Classes", icon: GraduationCap, view: "clases", section: "Clases" },
  { name: "Tasks", icon: CheckSquare, view: "tasks", section: "Tareas" },
  { name: "Notes", icon: FileText, view: "notes", section: "Apuntes" },
  { name: "Projects", icon: Hammer, view: "projects", section: "Proyectos" },
];

const extrasItems = [
  { name: "Horario", icon: Calendar, view: "horario", section: "Horario" },
];

export default function Sidebar({
  view,
  onNavigate,
  onOpenSettings,
  configSecciones,
  onColorChange,
  onOpenAdmin,
  materias = [],
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [archivadas, setArchivadas] = useState([]);
  const [archivadasOpen, setArchivadasOpen] = useState(false);
  const [restaurando, setRestaurando] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  // Cargar materias archivadas
  useEffect(() => {
    cargarArchivadas();
  }, []);

  const cargarArchivadas = async () => {
    try {
      const data = await window.electronAPI.invoke("materias:getArchivadas");
      setArchivadas(data || []);
    } catch (err) {
      console.error("Error cargando archivadas:", err);
    }
  };

  const restaurarMateria = async (e, id) => {
    e.stopPropagation();
    try {
      setRestaurando(id);
      await window.electronAPI.invoke("materias:toggleArchivada", id);
      await cargarArchivadas();
      // Recargar materias activas en el resto de la app
      window.dispatchEvent(new CustomEvent("materias-updated"));
    } catch (err) {
      console.error("Error restaurando:", err);
    } finally {
      setRestaurando(null);
    }
  };

  const handleRightClick = (e, sectionName) => {
    e.preventDefault();
    setMenuData({ x: e.clientX, y: e.clientY, section: sectionName });
  };

  return (
    <div
      className={`h-screen bg-[#0f0f0f] border-r border-white/10 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        {!collapsed && (
          <h1 className="text-white text-sm font-semibold">Noties</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          <PanelLeft size={18} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = view?.type === item.view;
          const sectionColor = configSecciones?.[item.section]?.color;

          return (
            <div key={item.view} className="relative group">
              <button
                onClick={() => onNavigate(item.view)}
                onContextMenu={(e) => handleRightClick(e, item.section)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${
                    active
                      ? bgToTextColor(sectionColor)
                      : "text-gray-500 group-hover:" +
                        bgToTextColor(sectionColor)
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />
      {/* Divisor */}
      <div className="mx-3 my-2 h-px bg-white/10" />

      {/* ─── Extras General ─── */}
      <div className="flex flex-col gap-1 px-2">
        {extrasItems.map((item) => {
          const Icon = item.icon;
          const active = view?.type === item.view;
          const sectionColor = configSecciones?.[item.section]?.color;

          return (
            <div key={item.view} className="relative group">
              <button
                onClick={() => onNavigate(item.view)}
                onContextMenu={(e) => handleRightClick(e, item.section)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${
                    active
                      ? bgToTextColor(sectionColor)
                      : "text-gray-500 group-hover:" +
                        bgToTextColor(sectionColor)
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </button>
            </div>
          );
        })}
      </div>




      {/*  Divisor  */}
      <div className="mx-3 my-2 h-px bg-white/10" />

      {/* ─── Materias Archivadas ─── */}
      {archivadas.length > 0 && (
        <div className="px-2 mb-1">
          {/* Toggle header */}
          <button
            onClick={() => !collapsed && setArchivadasOpen(!archivadasOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all text-sm ${collapsed ? "justify-center" : ""}`}
          >
            <Archive size={16} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-xs font-semibold">
                  Archivadas
                </span>
                <span className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded-md font-bold mr-1">
                  {archivadas.length}
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${archivadasOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {/* Lista desplegable */}
          {!collapsed && archivadasOpen && (
            <div className="mt-1 space-y-0.5 overflow-hidden">
              {archivadas.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl group/item hover:bg-white/5 transition-all"
                >
                  {/* Color dot */}
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-50"
                    style={{ backgroundColor: m.color || "#3b82f6" }}
                  />
                  <span className="flex-1 text-xs text-gray-600 truncate group-hover/item:text-gray-400 transition-colors">
                    {m.nombre}
                  </span>
                  {/* Botón restaurar */}
                  <button
                    onClick={(e) => restaurarMateria(e, m.id)}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:text-green-400 text-gray-600 rounded-lg hover:bg-green-500/10"
                    title="Restaurar"
                  >
                    {restaurando === m.id ? (
                      <span className="text-[9px] font-bold">...</span>
                    ) : (
                      <RotateCcw size={11} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="p-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all text-sm"
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Context Menu */}
      {menuData && (
        <ContextMenu
          x={menuData.x}
          y={menuData.y}
          section={menuData.section}
          onClose={() => setMenuData(null)}
          onColorChange={onColorChange}
          onEditStructure={onOpenAdmin}
        />
      )}
    </div>
  );
}
