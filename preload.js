const { contextBridge, ipcRenderer } = require('electron');

console.log('✅ Preload ejecutándose...');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});

console.log('✅ window.electron expuesto');