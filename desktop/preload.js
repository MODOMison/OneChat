// Safe bridge between the windows (renderer) and the main process.
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Load REAL synced messages if a connector has produced them.
function loadLive() {
  const sources = [
    path.join(__dirname, '..', 'connectors', 'telegram', 'onechat-live.json'),
    path.join(__dirname, '..', 'connectors', 'gmail', 'onechat-live.json'),
  ];
  let all = [];
  for (const p of sources) {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (Array.isArray(data)) all = all.concat(data);
      }
    } catch {
      // ignore malformed file
    }
  }
  return all;
}

contextBridge.exposeInMainWorld('oneChatWidget', {
  toggleDrawer: () => ipcRenderer.send('toggle-drawer'),
  hideDrawer: () => ipcRenderer.send('hide-drawer'),
  close: () => ipcRenderer.send('close-app'),
  // Returns { ok, error }. Fires the owning connector's send.mjs in the main process.
  sendMessage: (payload) => ipcRenderer.invoke('send-message', payload),
  liveData: loadLive(),
});
