// Safe bridge between the rail UI (renderer) and the window controls (main).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('oneChatWidget', {
  setExpanded: (value) => ipcRenderer.send('set-expanded', !!value),
  close: () => ipcRenderer.send('close-widget'),
  // Where the OneChat app is served. Run the Expo web app first
  // (`cd client && npx expo start --web`), or override with ONECHAT_URL.
  appUrl: process.env.ONECHAT_URL || 'http://localhost:8081',
});
