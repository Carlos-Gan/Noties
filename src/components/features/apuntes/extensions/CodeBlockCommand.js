// extensions/CodeBlockCommand.js
import { Extension } from "@tiptap/react";
import { Plugin } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockWithLanguage from "../components/CodeBlockWithLanguage";

export const CodeBlockWithLanguageExtension = Extension.create({
  name: "codeBlockWithLanguage",

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockWithLanguage);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              // Manejar clics en el botón de lenguaje
              const target = event.target;
              if (target.closest?.(".language-selector-button")) {
                event.preventDefault();
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
