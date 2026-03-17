import { useEffect } from "react";

export const useCodeBlockHeaders = (editor) => {
  useEffect(() => {
    if (!editor) return;

    const addHeaderToCodeBlock = (block) => {
      if (block.querySelector(".code-header-container")) return;

      block.classList.add("group", "relative");

      const codeNode = block.querySelector("code");
      if (!codeNode) return;

      const langClass = Array.from(codeNode.classList || []).find((c) =>
        c.startsWith("language-"),
      );
      const langName = langClass
        ? langClass.replace("language-", "").toUpperCase()
        : "CODE";

      const header = document.createElement("div");
      header.className =
        "code-header-container absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10";

      const langTag = document.createElement("span");
      langTag.innerText = langName;
      langTag.className = "text-[10px] font-bold text-gray-500 tracking-widest";

      const btn = document.createElement("button");
      btn.innerText = "Copiar";
      btn.className =
        "text-[10px] bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-2 py-1 rounded transition-all font-bold uppercase";

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(codeNode.innerText);
        btn.innerText = "¡Copiado!";
        setTimeout(() => (btn.innerText = "Copiar"), 2000);
      };

      header.appendChild(langTag);
      header.appendChild(btn);
      block.prepend(header);
    };

    const updateCodeHeaders = () => {
      // Esperar a que lowlight termine de colorear el DOM
      requestAnimationFrame(() => {
        editor.view.dom.querySelectorAll("pre").forEach(addHeaderToCodeBlock);
      });
    };

    // Correr en la próxima animación al montar
    updateCodeHeaders();

    // ✅ Escuchar eventos del editor, no mutar el DOM
    editor.on("update", updateCodeHeaders);

    return () => {
      editor.off("update", updateCodeHeaders);
    };
  }, [editor]); // ← ya no depende de `contenido`
};
