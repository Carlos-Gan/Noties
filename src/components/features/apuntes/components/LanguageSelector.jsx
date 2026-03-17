// components/LanguageSelector.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "JS" },
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "python", label: "Python", icon: "🐍" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "cpp", label: "C++", icon: "C++" },
  { value: "csharp", label: "C#", icon: "C#" },
  { value: "php", label: "PHP", icon: "PHP" },
  { value: "ruby", label: "Ruby", icon: "💎" },
  { value: "go", label: "Go", icon: "Go" },
  { value: "rust", label: "Rust", icon: "🦀" },
  { value: "swift", label: "Swift", icon: "Swift" },
  { value: "kotlin", label: "Kotlin", icon: "Kotlin" },
  { value: "html", label: "HTML", icon: "🌐" },
  { value: "css", label: "CSS", icon: "🎨" },
  { value: "sql", label: "SQL", icon: "📊" },
  { value: "bash", label: "Bash", icon: ">_" },
  { value: "json", label: "JSON", icon: "JSON" },
  { value: "markdown", label: "Markdown", icon: "MD" },
  { value: "yaml", label: "YAML", icon: "YAML" },
  { value: "xml", label: "XML", icon: "XML" },
];

const LanguageSelector = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLang =
    LANGUAGES.find((l) => l.value === selected) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all"
      >
        <span>{selectedLang.icon}</span>
        <span>{selectedLang.label}</span>
        <FiChevronDown
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          size={14}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 max-h-64 overflow-y-auto bg-[#1e1e1e] border border-white/10 rounded-lg shadow-2xl z-50 py-1 custom-scrollbar">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                onSelect(lang.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                selected === lang.value
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400"
              }`}
            >
              <span className="w-6 text-center">{lang.icon}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
