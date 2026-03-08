const registerMateriaHandlers = (ipcMain, getDb) => {
  ipcMain.handle("materias:getAll", () => {
    return getDb()
      .prepare(
        `
      SELECT * FROM materias WHERE archivada = 0 ORDER BY created_at DESC
    `,
      )
      .all();
  });

  ipcMain.handle("materias:getArchivadas", () => {
    return getDb()
      .prepare(
        `
      SELECT * FROM materias WHERE archivada = 1 ORDER BY created_at DESC
    `,
      )
      .all();
  });

  ipcMain.handle("materias:getOne", (_, id) => {
    return getDb().prepare(`SELECT * FROM materias WHERE id = ?`).get(id);
  });

  ipcMain.handle("materias:crear", (_, { nombre, color, icono, metadata }) => {
    return getDb()
      .prepare(
        `
      INSERT INTO materias (nombre, color, icono, metadata) VALUES (?, ?, ?, ?)
    `,
      )
      .run(nombre, color, icono ?? "📚", metadata ?? "{}");
  });

  ipcMain.handle(
    "materias:actualizar",
    (_, { id, nombre, color, icono, metadata }) => {
      return getDb()
        .prepare(
          `
      UPDATE materias SET nombre = ?, color = ?, icono = ?, metadata = ? WHERE id = ?
    `,
        )
        .run(nombre, color, icono, metadata, id);
    },
  );

  ipcMain.handle("materias:toggleArchivada", (_, id) => {
    return getDb()
      .prepare(
        `
      UPDATE materias SET archivada = NOT archivada WHERE id = ?
    `,
      )
      .run(id);
  });

  ipcMain.handle("materias:eliminar", (_, id) => {
    return getDb().prepare(`DELETE FROM materias WHERE id = ?`).run(id);
  });
};

module.exports = { registerMateriaHandlers };
