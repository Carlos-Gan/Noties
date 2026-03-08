const registerVaultHandlers = (
  ipcMain,
  dialog,
  getConfig,
  saveConfig,
  conectarDB,
) => {
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
    const ok = conectarDB(result.filePath);
    return { ok };
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
    const ok = conectarDB(vaultPath);
    return { ok };
  });
};

module.exports = { registerVaultHandlers };
