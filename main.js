const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 760,
    minHeight: 520,
    backgroundColor: '#0f1115',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile(path.join(__dirname, 'src', 'app.html'));

  // bloqueio ao minimizar fica a cargo do app (visibilitychange dispara no hide)
  win.on('minimize', () => win.webContents.executeJavaScript(
    'if(typeof ST!=="undefined"&&ST.key&&CFG.autolockMin){if(ST.pin)softLock();else if(!ST.dirty)lockNow()}', true
  ).catch(() => {}));
}

// ── Atualizações: só quando o usuário aciona nas configurações (nunca automático).
// Windows: electron-updater baixa e instala. Mac: builds sem assinatura não podem
// se auto-instalar — apenas avisa e abre a página de download.
const newerThan = (a, b) => {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); }
  return false;
};
ipcMain.handle('pf-check-update', async () => {
  if (process.platform === 'win32' && app.isPackaged) {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = true;
    autoUpdater.removeAllListeners('update-downloaded');
    autoUpdater.on('update-downloaded', async info => {
      const r = await dialog.showMessageBox({
        type: 'info',
        message: `PassForge ${info.version} baixado.`,
        detail: 'Reiniciar agora para instalar? Salve o cofre antes.',
        buttons: ['Reiniciar agora', 'Depois'],
        cancelId: 1
      });
      if (r.response === 0) autoUpdater.quitAndInstall();
    });
    return new Promise(resolve => {
      autoUpdater.once('update-not-available', () => resolve({ status: 'latest' }));
      autoUpdater.once('update-available', i => resolve({ status: 'downloading', version: i.version }));
      autoUpdater.once('error', e => resolve({ status: 'error', message: String(e) }));
      autoUpdater.checkForUpdates();
    });
  }
  try {
    const res = await fetch('https://api.github.com/repos/M4ndr4k3s/passforge/releases/latest');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const latest = String((await res.json()).tag_name || '').replace(/^v/, '');
    return { status: newerThan(latest, app.getVersion()) ? 'manual' : 'latest', version: latest };
  } catch (e) { return { status: 'error', message: String(e) }; }
});
ipcMain.handle('pf-open-releases', () =>
  shell.openExternal('https://github.com/M4ndr4k3s/passforge/releases/latest'));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
