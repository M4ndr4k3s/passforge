const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pfDesktop', {
  checkUpdate: () => ipcRenderer.invoke('pf-check-update'),
  openReleases: () => ipcRenderer.invoke('pf-open-releases')
});
