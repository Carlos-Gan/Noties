import { useState } from "react";

export function useNavigation({ onClases }) {
  const [view, setView] = useState({ type: "dashboard", data: null });
  const [historial, setHistorial] = useState([]);

  const navigateTo = (type, data = null, selectedNotaId = null) => {
    if (type === "clases" && onClases) onClases();

    setHistorial((prev) => [...prev, view]);
    setView({ type, data, selectedNotaId });
  };

  const goBack = () => {
    if (historial.length === 0) return;
    const anterior = historial[historial.length - 1];
    setHistorial((prev) => prev.slice(0, -1));
    setView(anterior);
  };

  const canGoBack = historial.length > 0;

  return{
    view,
    navigateTo,
    goBack,
    canGoBack
  }
}
