import { useState, useEffect, useRef } from "react";

const CodeBlockHeader = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="code-header-container absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
      <span className="text-[10px] font-bold text-gray-500 tracking-widest">
        {language}
      </span>
      <button
        onClick={handleCopy}
        className="text-[10px] bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-2 py-1 rounded transition-all font-bold uppercase"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
};

export default CodeBlockHeader;
