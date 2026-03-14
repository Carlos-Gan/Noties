function hayConflictoHorario(nuevo, existentes) {
  const inicioNuevo = nuevo.inicio;
  const finNuevo = nuevo.fin;

  return existentes.some((h) => {
    if (h.dia !== nuevo.dia) return false;

    return inicioNuevo < h.fin && finNuevo > h.inicio;
  });
}

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

  try {
    ipcMain.handle(
      "materias:crear",
      (_, { nombre, color, icono, metadata }) => {
        const db = getDb();

        const nuevaMetadata = JSON.parse(metadata || "{}");
        const nuevosHorarios = nuevaMetadata.horarios || [];

        // Obtener todas las materias existentes
        const materias = db
          .prepare(`SELECT metadata FROM materias WHERE archivada = 0`)
          .all();

        let horariosExistentes = [];

        for (const m of materias) {
          try {
            const data = JSON.parse(m.metadata || "{}");
            if (data.horarios) {
              horariosExistentes.push(...data.horarios);
            }
          } catch {}
        }

        // Verificar conflictos
        for (const horario of nuevosHorarios) {
          if (hayConflictoHorario(horario, horariosExistentes)) {
            throw new Error("Conflicto de horario con otra materia");
          }
        }

        return db
          .prepare(
            `
      INSERT INTO materias (nombre, color, icono, metadata) 
      VALUES (?, ?, ?, ?)
    `,
          )
          .run(nombre, color, icono ?? "📚", metadata ?? "{}");
      },
    );
  } catch (err) {
    alert("⚠️ Este horario se cruza con otra materia.");
  }

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

  ipcMain.handle("materias:delete", (_, id) => {
    return getDb().prepare(`DELETE FROM materias WHERE id = ?`).run(id);
  });

  ipcMain.handle("materias:updateMetadata", (_, { id, metadata }) => {
    return getDb()
      .prepare(`UPDATE materias SET metadata = ? WHERE id = ?`)
      .run(metadata, id);
  });
};

module.exports = { registerMateriaHandlers };
