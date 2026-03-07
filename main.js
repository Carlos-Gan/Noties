const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = require("electron-is-dev");
const Database = require("better-sqlite3");
const { initDB } = require("./src/database/db");

// ─── Config ───────────────────────────────────────────
const configPath = path.join(app.getPath("userData"), "config.json");

function getConfig() {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

// ─── DB global ────────────────────────────────────────
let db = null;

function conectarDB(vaultPath) {
  try {
    if (db) db.close();

    db = new Database(vaultPath);
    initDB(db);
    console.log("Conectado a DB en:", vaultPath);
    return true;
  } catch (error) {
    console.error("Error conectando a DB:", error);
    return false;
  }
}

// ─── Middleware de seguridad Interno ──────────────────
function ensureDb() {
  if (!db) {
    const config = getConfig();
    if (config.vault_path && fs.existsSync(config.vault_path)) {
      conectarDB(config.vault_path);
    }
  }
  if (!db) {
    throw new Error("Base de datos no conectada. Por favor, selecciona un Vault.");
  }
}

// ─── Ventana ──────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 1024,
    backgroundColor: "#1e1e1e",
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false, // Solo para desarrollo, revisar antes de producción
    },
    autoHideMenuBar: true,
  });

  console.log("__dirname:", __dirname);
  console.log("Preload path:", path.resolve(__dirname, "preload.js"));
  console.log(
    "Preload existe:",
    fs.existsSync(path.resolve(__dirname, "preload.js")),
  );

  win.loadURL(
    isDev
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "./dist/index.html")}`,
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
}

// ─── IPC: Vault ───────────────────────────────────────
ipcMain.handle("vault:check", () => {
  const config = getConfig();
  return config.vault_path || null;
});

ipcMain.handle("vault:crear", async () => {
  const result = await dialog.showSaveDialog({
    title: "Crear nuevo vault",
    defaultPath: "MiCerebro",
    filters: [{ name: "Database", extensions: ["db"] }],
  });
  if (result.canceled || !result.filePath) return { ok: false };
  saveConfig({ vault_path: result.filePath });
  conectarDB(result.filePath);
  return { ok: !!db };
});

ipcMain.handle("vault:abrir", async () => {
  const result = await dialog.showOpenDialog({
    title: "Buscar vault existente",
    properties: ["openFile"],
    filters: [{ name: "Database", extensions: ["db"] }],
  });
  if (result.canceled) return { ok: false };
  const vaultPath = result.filePaths[0];
  saveConfig({ vault_path: vaultPath });
  conectarDB(vaultPath);
  return { ok: !!db };
});

// ─── IPC: Materias ────────────────────────────────────
ipcMain.handle("materias:getAll", () => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT * FROM materias ORDER BY created_at DESC
  `,
    )
    .all();
});

ipcMain.handle("materias:getOne", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT * FROM materias WHERE id = ?
  `,
    )
    .get(id);
});

ipcMain.handle("materias:crear", (_, { nombre, color, icono, metadata }) => {
  ensureDb();
  return db
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
    ensureDb();
    return db
      .prepare(
        `
    UPDATE materias SET nombre = ?, color = ?, icono = ?, metadata = ? WHERE id = ?
  `,
      )
      .run(nombre, color, icono, metadata, id);
  },
);

ipcMain.handle("materias:eliminar", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    DELETE FROM materias WHERE id = ?
  `,
    )
    .run(id);
});

// ─── IPC: Apuntes ─────────────────────────────────────
ipcMain.handle("apuntes:getByMateria", (_, materiaId) => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT * FROM apuntes WHERE materia_id = ? ORDER BY updated_at DESC
  `,
    )
    .all(materiaId);
});

ipcMain.handle("apuntes:getFavoritos", () => {
  ensureDb();
  return db
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
});

ipcMain.handle("apuntes:getOne", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT * FROM apuntes WHERE id = ?
  `,
    )
    .get(id);
});

ipcMain.handle("apuntes:crear", (_, { materia_id, titulo }) => {
  ensureDb();
  return db
    .prepare(
      `
    INSERT INTO apuntes (materia_id, titulo, contenido) VALUES (?, ?, ?)
  `,
    )
    .run(materia_id, titulo, JSON.stringify({ type: "doc", content: [] }));
});

ipcMain.handle("apuntes:guardar", (_, { id, titulo, contenido }) => {
  ensureDb();
  return db
    .prepare(
      `
    UPDATE apuntes 
    SET titulo = ?, contenido = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,
    )
    .run(titulo, JSON.stringify(contenido), id);
});

ipcMain.handle("apuntes:toggleFavorito", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    UPDATE apuntes SET favorito = NOT favorito WHERE id = ?
  `,
    )
    .run(id);
});

