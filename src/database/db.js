const initDB = (db) => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS materias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      icono TEXT DEFAULT '📚',
      metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS apuntes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER,
      titulo TEXT NOT NULL,
      contenido TEXT,
      favorito INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
    )
  `,
  ).run();

  //Proyectos: pertenecen a una materia
  db.prepare(
    `
CREATE TABLE IF NOT EXISTS proyectos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materia_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT CHECK(estado IN ('pendiente', 'en_progreso', 'entregado')) DEFAULT 'pendiente',
  fecha_limite TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
)
`,
  ).run();

  //Tareas: pueden pertenecer a materia Y opcionalmente a un proyecto
  db.prepare(
    `
CREATE TABLE IF NOT EXISTS tareas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materia_id INTEGER NOT NULL,
  proyecto_id INTEGER,            
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
  `,
  ).run();

  console.log("✅ Cerebro sincronizado correctamente.");
};

module.exports = { initDB };
