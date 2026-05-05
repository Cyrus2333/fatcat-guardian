const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fatcat', {
  onSnapshot(callback) {
    const handler = (_event, snapshot) => callback(snapshot);
    ipcRenderer.on('fatcat:snapshot', handler);
    ipcRenderer.send('fatcat:overlay-ready');
    return () => {
      ipcRenderer.removeListener('fatcat:snapshot', handler);
    };
  },
  finishBlockingIntro() {
    ipcRenderer.send('fatcat:finish-blocking-intro');
  },
  skipRest() {
    ipcRenderer.send('fatcat:skip-rest');
  },
  getSettings() {
    return ipcRenderer.invoke('fatcat:get-settings');
  },
  saveCustomSettings(payload) {
    return ipcRenderer.invoke('fatcat:save-custom-settings', payload);
  },
  resizeSettingsWindow(payload) {
    ipcRenderer.send('fatcat:resize-settings-window', payload);
  },
});
