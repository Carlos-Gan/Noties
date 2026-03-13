import { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default ({ node, updateAttributes }) => {
  const [isEditing, setIsEditing] = useState(false);

  const renderMath = () => {
    const html = katex.renderToString(
      node.attrs.content || "\\text{  }",
      {
        throwOnError: false,
        displayMode: true,
      },
    );
    return { __html: html };
  };

  return (
    <NodeViewWrapper className="math-block my-6 group relative">
      <div
        onClick={() => setIsEditing(true)}
        className={`p-4 rounded-xl transition-all cursor-pointer border ${
          isEditing
            ? "border-blue-500 bg-blue-500/5"
            : "border-white/5 bg-white/[0.02] hover:border-white/20"
        }`}
      >
        {isEditing ? (
          <input
            autoFocus
            className="w-full bg-transparent outline-none text-blue-400 font-mono text-sm"
            value={node.attrs.content}
            onChange={(e) => updateAttributes({ content: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            placeholder="Escribe en LaTeX"
          />
        ) : (
          <div dangerouslySetInnerHTML={renderMath()} />
        )}
      </div>
      <div className="absolute -top-2 left-4 px-2 py-0.5 bg-[#121212] border border-white/10 rounded text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        LaTeX
      </div>
    </NodeViewWrapper>
  );
};
