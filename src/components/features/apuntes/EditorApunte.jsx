import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core"; // <--- CAMBIADO: Agregadas llaves { }
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { common, createLowlight } from "lowlight";
import CommandList from "./CommandList";
import { useEffect } from "react";

const lowlight = createLowlight(common);

// Definimos los comandos fuera para que el código sea más limpio
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
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },
      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

export default function EditorApunte({ contenido, onChange }) {
  const editor = useEditor({
    extensions: [
      // 1. StarterKit normal (sin trucos raros)
      StarterKit.configure({
        codeBlock: false, // Lo desactivamos aquí para usar el de Lowlight
      }),
      // 2. Bloque de código con colores
      CodeBlockLowlight.configure({ lowlight }),
      // 3. Placeholder
      Placeholder.configure({ placeholder: "Escribe '/' para comandos..." }),
      // 4. LA SOLUCIÓN: Crear una extensión personalizada solo para el Slash
      Extension.create({
        name: "slashCommand",
        addOptions() {
          return {
            suggestion: {
              ...suggestionConfig,
              items: ({ query }) => {
                return [
                  {
                    title: "Título 1",
                    icon: "H1",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", { level: 1 })
                        .run();
                    },
                  },
                  {
                    title: "Lista",
                    icon: "•",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleBulletList()
                        .run();
                    },
                  },
                  {
                    title: "Bloque de Código",
                    icon: "{}",
                    command: ({ editor, range }) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleCodeBlock()
                        .run();
                    },
                  },
                ].filter((item) =>
                  item.title.toLowerCase().startsWith(query.toLowerCase()),
                );
              },
            },
          };
        },
        addProseMirrorPlugins() {
          return [
            Suggestion({
              editor: this.editor,
              ...this.options.suggestion,
            }),
          ];
        },
      }),
    ],
    content: contenido,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Efecto para sincronizar cuando cambias de nota en Durango
  useEffect(() => {
    if (editor && contenido !== editor.getHTML()) {
      editor.commands.setContent(contenido || "", false);
    }
  }, [contenido, editor]);

  if (!editor) return null;

  return (
    <div className="flex-1">
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none focus:outline-none min-h-[500px]"
      />
    </div>
  );
}
