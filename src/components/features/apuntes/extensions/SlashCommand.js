import { Extension } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { createSuggestionConfig } from "./suggestionConfig";
import { handleImageUpload } from "../utils/imageHandler";

// Separar los comandos en una constante para mejor legibilidad
const COMMAND_ITEMS = [
  {
    title: "Título 1",
    icon: "H1",
    keywords: ["h1", "heading1", "título1", "titulo1"],
    description: "Encabezado principal",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Título 2",
    icon: "H2",
    keywords: ["h2", "heading2", "título2", "titulo2"],
    description: "Encabezado secundario",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Ecuación",
    icon: "Σ",
    keywords: ["math", "ecuacion", "formula", "latex"],
    description: "Insertar ecuación LaTeX",
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
    keywords: ["task", "todo", "checklist", "tareas"],
    description: "Lista con checkboxes",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bloque de Código",
    icon: "{ }",
    keywords: [
      "code",
      "codigo",
      "programacion",
      "javascript",
      "python",
      "java",
    ],
    description: "Insertar bloque de código con selector de lenguaje",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "codeBlock",
          attrs: { language: "javascript" },
          content: [
            {
              type: "text",
              text: " ",
            },
          ],
        })
        .setTextSelection({
          from: range.from + 1,
          to: range.from + 1,
        })
        .run();
    },
  },
  {
    title: "Cita",
    icon: "❝",
    keywords: ["quote", "cita", "blockquote"],
    description: "Insertar cita o bloque de referencia",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Separador",
    icon: "—",
    keywords: ["hr", "separador", "linea"],
    description: "Línea horizontal divisoria",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Imagen",
    icon: "📷",
    keywords: ["image", "imagen", "foto", "picture"],
    description: "Subir una imagen",
    command: ({ editor, range }) => handleImageUpload(editor, range),
  },
];

// Función de búsqueda mejorada
const filterItems = (query = "") => {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return COMMAND_ITEMS;

  return COMMAND_ITEMS.filter((item) => {
    // Buscar en título
    if (item.title.toLowerCase().includes(searchTerm)) return true;

    // Buscar en keywords
    if (item.keywords?.some((k) => k.includes(searchTerm))) return true;

    // Buscar en descripción
    if (item.description?.toLowerCase().includes(searchTerm)) return true;

    return false;
  });
};

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        ...createSuggestionConfig(COMMAND_ITEMS),
        items: ({ query }) => filterItems(query),
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
});
