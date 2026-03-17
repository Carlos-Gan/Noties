// components/CodeBlockWithLanguage.jsx
import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";

const CodeBlockWithLanguage = ({ node, updateAttributes, extension }) => {
  const [isHovered, setIsHovered] = useState(false);
  const language = node.attrs.language || "javascript";

  const handleLanguageChange = (newLanguage) => {
    updateAttributes({ language: newLanguage });
  };

  return (
    <NodeViewWrapper
      className="relative group my-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute -top-3 right-4 z-10 transition-opacity duration-200">
        {isHovered && (
          <LanguageSelector
            selected={language}
            onSelect={handleLanguageChange}
          />
        )}
      </div>
      <pre className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 overflow-x-auto">
        <code className={`language-${language}`}>{node.textContent}</code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockWithLanguage;
