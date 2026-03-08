const registerProyectoHandlers = (ipcMain, getDb) => {
  ipcMain.handle('proyectos:getByMateria', (_, materiaId) => {
    return getDb().prepare(`
      SELECT * FROM proyectos WHERE materia_id = ? ORDER BY fecha_limite ASC
    `).all(materiaId);
  });

  ipcMain.handle('proyectos:getAll', () => {
    return getDb().prepare(`
      SELECT p.*, m.nombre as materia_nombre, m.color as materia_color
      FROM proyectos p
      JOIN materias m ON p.materia_id = m.id
      ORDER BY p.fecha_limite ASC
    `).all();
  });

  ipcMain.handle('proyectos:getOne', (_, id) => {
    return getDb().prepare(`SELECT * FROM proyectos WHERE id = ?`).get(id);
  });

  ipcMain.handle('proyectos:crear', (_, { materia_id, nombre, descripcion, unidad, fecha_limite }) => {
    return getDb().prepare(`
      INSERT INTO proyectos (materia_id, nombre, descripcion, unidad, fecha_limite)
      VALUES (?, ?, ?, ?, ?)
    `).run(materia_id, nombre, descripcion ?? null, unidad ?? null, fecha_limite ?? null);
  });

  ipcMain.handle('proyectos:actualizar', (_, { id, nombre, descripcion, unidad, estado, prioridad, fecha_limite }) => {
    return getDb().prepare(`
      UPDATE proyectos 
      SET nombre = ?, descripcion = ?, unidad = ?, estado = ?, prioridad = ?, 
          fecha_limite = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nombre, descripcion, unidad, estado, prioridad, fecha_limite, id);
  });

  ipcMain.handle('proyectos:eliminar', (_, id) => {
    return getDb().prepare(`DELETE FROM proyectos WHERE id = ?`).run(id);
  });

  ipcMain.handle('proyectos:progreso', (_, proyectoId) => {
    return getDb().prepare(`
      SELECT COUNT(*) as total, SUM(completada) as completadas
      FROM tareas WHERE proyecto_id = ?
    `).get(proyectoId);
  });
};

module.exports = { registerProyectoHandlers };