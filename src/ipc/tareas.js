const registerTareaHandlers = (ipcMain, getDb) => {
  ipcMain.handle("tareas:getByMateria", (_, materiaId) => {
    return getDb()
      .prepare(
        `
      SELECT * FROM tareas 
      WHERE materia_id = ? 
      ORDER BY completada ASC, fecha_limite ASC
    `,
      )
      .all(materiaId);
  });

  ipcMain.handle("tareas:getByProyecto", (_, proyectoId) => {
    return getDb()
      .prepare(
        `
      SELECT * FROM tareas 
      WHERE proyecto_id = ? 
      ORDER BY completada ASC, prioridad DESC
    `,
      )
      .all(proyectoId);
  });

  ipcMain.handle("tareas:getSueltas", (_, materiaId) => {
    return getDb()
      .prepare(
        `
      SELECT * FROM tareas 
      WHERE materia_id = ? AND proyecto_id IS NULL
      ORDER BY completada ASC, fecha_limite ASC
    `,
      )
      .all(materiaId);
  });

  ipcMain.handle("tareas:getPendientes", () => {
    return getDb()
      .prepare(
        `
      SELECT t.*, 
        m.nombre as materia_nombre, 
        m.color as materia_color,
        p.nombre as proyecto_nombre
      FROM tareas t
      JOIN materias m ON t.materia_id = m.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.completada = 0
      ORDER BY t.fecha_limite ASC
    `,
      )
      .all();
  });

  ipcMain.handle(
    "tareas:crear",
    (
      _,
      {
        materia_id,
        proyecto_id,
        unidad,
        nombre,
        descripcion,
        prioridad,
        fecha_limite,
      },
    ) => {
      return getDb()
        .prepare(
          `
      INSERT INTO tareas (materia_id, proyecto_id, unidad, nombre, descripcion, prioridad, fecha_limite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        )
        .run(
          materia_id,
          proyecto_id ?? null,
          unidad ?? null,
          nombre,
          descripcion ?? null,
          prioridad ?? "media",
          fecha_limite ?? null,
        );
    },
  );

  ipcMain.handle(
    "tareas:actualizar",
    (_, { id, nombre, descripcion, unidad, prioridad, fecha_limite }) => {
      return getDb()
        .prepare(
          `
      UPDATE tareas 
      SET nombre = ?, descripcion = ?, unidad = ?, prioridad = ?, fecha_limite = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
        )
        .run(nombre, descripcion, unidad, prioridad, fecha_limite, id);
    },
  );

  ipcMain.handle("tareas:toggleCompletada", (_, id) => {
    return getDb()
      .prepare(
        `
      UPDATE tareas SET completada = NOT completada WHERE id = ?
    `,
      )
      .run(id);
  });

  ipcMain.handle("tareas:eliminar", (_, id) => {
    return getDb().prepare(`DELETE FROM tareas WHERE id = ?`).run(id);
  });
};

module.exports = { registerTareaHandlers };
