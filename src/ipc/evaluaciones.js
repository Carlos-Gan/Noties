// ==================== EVALUACIONES ====================
module.exports = function registerEvalHandlers(ipcMain, getDb) {
  console.log("⚙️ Registrando handlers de evaluaciones...");

  ipcMain.handle("evaluaciones:getByMateria", async (event, materiaId) => {
    try {
      const db = getDb();
      const stmt = db.prepare(`
        SELECT * FROM evaluaciones 
        WHERE materia_id = ? 
        ORDER BY 
          CASE 
            WHEN unidad IS NULL THEN 1 
            ELSE 0 
          END,
          unidad,
          fecha DESC
      `);
      return stmt.all(materiaId);
    } catch (error) {
      console.error("Error getting evaluaciones:", error);
      return [];
    }
  });

  ipcMain.handle("evaluaciones:crear", async (event, data) => {
    try {
      const db = getDb();
      const {
        materia_id,
        nombre,
        tipo,
        unidad,
        porcentaje,
        calificacion,
        fecha,
      } = data;
      const stmt = db.prepare(`
        INSERT INTO evaluaciones (materia_id, nombre, tipo, unidad, porcentaje, calificacion, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        materia_id,
        nombre,
        tipo,
        unidad || null,
        porcentaje,
        calificacion || null,
        fecha || null,
      );

      event.sender.send("evaluaciones-updated", { materiaId: materia_id });
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error("Error creating evaluacion:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("evaluaciones:actualizar", async (event, data) => {
    try {
      const db = getDb();
      const { id, nombre, tipo, unidad, porcentaje, calificacion, fecha } =
        data;
      const stmt = db.prepare(`
        UPDATE evaluaciones 
        SET nombre = ?, tipo = ?, unidad = ?, porcentaje = ?, calificacion = ?, fecha = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(
        nombre,
        tipo,
        unidad,
        porcentaje,
        calificacion,
        fecha,
        id,
      );

      const materia = db
        .prepare("SELECT materia_id FROM evaluaciones WHERE id = ?")
        .get(id);
      if (materia) {
        event.sender.send("evaluaciones-updated", {
          materiaId: materia.materia_id,
        });
      }

      return { success: true, changes: result.changes };
    } catch (error) {
      console.error("Error updating evaluacion:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("evaluaciones:eliminar", async (event, id) => {
    try {
      const db = getDb();
      const materia = db
        .prepare("SELECT materia_id FROM evaluaciones WHERE id = ?")
        .get(id);

      const stmt = db.prepare("DELETE FROM evaluaciones WHERE id = ?");
      const result = stmt.run(id);

      if (materia) {
        event.sender.send("evaluaciones-updated", {
          materiaId: materia.materia_id,
        });
      }

      return { success: true, changes: result.changes };
    } catch (error) {
      console.error("Error deleting evaluacion:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("evaluaciones:getAll", async () => {
    try {
      const db = getDb();
      const stmt = db.prepare(`
        SELECT e.*, m.nombre as materia_nombre, m.color as materia_color 
        FROM evaluaciones e
        LEFT JOIN materias m ON e.materia_id = m.id
        ORDER BY 
          m.nombre,
          CASE 
            WHEN e.unidad IS NULL THEN 1 
            ELSE 0 
          END,
          e.unidad,
          e.fecha DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error("Error getting all evaluaciones:", error);
      return [];
    }
  });

  console.log("✅ Handlers de evaluaciones registrados");
};
