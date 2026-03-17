import { Node } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MathBlock from "../../Editor/Blocks/MathBlock";

export const MathNode = Node.create({
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
