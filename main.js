const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const Database = require('better-sqlite3');
const { initDB } = require('./src/database/db');

const { registerVaultHandlers } = require('./src/ipc/vault');
const { registerMateriaHandlers } = require('./src/ipc/materias');
const { registerApunteHandlers } = require('./src/ipc/apuntes');
const { registerProyectoHandlers } = require('./src/ipc/proyectos');
const { registerTareaHandlers } = require('./src/ipc/tareas');
const { registerTagHandlers } = require('./src/ipc/tags');
const { registerConfigHandlers } = require('./src/ipc/config');

const configPath = path.join(app.getPath('userData'), 'config.json');

function getConfig() {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

let db = null;
const getDb = () => {
  if (!db) throw new Error('Base de datos no conectada.');
  return db;
};

function conectarDB(vaultPath) {
  try {
    if (db) db.close();
    db = new Database(vaultPath);
    initDB(db);
    console.log('✅ Conectado a DB en:', vaultPath);
    return true;
  } catch (error) {
    console.error('Error conectando a DB:', error);
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 1024,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
    autoHideMenuBar: true,
  });

  win.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, './dist/index.html')}`
  );

  if (isDev) win.webContents.openDevTools();
}

app.whenReady().then(() => {
  const config = getConfig();
  if (config.vault_path && fs.existsSync(config.vault_path)) {
    conectarDB(config.vault_path);
  }

  registerVaultHandlers(ipcMain, dialog, getConfig, saveConfig, conectarDB);
  registerMateriaHandlers(ipcMain, getDb);
  registerApunteHandlers(ipcMain, getDb);
  registerProyectoHandlers(ipcMain, getDb);
  registerTareaHandlers(ipcMain, getDb);
  registerTagHandlers(ipcMain, getDb);
  registerConfigHandlers(ipcMain, getConfig, saveConfig, getDb);

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});