import { useState } from "react";
import { FiDownload } from "react-icons/fi";

const PDFExportButton = ({ editor }) => {
  const [exporting, setExporting] = useState(false);

  // Estilos específicos para el PDF
  const getPDFStyles = () => {
    return `
      <style>
        /* Reset y estilos base */
        body {
          background: white;
          color: black;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          padding: 2rem;
          margin: 0;
        }
        
        /* Contenedor principal */
        .editor-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        /* Títulos */
        h1 { font-size: 2.5rem; font-weight: 800; margin: 1.5rem 0 1rem; color: #000; }
        h2 { font-size: 2rem; font-weight: 700; margin: 1.5rem 0 1rem; color: #000; }
        h3 { font-size: 1.5rem; font-weight: 600; margin: 1.2rem 0 0.8rem; color: #000; }
        
        /* Código */
        pre {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #eaeaea;
        }
        
        code {
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.9rem;
          color: #333;
        }
        
        /* Tablas */
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 0.5rem;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        
        /* Imágenes */
        img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 4px;
        }
        
        /* Listas */
        ul, ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        li {
          margin: 0.5rem 0;
        }
        
        /* Citas */
        blockquote {
          border-left: 4px solid #007acc;
          margin: 1.5rem 0;
          padding: 0.5rem 0 0.5rem 1.5rem;
          background: #f9f9f9;
          color: #333;
        }
        
        /* Ecuaciones KaTeX */
        .katex-display {
          margin: 1.5rem 0;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.5rem 0;
        }
        
        .katex { font-size: 1.1em; }
        
        /* Checkboxes de tareas */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        
        li[data-type="taskItem"] {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }
        
        li[data-type="taskItem"] input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
        }
        
        /* Separador */
        hr {
          margin: 2rem 0;
          border: none;
          border-top: 2px solid #eee;
        }
        
        /* Enlaces */
        a {
          color: #007acc;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        /* Párrafos */
        p {
          margin: 1rem 0;
        }
        
        /* Ocultar elementos de UI */
        .code-header-container,
        button,
        .export-button,
        .absolute,
        .fixed,
        [class*="absolute"],
        [class*="fixed"] {
          display: none !important;
        }
        
        /* Media queries para impresión */
        @media print {
          body { padding: 0; }
          pre { break-inside: avoid; }
          h1, h2, h3 { break-after: avoid; }
          img { break-inside: avoid; }
        }
      </style>
    `;
  };

  const extractTitle = (html) => {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (match) {
      // Limpiar el texto de etiquetas HTML
      const titleText = match[1].replace(/<[^>]*>/g, "").trim();
      return titleText
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()
        .slice(0, 50);
    }
    return "apunte";
  };

  const handleExportPDF = async () => {
    if (!editor) return;

    try {
      setExporting(true);

      // Obtener el contenido HTML del editor
      const editorContent = editor.getHTML();

      // Extraer título del primer H1
      const title = extractTitle(editorContent);

      // Crear el documento HTML completo para el PDF
      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Fira+Code&display=swap" rel="stylesheet">
          ${getPDFStyles()}
        </head>
        <body>
          <div class="editor-content">
            ${editorContent}
          </div>
        </body>
        </html>
      `;

      // Usar Blob y objeto URL en lugar de iframe con document.write
      const blob = new Blob([fullHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Crear un iframe pero asignar src en lugar de document.write
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = url;

      document.body.appendChild(iframe);

      // Esperar a que el iframe cargue
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Limpiar después de imprimir
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 1000);
        }, 500);
      };
    } catch (error) {
      console.error("Error exportando a PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={exporting}
      className="absolute top-4 right-4 z-50 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 backdrop-blur-md opacity-0 group-hover/editor:opacity-100 uppercase tracking-widest disabled:opacity-50"
      title="Exportar a PDF (solo contenido)"
    >
      <FiDownload size={12} />
      {exporting ? "Preparando..." : "PDF"}
    </button>
  );
};

export default PDFExportButton;
