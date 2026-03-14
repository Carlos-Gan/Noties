const initDB = (db) => {

  // ─── Activar foreign keys (SQLite los desactiva por defecto) ──
  db.prepare(`PRAGMA foreign_keys = ON`).run();
  // ─── Mejorar rendimiento ──────────────────────────────────────
  db.prepare(`PRAGMA journal_mode = WAL`).run();
  db.prepare(`PRAGMA synchronous = NORMAL`).run();

  // ─── Materias ─────────────────────────────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS materias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      icono TEXT DEFAULT '📚',
      metadata TEXT DEFAULT '{}',
      archivada INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // ─── Tags ─────────────────────────────────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3b82f6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // ─── Apuntes ──────────────────────────────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS apuntes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER,
      unidad TEXT,
      titulo TEXT NOT NULL,
      contenido TEXT,
      favorito INTEGER DEFAULT 0,
      pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Tags <-> Apuntes (many-to-many) ──────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS apunte_tags (
      apunte_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (apunte_id, tag_id),
      FOREIGN KEY (apunte_id) REFERENCES apuntes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Vínculos entre apuntes ───────────────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS apunte_links (
      desde_id INTEGER NOT NULL,
      hacia_id INTEGER NOT NULL,
      PRIMARY KEY (desde_id, hacia_id),
      FOREIGN KEY (desde_id) REFERENCES apuntes(id) ON DELETE CASCADE,
      FOREIGN KEY (hacia_id) REFERENCES apuntes(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Proyectos ────────────────────────────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS proyectos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      unidad TEXT,
      estado TEXT CHECK(estado IN ('pendiente', 'en_progreso', 'entregado')) DEFAULT 'pendiente',
      prioridad TEXT CHECK(prioridad IN ('baja', 'media', 'alta')) DEFAULT 'media',
      fecha_limite TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Tags <-> Proyectos (many-to-many) ────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS proyecto_tags (
      proyecto_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (proyecto_id, tag_id),
      FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Tareas ───────────────────────────────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER NOT NULL,
      proyecto_id INTEGER,
      unidad TEXT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      prioridad TEXT CHECK(prioridad IN ('baja', 'media', 'alta')) DEFAULT 'media',
      completada INTEGER DEFAULT 0,
      fecha_limite TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
      FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Tags <-> Tareas (many-to-many) ───────────────────────────
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tarea_tags (
      tarea_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (tarea_id, tag_id),
      FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `).run();

  // ─── Evaluaciones ───────────────────────────

  db.prepare(`
    CREATE TABLE IF NOT EXISTS evaluaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      porcentaje REAL NOT NULL,
      calificacion REAL,
      fecha DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    )
    `).run();

  // ─── Índices para búsquedas rápidas ───────────────────────────
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_apuntes_materia ON apuntes(materia_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_apuntes_favorito ON apuntes(favorito)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_apuntes_updated ON apuntes(updated_at DESC)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_tareas_materia ON tareas(materia_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_tareas_proyecto ON tareas(proyecto_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_tareas_completada ON tareas(completada)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_proyectos_materia ON proyectos(materia_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado)`).run();

  console.log('✅ Cerebro sincronizado correctamente.');
};

module.exports = { initDB };