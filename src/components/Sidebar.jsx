import { useState } from "react";
import ContextMenu from "./ContextMenu";

const Sidebar = ({
  onSearchClick,
  onOpenAdmin,
  configSecciones,
  onColorChange,
  onNavigate, // <--- Nueva prop para controlar la vista global
}) => {
  const [activeTab, setActiveTab] = useState("Home Page");
  const [menuData, setMenuData] = useState(null);

  const menuItems = [
    { name: "Home Page", icon: "🏠", view: "dashboard" },
    { name: "Clases", icon: "📚", view: "clases" },
    { name: "Apuntes", icon: "📝", view: "apuntes" }, // Puedes crear estas vistas luego
    { name: "Tareas", icon: "✅", view: "tareas" },
    { name: "Proyectos", icon: "🚀", view: "proyectos" },
  ];

  const handleItemClick = (item) => {
    setActiveTab(item.name);
    
    // Si el item tiene una vista asociada (como dashboard), navegamos
    if (item.view) {
      onNavigate(item.view);
    }
  };

  const handleRightClick = (e, itemName) => {
    e.preventDefault();
    setMenuData({
      x: e.clientX,
      y: e.clientY,
      section: itemName,
    });
  };

  return (
    <aside className="w-64 bg-[#1e1e1e] h-screen flex flex-col p-4 border-r border-white/5 select-none relative z-50">
      {/* Caja de herramientas (Buscador) */}
      <div className="mb-6 space-y-2">
        <button 
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-all text-xs"
        >
          <span>🔍</span> Buscar...
          <span className="ml-auto text-[10px] opacity-30 font-mono">Ctrl+K</span>
        </button>
      </div>

      <nav className="flex-1 space-y-0.5">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleItemClick(item)} // <--- Llamamos a la nueva función
            onContextMenu={(e) => handleRightClick(e, item.name)}
            className={`w-full flex items-center px-3 py-2 rounded-xl text-sm transition-all duration-200 group relative ${
              activeTab === item.name
                ? "bg-[#3d3d3d] text-white shadow-lg shadow-black/20"
                : "text-gray-400 hover:bg-[#3d3d3d]/50 hover:text-gray-200"
            }`}
          >
            <div className="relative mr-3 flex items-center justify-center">
              <span className={`text-base z-10 transition-transform group-hover:scale-110 ${activeTab === item.name ? "opacity-100" : "opacity-50"}`}>
                {item.icon}
              </span>
              <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${configSecciones[item.name]?.color || ""}`} />
            </div>

            <span className="flex-1 text-left font-medium">{item.name}</span>

            {configSecciones[item.name] && (
              <div className={`w-2 h-2 rounded-full shadow-sm ${configSecciones[item.name].color}`} />
            )}
          </button>
        ))}
      </nav>

      {menuData && (
        <ContextMenu
          x={menuData.x}
          y={menuData.y}
          section={menuData.section}
          onClose={() => setMenuData(null)}
          onEditStructure={onOpenAdmin}
          onColorChange={onColorChange}
        />
      )}

      {/* Sección Pinned */}
      <div className="mt-8 border-t border-white/5 pt-6">
        <div className="flex items-center text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold px-3 mb-3">
           Pinned
        </div>
        <div className="mx-2 h-32 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex items-center justify-center group hover:border-white/20 transition-all cursor-pointer">
          <span className="text-[10px] text-gray-600 group-hover:text-gray-400 italic text-center px-4">
            Arrastra materias aquí
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;