import {
  useEditor,
  EditorContent,
  ReactRenderer,
  Node,
  Extension,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Suggestion from "@tiptap/suggestion";
import { createLowlight, common } from "lowlight";
import tippy from "tippy.js";
import { useEffect } from "react";
import CommandList from "./CommandList";

// Importación de tus bloques personalizados
import MathBlock from "../../Editor/Blocks/MathBlock";
import ImageResize from "tiptap-extension-resize-image";

const lowlight = createLowlight(common);

// --- EXTENSIONES PERSONALIZADAS ---

const MathNode = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  addAttributes() {
    return { content: { default: "" } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-type": "math-block", ...HTMLAttributes }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathBlock);
  },
});

const suggestionConfig = {
  char: "/",
  command: ({ editor, range, props }) => {
    props.command({ editor, range });
  },
  render: () => {
    let component;
    let popup;
    return {
      onStart: (props) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate(props) {
        component.updateProps(props);
        if (popup && popup[0]) {
          popup[0].setProps({ getReferenceClientRect: props.clientRect });
        }
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },
      onExit() {
        popup[0]?.destroy();
        component.destroy();
      },
    };
  },
};

export default function EditorApunte({ contenido, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      MathNode,
      TaskList,
      ImageResize.configure({
        allowBase64: true,
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
      Placeholder.configure({
        placeholder: "Escribe '/' para comandos de ingeniería...",
      }),
      Extension.create({
        name: "slashCommand",
        addOptions() {
          return {
            suggestion: {
              ...suggestionConfig,
              items: ({ query }) => {
                const items = [
                  {
                    title: "Título 1",
                    icon: "H1",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setHeading({ level: 1 })
                        .run();
                    },
                  },
                  {
                    title: "Título 2",
                    icon: "H2",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setHeading({ level: 2 })
                        .run();
                    },
                  },
                  {
                    title: "Ecuación",
                    icon: "Σ",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .insertContent({ type: "mathBlock" })
                        .run();
                    },
                  },
                  {
                    title: "Lista de tareas",
                    icon: "[ ]",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleTaskList()
                        .run();
                    },
                  },
                  {
                    title: "Bloque de Código",
                    icon: "{ }",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleCodeBlock()
                        .run();
                    },
                  },
                  {
                    title: "Cita",
                    icon: "❝",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleBlockquote()
                        .run();
                    },
                  },
                  {
                    title: "Separador",
                    icon: "—",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setHorizontalRule()
                        .run();
                    },
                  },
                  {
                    title: "Imagen",
                    icon: "📷",
                    command: ({ editor, range }) => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (readerEvent) => {
                            editor
                              .chain()
                              .focus()
                              .deleteRange(range)
                              .setImage({ src: readerEvent.target.result })
                              .run();
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    },
                  },
                ];
                return items.filter((item) =>
                  item.title.toLowerCase().includes(query.toLowerCase()),
                );
              },
            },
          };
        },
        addProseMirrorPlugins() {
          return [
            Suggestion({ editor: this.editor, ...this.options.suggestion }),
          ];
        },
      }),
    ],
    content: contenido,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-10",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const node = view.state.schema.nodes.image.create({
                src: readerEvent.target.result,
              });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Función para exportar a PDF
  const handleExportPDF = async () => {
    try {
      // Intentamos extraer el texto del primer H1 para el nombre del archivo
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
    }
  };

  useEffect(() => {
    if (!editor) return;

    const updateCodeHeaders = () => {
      const codeBlocks = document.querySelectorAll("pre");
      codeBlocks.forEach((block) => {
        if (block.querySelector(".code-header-container")) return;

        block.classList.add("group", "relative");

        const header = document.createElement("div");
        header.className =
          "code-header-container absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200";

        const codeNode = block.querySelector("code");
        const langClass = Array.from(codeNode?.classList || []).find((c) =>
          c.startsWith("language-"),
        );
        const langName = langClass
          ? langClass.replace("language-", "").toUpperCase()
          : "CODE";

        const langTag = document.createElement("span");
        langTag.innerText = langName;
        langTag.className =
          "text-[10px] font-bold text-gray-500 tracking-widest";

        const btn = document.createElement("button");
        btn.innerText = "Copiar";
        btn.className =
          "text-[10px] bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-2 py-1 rounded transition-all font-bold uppercase";

        btn.onclick = (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(codeNode.innerText);
          btn.innerText = "¡Copiado!";
          setTimeout(() => (btn.innerText = "Copiar"), 2000);
        };

        header.appendChild(langTag);
        header.appendChild(btn);
        block.appendChild(header);
      });
    };

    updateCodeHeaders();
  }, [contenido, editor]);

  useEffect(() => {
    if (editor && contenido !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(contenido || "", false);
    }
  }, [contenido, editor]);

  if (!editor) return null;

  return (
    <div className="flex-1 relative bg-[#0c0c0c] editor-container rounded-xl border border-white/5 overflow-hidden group/editor">
      {/* Botón de Exportar PDF */}
      <button
        onClick={handleExportPDF}
        className="absolute top-4 right-4 z-50 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 backdrop-blur-md opacity-0 group-hover/editor:opacity-100 uppercase tracking-widest"
      >
        PDF
      </button>

      <EditorContent editor={editor} />
    </div>
  );
}
