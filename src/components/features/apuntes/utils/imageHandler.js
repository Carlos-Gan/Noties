export const handleImageUpload = (editor, range) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setImage({ src: readerEvent.target?.result })
        .run();
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

export const handleImageDrop = (view, event, slice, moved) => {
  if (moved) return false;

  const file = event.dataTransfer?.files?.[0];
  if (!file?.type.startsWith("image/")) return false;

  // Prevenir el comportamiento por defecto
  event.preventDefault();

  const reader = new FileReader();
  reader.onload = (readerEvent) => {
    // Verificar que view.state.schema.nodes.image existe
    if (!view.state.schema.nodes.image) {
      console.error("El nodo 'image' no está definido en el schema");
      return;
    }

    const node = view.state.schema.nodes.image.create({
      src: readerEvent.target?.result,
    });

    const transaction = view.state.tr.replaceSelectionWith(node);
    view.dispatch(transaction);
  };
  reader.readAsDataURL(file);
  return true;
};
