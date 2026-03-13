const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Usa path.join con __dirname para asegurar que busque DENTRO de la carpeta de la app
const { initDB } = require(path.join(__dirname, "src", "database", "db"));

const { registerVaultHandlers } = require(
  path.join(__dirname, "src", "ipc", "vault"),
);
const { registerMateriaHandlers } = require(
  path.join(__dirname, "src", "ipc", "materias"),
);
const { registerApunteHandlers } = require(
  path.join(__dirname, "src", "ipc", "apuntes"),
);
const { registerProyectoHandlers } = require(
  path.join(__dirname, "src", "ipc", "proyectos"),
);
const { registerTareaHandlers } = require(
  path.join(__dirname, "src", "ipc", "tareas"),
);
const { registerTagHandlers } = require(
  path.join(__dirname, "src", "ipc", "tags"),
);
const { registerConfigHandlers } = require(
  path.join(__dirname, "src", "ipc", "config"),
);

const configPath = path.join(app.getPath("userData"), "config.json");

const isDev = !app.isPackaged;

// --- FUNCIONES DE CONFIGURACIÓN ---
function getConfig() {
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    return {};
  }
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

// --- GESTIÓN DE BASE DE DATOS ---
let db = null;
const getDb = () => {
  if (!db) throw new Error("Base de datos no conectada.");
  return db;
};

function conectarDB(vaultPath) {
  try {
    if (!vaultPath || !fs.existsSync(vaultPath)) return false;
    if (db) db.close();
    db = new Database(vaultPath);
    initDB(db);
    console.log("✅ Conectado a DB en:", vaultPath);
    return true;
  } catch (error) {
    console.error("Error conectando a DB:", error);
    return false;
  }
}

// --- IPC HANDLERS GLOBALES ---
ipcMain.handle("check-db-status", () => db !== null);

ipcMain.handle("export-to-pdf", async (event, title) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  try {
    const data = await win.webContents.printToPDF({ printBackground: true });
    const { filePath } = await dialog.showSaveDialog(win, {
      title: "Exportar Apunte como PDF",
      defaultPath: path.join(app.getPath("documents"), `${title}.pdf`),
      filters: [{ name: "Adobe PDF", extensions: ["pdf"] }],
    });

    if (filePath) {
      fs.writeFileSync(filePath, data);
      return { success: true, path: filePath };
    }
    return { success: false };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
});

// --- VENTANA ---
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 1024,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#0c0c0c",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // path.join es preferible aquí
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    // IMPORTANTE: Dado que en tu package.json pusiste "dist/**/*",
    // el archivo index.html VIVE dentro de una carpeta dist en el asar.
    const indexPath = path.join(__dirname, "dist", "index.html");

    win.loadFile(indexPath).catch((err) => {
      console.error("Error al cargar index.html:", err);
      // Intento de rescate si el archivo quedó en la raíz por error
      win.loadFile(path.join(__dirname, "index.html"));
    });
  }

  win.once("ready-to-show", () => {
    // Añade esto justo antes de win.show()
    win.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.log("❌ Error al cargar:", errorCode, errorDescription);
      },
    );

    win.webContents.on(
      "console-message",
      (event, level, message, line, sourceId) => {
        console.log("🖥 LOG DE LA APP:", message);
      },
    );
    win.show();
    win.webContents.openDevTools();
  });

  //if (isDev) {
  //  win.webContents.openDevTools();
  //}
}

app.commandLine.appendSwitch("disable-dev-shm-usage");

app.whenReady().then(() => {
  const config = getConfig();
  if (config.vault_path) conectarDB(config.vault_path);

  // Registro de Handlers
  registerVaultHandlers(ipcMain, dialog, getConfig, saveConfig, conectarDB);
  registerMateriaHandlers(ipcMain, getDb);
  registerApunteHandlers(ipcMain, getDb);
  registerProyectoHandlers(ipcMain, getDb);
  registerTareaHandlers(ipcMain, getDb);
  registerTagHandlers(ipcMain, getDb);
  registerConfigHandlers(ipcMain, getConfig, saveConfig, getDb);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
