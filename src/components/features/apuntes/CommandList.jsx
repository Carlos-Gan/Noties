import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const CommandList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px] p-1 backdrop-blur-xl">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left rounded-lg transition-colors ${
              index === selectedIndex ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex flex-col">
              <span className="font-bold">{item.title}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500 text-xs italic">No hay resultados</div>
      )}
    </div>
  );
});

export default CommandList;