const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 760,
    minHeight: 520,
    backgroundColor: '#0f1115',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'src', 'app.html'));

  // bloqueio ao minimizar fica a cargo do app (visibilitychange dispara no hide)
  win.on('minimize', () => win.webContents.executeJavaScript(
    'if(typeof ST!=="undefined"&&ST.key&&CFG.autolockMin){if(ST.pin)softLock();else if(!ST.dirty)lockNow()}', true
  ).catch(() => {}));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
