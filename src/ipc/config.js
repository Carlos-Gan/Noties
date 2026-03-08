const registerConfigHandlers = (ipcMain, getConfig, saveConfig, getDb) => {
  ipcMain.handle("config:get", (_, clave) => {
    const config = getConfig();
    return config[clave] ?? null;
  });

  ipcMain.handle("config:set", (_, clave, valor) => {
    const config = getConfig();
    config[clave] = valor;
    saveConfig(config);
    return true;
  });

  ipcMain.handle("dashboard:getResumen", () => {
    const notas = getDb()
      .prepare(
        `
      SELECT a.*, m.nombre as materia_nombre 
      FROM apuntes a 
      JOIN materias m ON a.materia_id = m.id 
      ORDER BY a.updated_at DESC LIMIT 8
    `,
      )
      .all();

    const tareas = getDb()
      .prepare(
        `
      SELECT t.*, m.nombre as materia_nombre 
      FROM tareas t 
      JOIN materias m ON t.materia_id = m.id 
      WHERE t.completada = 0 
      ORDER BY t.fecha_limite ASC LIMIT 5
    `,
      )
      .all();

    const proyectos = getDb()
      .prepare(
        `
      SELECT p.*, m.nombre as materia_nombre
      FROM proyectos p
      JOIN materias m ON p.materia_id = m.id
      WHERE p.estado != 'entregado'
      ORDER BY p.fecha_limite ASC LIMIT 5
    `,
      )
      .all();

    return { notas, tareas, proyectos };
  });
};

module.exports = { registerConfigHandlers };
