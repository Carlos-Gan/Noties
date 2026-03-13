const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ Preload ejecutándose...");

contextBridge.exposeInMainWorld("electronAPI", {
  // Verificación de estado inicial
  checkDB: () => ipcRenderer.invoke("check-db-status"),

  // Exportación
  exportPDF: (title) => ipcRenderer.invoke("export-to-pdf", title),

  // Vault Management (para tu WelcomePage)
  selectVault: () => ipcRenderer.invoke("select-vault"),
  createVault: () => ipcRenderer.invoke("create-vault"),

  // Método genérico por si lo necesitas
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});

console.log("✅ window.electronAPI expuesto");
