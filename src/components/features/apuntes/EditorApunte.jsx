import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import ImageResize from "tiptap-extension-resize-image";
import { createLowlight, common } from "lowlight";
import { useEffect } from "react";
import Image from "@tiptap/extension-image";

// Extensiones personalizadas
import { MathNode } from "../../Editor/nodes/MathNode";
import { SlashCommand } from "./extensions/SlashCommand";
import { CodeBlockWithLanguageExtension } from "./extensions/CodeBlockCommand";

// Componentes
import PDFExportButton from "./components/PDFExportButton";

// Hooks
import { useCodeBlockHeaders } from "./hooks/useCodeBlockHeaders";

// Utils
import { handleImageDrop } from "./utils/imageHandler";

const lowlight = createLowlight(common);

const EditorApunte = ({ contenido, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      MathNode,
      TaskList,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      ImageResize.configure({
        allowBase64: true,
        inline: true,
        HTMLAttributes: {
          class:
            "rounded-xl border border-white/5 shadow-2xl my-8 max-w-full mx-auto block cursor-pointer",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "flex items-start my-1" },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      CodeBlockWithLanguageExtension,
      Placeholder.configure({
        placeholder: "Escribe '/' para comandos ...",
      }),
      SlashCommand,
    ],
    content: contenido,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-10",
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false;
        return handleImageDrop(view, event, slice, moved);
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useCodeBlockHeaders(editor, contenido);

  // Sincronizar contenido externo
  useEffect(() => {
    if (editor && contenido !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(contenido || "", false);
    }
  }, [contenido, editor]);

  if (!editor) return null;

  return (
    <div className="flex-1 relative bg-[#0c0c0c] editor-container rounded-xl border border-white/5 overflow-hidden group/editor">
      <PDFExportButton editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default EditorApunte;
