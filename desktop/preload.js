// Safe bridge between the rail UI (renderer) and the window controls (main).
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Load REAL synced messages if a connector has produced them.
// (Telegram connector writes connectors/telegram/onechat-live.json.)
function loadLive() {
  const sources = [
    path.join(__dirname, '..', 'connectors', 'telegram', 'onechat-live.json'),
  ];
  let all = [];
  for (const p of sources) {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (Array.isArray(data)) all = all.concat(data);
      }
    } catch {
      // ignore a malformed/partial file
    }
  }
  return all;
}

contextBridge.exposeInMainWorld('oneChatWidget', {
  setExpanded: (value) => ipcRenderer.send('set-expanded', !!value),
  close: () => ipcRenderer.send('close-widget'),
  // Real synced threads (empty until a connector has run).
  liveData: loadLive(),
});
