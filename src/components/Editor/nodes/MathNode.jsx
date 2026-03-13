import { NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';

export default ({ node }) => {
  const renderMath = () => {
    try {
      return { __html: katex.renderToString(node.attrs.content || 'x = ?', {
        throwOnError: false,
        displayMode: true,
      })};
    } catch (e) {
      return { __html: "Error en fórmula" };
    }
  };

  return (
    <NodeViewWrapper className="math-node-wrapper group relative my-4">
      <div 
        className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all cursor-pointer"
        dangerouslySetInnerHTML={renderMath()} 
      />
      <div className="hidden group-hover:block absolute -top-3 right-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded text-white">
        Click para editar LaTeX
      </div>
    </NodeViewWrapper>
  );
};