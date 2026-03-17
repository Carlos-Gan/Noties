import { useState } from "react";

const ExportButton = () => {
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const firstH1 = document.querySelector(".ProseMirror h1");
      const fileName = firstH1
        ? firstH1.innerText.replace(/[^a-z0-9]/gi, "_").toLowerCase()
        : "apunte_noties";

      const result = await window.electronAPI.exportPDF(fileName);
      if (result.success) {
        console.log("PDF guardado en:", result.path);
      }
    } catch (err) {
      console.error("Error al exportar:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={exporting}
      className="absolute top-4 right-4 z-50 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 backdrop-blur-md opacity-0 group-hover/editor:opacity-100 uppercase tracking-widest disabled:opacity-50"
    >
      {exporting ? "Exportando..." : "PDF"}
    </button>
  );
};

export default ExportButton;
