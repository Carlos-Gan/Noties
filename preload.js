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

  // ==================== EVALUACIONES ====================
  evaluaciones: {
    getByMateria: (materiaId) =>
      ipcRenderer.invoke("evaluaciones:getByMateria", materiaId),
    getAll: () => ipcRenderer.invoke("evaluaciones:getAll"),
    crear: (data) => ipcRenderer.invoke("evaluaciones:crear", data),
    actualizar: (data) => ipcRenderer.invoke("evaluaciones:actualizar", data),
    eliminar: (id) => ipcRenderer.invoke("evaluaciones:eliminar", id),
  },

  // Método genérico por si lo necesitas
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});

console.log("✅ window.electronAPI expuesto");
