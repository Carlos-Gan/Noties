// components/CommandList.jsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const CommandList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (selectedIndex + props.items.length - 1) % props.items.length,
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 min-w-[240px]">
        <p className="text-gray-500 text-xs text-center">No hay comandos</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden min-w-[260px] p-2 backdrop-blur-2xl">
      <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">
        Comandos disponibles ({props.items.length})
      </div>
      <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
        {props.items.map((item, index) => (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              index === selectedIndex
                ? "bg-blue-600 shadow-lg shadow-blue-600/20"
                : "hover:bg-white/5"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-md border text-base shadow-sm transition-colors ${
                index === selectedIndex
                  ? "bg-white/20 border-white/20 text-white"
                  : "bg-[#252525] border-white/5 text-gray-400"
              }`}
            >
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <div
                className={`text-sm font-semibold ${
                  index === selectedIndex ? "text-white" : "text-gray-300"
                }`}
              >
                {item.title}
              </div>
              {item.description && (
                <div className="text-[10px] text-gray-500">
                  {item.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

CommandList.displayName = "CommandList";
export default CommandList;
