import { useState } from "react";
import ContextMenu from "./ContextMenu";

const Sidebar = ({
  onSearchClick,
  onOpenAdmin,
  configSecciones,
  onColorChange,
}) => {
  const [activeTab, setActiveTab] = useState("Home Page");
  const [menuData, setMenuData] = useState(null); // Ahora guardamos posición Y nombre de la sección

  const menuItems = [
    { name: "Home Page", icon: "🏠" },
    { name: "Clases", icon: "📚" },
    { name: "Apuntes", icon: "📝" },
    { name: "Tareas", icon: "✅" },
    { name: "Proyectos", icon: "🚀" },
  ];

  const handleRightClick = (e, itemName) => {
    e.preventDefault();
    setMenuData({
      x: e.clientX,
      y: e.clientY,
      section: itemName,
    });
  };

  return (
    <aside className="w-64 bg-[#1e1e1e] h-screen flex flex-col p-4 border-r border-white/5 select-none relative">
      {/* ... Header y Caja de Herramientas iguales ... */}

      <nav className="flex-1 space-y-0.5">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            onContextMenu={(e) => handleRightClick(e, item.name)}
            className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-all duration-200 group relative ${
              activeTab === item.name
                ? "bg-[#3d3d3d] text-white shadow-lg shadow-black/20"
                : "text-gray-400 hover:bg-[#3d3d3d]/50 hover:text-gray-200"
            }`}
          >
            {/* Indicador de Color Semántico */}
            <div className="relative mr-3 flex items-center justify-center">
              <span
                className={`text-base z-10 transition-transform group-hover:scale-110 ${activeTab === item.name ? "opacity-100" : "opacity-50"}`}
              >
                {item.icon}
              </span>
              {/* Brillo de color de fondo (opcional, muy Anytype) */}
              <div
                className={`absolute inset-0 rounded-full blur-md opacity-20 ${configSecciones[item.name]?.color || ""}`}
              />
            </div>

            <span className="flex-1 text-left">{item.name}</span>

            {/* Punto indicador de color al final */}
            {configSecciones[item.name] && (
              <div
                className={`w-2 h-2 rounded-full shadow-sm ${configSecciones[item.name].color}`}
              />
            )}
          </button>
        ))}
      </nav>

      {/* MENÚ CONTEXTUAL DINÁMICO */}
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
      <div className="mt-8">
        <div className="flex items-center text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold px-3 mb-3">
          <span className="mr-2 text-[8px] opacity-30">▼</span> Pinned
        </div>
        <div className="mx-2 h-32 bg-[#4d4d4d]/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center group hover:border-white/20 transition-all cursor-pointer">
          <span className="text-[10px] text-gray-600 group-hover:text-gray-400 italic text-center px-4 leading-relaxed">
            Nada fijado aún
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
