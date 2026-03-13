const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = require("electron-is-dev");
const Database = require("better-sqlite3");
const { initDB } = require("./src/database/db");

// Handlers de tus módulos
const { registerVaultHandlers } = require("./src/ipc/vault");
const { registerMateriaHandlers } = require("./src/ipc/materias");
const { registerApunteHandlers } = require("./src/ipc/apuntes");
const { registerProyectoHandlers } = require("./src/ipc/proyectos");
const { registerTareaHandlers } = require("./src/ipc/tareas");
const { registerTagHandlers } = require("./src/ipc/tags");
const { registerConfigHandlers } = require("./src/ipc/config");

const configPath = path.join(app.getPath("userData"), "config.json");

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
    backgroundColor: "#0c0c0c",
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  // CORRECCIÓN AQUÍ: Línea de carga limpia
  const url = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "./dist/index.html")}`;

  win.loadURL(url);

  if (isDev) win.webContents.openDevTools();
}

// Flags para evitar errores en Linux (Durango Fix)
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-dev-shm-usage");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");

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