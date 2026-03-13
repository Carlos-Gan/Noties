const parseContenido = (contenido) => {
  try {
    return typeof contenido === "string" ? JSON.parse(contenido) : contenido;
  } catch {
    return { type: "doc", content: [] };
  }
};

// Función auxiliar para convertir tags de string a array
const parseTags = (tagsStr) => {
  if (!tagsStr) return [];
  return tagsStr.split(",").filter(Boolean);
};

// Función que registra todos los handlers de apuntes
function registerApunteHandlers(ipcMain, getDb) {
  ipcMain.handle("apuntes:getFavoritos", () => {
    const apuntes = getDb()
      .prepare(
        `
        SELECT a.*, m.nombre as materia_nombre, m.color as materia_color
        FROM apuntes a
        JOIN materias m ON a.materia_id = m.id
        WHERE a.favorito = 1
        ORDER BY a.updated_at DESC
      `,
      )
      .all();

    return apuntes.map((a) => ({
      ...a,
      contenido: parseContenido(a.contenido),
    }));
  });

  ipcMain.handle("apuntes:getByMateria", async (event, materiaId) => {
    const stmt = getDb().prepare(`
    SELECT a.*,
      m.nombre as materia_nombre,
      m.color as materia_color,
      (SELECT GROUP_CONCAT(t.nombre)
       FROM tags t
       JOIN apunte_tags at ON t.id = at.tag_id
       WHERE at.apunte_id = a.id) as tags_list
    FROM apuntes a
    LEFT JOIN materias m ON a.materia_id = m.id
    WHERE a.materia_id = ?
    ORDER BY a.updated_at DESC
  `);

    const apuntes = stmt.all(materiaId);
    return apuntes.map((a) => ({
      ...a,
      contenido: parseContenido(a.contenido),
      tags: parseTags(a.tags_list),
    }));
  });

  ipcMain.handle("apuntes:getOne", (_, id) => {
    const apunte = getDb()
      .prepare(
        `
        SELECT a.*, 
        (SELECT GROUP_CONCAT(t.nombre)
         FROM tags t
         JOIN apunte_tags at ON t.id = at.tag_id
         WHERE at.apunte_id = a.id) as tags_list
        FROM apuntes a WHERE a.id = ?
      `,
      )
      .get(id);

    if (!apunte) return null;

    return {
      ...apunte,
      contenido: parseContenido(apunte.contenido),
      tags: parseTags(apunte.tags_list),
    };
  });

  ipcMain.handle("apuntes:crear", (_, { materia_id, titulo, unidad }) => {
    const contenidoVacio = { type: "doc", content: [] };

    const result = getDb()
      .prepare(
        `
        INSERT INTO apuntes (materia_id, titulo, unidad, contenido)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(materia_id, titulo, unidad ?? null, JSON.stringify(contenidoVacio));

    const apunte = getDb()
      .prepare(`SELECT * FROM apuntes WHERE id = ?`)
      .get(result.lastInsertRowid);

    return {
      ...apunte,
      contenido: contenidoVacio,
    };
  });

  ipcMain.handle(
    "apuntes:guardar",
    async (event, { id, titulo, contenido, unidad, tags }) => {
      const transaction = getDb().transaction(
        (apunteId, titulo, contenido, unidad, tagsArray) => {
          getDb()
            .prepare(
              `
        UPDATE apuntes 
        SET titulo = ?, contenido = ?, unidad = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
            )
            .run(titulo, contenido, unidad, apunteId);

          getDb()
            .prepare(`DELETE FROM apunte_tags WHERE apunte_id = ?`)
            .run(apunteId);

          for (const tagName of tagsArray) {
            getDb()
              .prepare(`INSERT OR IGNORE INTO tags (nombre) VALUES (?)`)
              .run(tagName);
            const tag = getDb()
              .prepare(`SELECT id FROM tags WHERE nombre = ?`)
              .get(tagName);
            getDb()
              .prepare(
                `INSERT INTO apunte_tags (apunte_id, tag_id) VALUES (?, ?)`,
              )
              .run(apunteId, tag.id);
          }
        },
      );

      try {
        transaction(id, titulo, contenido, unidad, tags);
        return { success: true };
      } catch (error) {
        console.error("Error en transacción de guardado:", error);
        throw error;
      }
    },
  );

  ipcMain.handle("apuntes:toggleFavorito", (_, id) => {
    return getDb()
      .prepare(
        `
        UPDATE apuntes
        SET favorito = NOT favorito
        WHERE id = ?
      `,
      )
      .run(id);
  });

  ipcMain.handle("apuntes:togglePinned", (_, id) => {
    return getDb()
      .prepare(
        `
        UPDATE apuntes
        SET pinned = NOT pinned
        WHERE id = ?
      `,
      )
      .run(id);
  });

  ipcMain.handle("apuntes:eliminar", (_, id) => {
    return getDb().prepare(`DELETE FROM apuntes WHERE id = ?`).run(id);
  });

  ipcMain.handle("apuntes:buscar", (_, query) => {
    const apuntes = getDb()
      .prepare(
        `
        SELECT a.*, m.nombre as materia_nombre, m.color as materia_color
        FROM apuntes a
        JOIN materias m ON a.materia_id = m.id
        WHERE a.titulo LIKE ? OR a.contenido LIKE ?
        ORDER BY a.updated_at DESC
      `,
      )
      .all(`%${query}%`, `%${query}%`);

    return apuntes.map((a) => ({
      ...a,
      contenido: parseContenido(a.contenido),
    }));
  });
}

// Exporta la función para que main.js la use
module.exports = { registerApunteHandlers };
