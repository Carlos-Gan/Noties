// extensions/suggestionConfig.js
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import CommandList from "../components/CommandList";

export const createSuggestionConfig = (items) => ({
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

        if (!props.clientRect) return; // ← Bug 3

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
        component?.updateProps(props);

        if (!props.clientRect) return;

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false; // ← Bug 1
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
        popup = null; // ← Bug 2
        component = null;
      },
    };
  },

  items: ({ query }) =>
    items.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()),
    ),
});
