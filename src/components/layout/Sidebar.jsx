import { useEffect, useState } from "react";

import {
  Home,
  CheckSquare,
  FileText,
  Settings,
  PanelLeft,
  GraduationCap,
  Hammer
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

export default function Sidebar({
  view,
  onNavigate,
  onOpenSettings,
  configSecciones,
  onColorChange,
  onOpenAdmin,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  const handleRightClick = (e, sectionName) => {
    e.preventDefault();

    setMenuData({
      x: e.clientX,
      y: e.clientY,
      section: sectionName,
    });
  };

  return (
    <div
      className={`h-screen bg-[#0f0f0f] border-r border-white/10 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm
                ${
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