ipcMain.handle("apuntes:eliminar", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    DELETE FROM apuntes WHERE id = ?
  `,
    )
    .run(id);
});

ipcMain.handle("apuntes:buscar", (_, query) => {
  ensureDb();
  return db
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
});

// ─── IPC: Proyectos ───────────────────────────────────
ipcMain.handle("proyectos:getByMateria", (_, materiaId) => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT * FROM proyectos 
    WHERE materia_id = ? 
    ORDER BY fecha_limite ASC
  `,
    )
    .all(materiaId);
});

ipcMain.handle("proyectos:getAll", () => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT p.*, m.nombre as materia_nombre, m.color as materia_color
    FROM proyectos p
    JOIN materias m ON p.materia_id = m.id
    ORDER BY p.fecha_limite ASC
  `,
    )
    .all();
});

ipcMain.handle("proyectos:getOne", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    SELECT * FROM proyectos WHERE id = ?
  `,
    )
    .get(id);
});

ipcMain.handle(
  "proyectos:crear",
  (_, { materia_id, nombre, descripcion, fecha_limite }) => {
    return db
      .prepare(
        `
    INSERT INTO proyectos (materia_id, nombre, descripcion, fecha_limite)
    VALUES (?, ?, ?, ?)
  `,
      )
      .run(materia_id, nombre, descripcion ?? null, fecha_limite ?? null);
  },
);

ipcMain.handle(
  "proyectos:actualizar",
  (_, { id, nombre, descripcion, estado, fecha_limite }) => {
    return db
      .prepare(
        `
    UPDATE proyectos 
    SET nombre = ?, descripcion = ?, estado = ?, fecha_limite = ?
    WHERE id = ?
  `,
      )
      .run(nombre, descripcion, estado, fecha_limite, id);
  },
);

ipcMain.handle("proyectos:eliminar", (_, id) => {
  return db
    .prepare(
      `
    DELETE FROM proyectos WHERE id = ?
  `,
    )
    .run(id);
});

ipcMain.handle("proyectos:progreso", (_, proyectoId) => {
  // Devuelve cuántas tareas tiene y cuántas están completadas
  return db
    .prepare(
      `
    SELECT 
      COUNT(*) as total,
      SUM(completada) as completadas
    FROM tareas WHERE proyecto_id = ?
  `,
    )
    .get(proyectoId);
});

// ─── IPC: Tareas ──────────────────────────────────────
ipcMain.handle("tareas:getByMateria", (_, materiaId) => {
  return db
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
  return db
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
  ensureDb();
  // Tareas sin proyecto de una materia
  return db
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
  ensureDb();
  // Todas las tareas sin completar de todas las materias — útil para dashboard
  return db
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
    { materia_id, proyecto_id, nombre, descripcion, prioridad, fecha_limite },
  ) => {
    ensureDb();
    return db
      .prepare(
        `
    INSERT INTO tareas (materia_id, proyecto_id, nombre, descripcion, prioridad, fecha_limite)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
      )
      .run(
        materia_id,
        proyecto_id ?? null,
        nombre,
        descripcion ?? null,
        prioridad ?? "media",
        fecha_limite ?? null,
      );
  },
);

ipcMain.handle(
  "tareas:actualizar",
  (_, { id, nombre, descripcion, prioridad, fecha_limite }) => {
    ensureDb();
    return db
      .prepare(
        `
    UPDATE tareas 
    SET nombre = ?, descripcion = ?, prioridad = ?, fecha_limite = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
      )
      .run(nombre, descripcion, prioridad, fecha_limite, id);
  },
);

ipcMain.handle("tareas:toggleCompletada", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    UPDATE tareas SET completada = NOT completada WHERE id = ?
  `,
    )
    .run(id);
});

ipcMain.handle("tareas:eliminar", (_, id) => {
  ensureDb();
  return db
    .prepare(
      `
    DELETE FROM tareas WHERE id = ?
  `,
    )
    .run(id);
});

// ─── Init ─────────────────────────────────────────────
app.whenReady().then(() => {
  const config = getConfig();
  if (config.vault_path && fs.existsSync(config.vault_path)) {
    conectarDB(config.vault_path);
  }
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC: Config ──────────────────────────────────────
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

// main.js
ipcMain.handle('dashboard:getResumen', () => {
  ensureDb();
  // Traemos notas con el nombre de su materia
  const notas = db.prepare(`
    SELECT a.*, m.nombre as materia_nombre 
    FROM apuntes a 
    JOIN materias m ON a.materia_id = m.id 
    ORDER BY a.updated_at DESC LIMIT 8
  `).all();

  // Traemos tareas pendientes (ojo: tu tabla se llama 'tareas', no 'pendientes')
  const tareas = db.prepare(`
    SELECT t.*, m.nombre as materia_nombre 
    FROM tareas t 
    JOIN materias m ON t.materia_id = m.id 
    WHERE t.completada = 0 
    ORDER BY t.fecha_limite ASC LIMIT 5
  `).all();

  return { notas, tareas };
});