const registerTagHandlers = (ipcMain, getDb) => {
  // ─── CRUD de tags ─────────────────────────────────────
  ipcMain.handle("tags:getAll", () => {
    return getDb()
      .prepare(
        `
      SELECT * FROM tags ORDER BY nombre ASC
    `,
      )
      .all();
  });

  ipcMain.handle("tags:crear", (_, { nombre, color }) => {
    return getDb()
      .prepare(
        `
      INSERT OR IGNORE INTO tags (nombre, color) VALUES (?, ?)
    `,
      )
      .run(nombre, color ?? "#3b82f6");
  });

  ipcMain.handle("tags:eliminar", (_, id) => {
    return getDb().prepare(`DELETE FROM tags WHERE id = ?`).run(id);
  });

  // ─── Tags de apuntes ──────────────────────────────────
  ipcMain.handle("tags:getByApunte", (_, apunteId) => {
    return getDb()
      .prepare(
        `
      SELECT t.* FROM tags t
      JOIN apunte_tags at ON t.id = at.tag_id
      WHERE at.apunte_id = ?
    `,
      )
      .all(apunteId);
  });

  ipcMain.handle("tags:agregarAApunte", (_, { apunte_id, tag_id }) => {
    return getDb()
      .prepare(
        `
      INSERT OR IGNORE INTO apunte_tags (apunte_id, tag_id) VALUES (?, ?)
    `,
      )
      .run(apunte_id, tag_id);
  });

  ipcMain.handle("tags:quitarDeApunte", (_, { apunte_id, tag_id }) => {
    return getDb()
      .prepare(
        `
      DELETE FROM apunte_tags WHERE apunte_id = ? AND tag_id = ?
    `,
      )
      .run(apunte_id, tag_id);
  });

  // ─── Tags de tareas ───────────────────────────────────
  ipcMain.handle("tags:getByTarea", (_, tareaId) => {
    return getDb()
      .prepare(
        `
      SELECT t.* FROM tags t
      JOIN tarea_tags tt ON t.id = tt.tag_id
      WHERE tt.tarea_id = ?
    `,
      )
      .all(tareaId);
  });

  ipcMain.handle("tags:agregarATarea", (_, { tarea_id, tag_id }) => {
    return getDb()
      .prepare(
        `
      INSERT OR IGNORE INTO tarea_tags (tarea_id, tag_id) VALUES (?, ?)
    `,
      )
      .run(tarea_id, tag_id);
  });

  ipcMain.handle("tags:quitarDeTarea", (_, { tarea_id, tag_id }) => {
    return getDb()
      .prepare(
        `
      DELETE FROM tarea_tags WHERE tarea_id = ? AND tag_id = ?
    `,
      )
      .run(tarea_id, tag_id);
  });

  // ─── Tags de proyectos ────────────────────────────────
  ipcMain.handle("tags:getByProyecto", (_, proyectoId) => {
    return getDb()
      .prepare(
        `
      SELECT t.* FROM tags t
      JOIN proyecto_tags pt ON t.id = pt.tag_id
      WHERE pt.proyecto_id = ?
    `,
      )
      .all(proyectoId);
  });

  ipcMain.handle("tags:agregarAProyecto", (_, { proyecto_id, tag_id }) => {
    return getDb()
      .prepare(
        `
      INSERT OR IGNORE INTO proyecto_tags (proyecto_id, tag_id) VALUES (?, ?)
    `,
      )
      .run(proyecto_id, tag_id);
  });

  ipcMain.handle("tags:quitarDeProyecto", (_, { proyecto_id, tag_id }) => {
    return getDb()
      .prepare(
        `
      DELETE FROM proyecto_tags WHERE proyecto_id = ? AND tag_id = ?
    `,
      )
      .run(proyecto_id, tag_id);
  });

  // ─── Búsqueda por tag ─────────────────────────────────
  ipcMain.handle("tags:buscarApuntes", (_, tagId) => {
    return getDb()
      .prepare(
        `
      SELECT a.*, m.nombre as materia_nombre
      FROM apuntes a
      JOIN apunte_tags at ON a.id = at.apunte_id
      JOIN materias m ON a.materia_id = m.id
      WHERE at.tag_id = ?
      ORDER BY a.updated_at DESC
    `,
      )
      .all(tagId);
  });

  ipcMain.handle("tags:buscarTodo", (_, tagId) => {
    const db = getDb();

    const apuntes = db
      .prepare(
        `
      SELECT a.*, 'apunte' as tipo, m.nombre as materia_nombre
      FROM apuntes a
      JOIN apunte_tags at ON a.id = at.apunte_id
      JOIN materias m ON a.materia_id = m.id
      WHERE at.tag_id = ?
    `,
      )
      .all(tagId);

    const tareas = db
      .prepare(
        `
      SELECT t.*, 'tarea' as tipo, m.nombre as materia_nombre
      FROM tareas t
      JOIN tarea_tags tt ON t.id = tt.tag_id
      JOIN materias m ON t.materia_id = m.id
      WHERE tt.tag_id = ?
    `,
      )
      .all(tagId);

    const proyectos = db
      .prepare(
        `
      SELECT p.*, 'proyecto' as tipo, m.nombre as materia_nombre
      FROM proyectos p
      JOIN proyecto_tags pt ON p.id = pt.tag_id
      JOIN materias m ON p.materia_id = m.id
      WHERE pt.tag_id = ?
    `,
      )
      .all(tagId);

    return { apuntes, tareas, proyectos };
  });
};

module.exports = { registerTagHandlers };
