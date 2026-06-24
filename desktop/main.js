// OneChat desktop widget — Electron main process.
//
// Rebuilds the OneChatMini.ps1 prototype as a real shell: a frameless,
// transparent, always-on-top window anchored to the left edge of the screen.
// It starts as a skinny RAIL and expands to a RAIL + DRAWER (which hosts the
// actual OneChat web app) — the same rail/drawer behavior as the PowerShell
// prototype, but cross-platform-ready and backed by the real hub later.

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const RAIL_W = 76;   // collapsed: just the rail
const PANEL_W = 404; // expanded: rail + drawer
const HEIGHT = 560;

let win;

// Pin the window to the left edge, vertically centered (like the prototype).
function anchorLeft(width) {
  if (!win) return;
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + 12;
  const y = Math.round(workArea.y + (workArea.height - HEIGHT) / 2);
  win.setBounds({ x, y, width, height: HEIGHT });
}

function createWindow() {
  win = new BrowserWindow({
    width: RAIL_W,
    height: HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // the drawer embeds the OneChat app via <webview>
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Stay above full-screen apps too.
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, 'shell.html'));
  anchorLeft(RAIL_W);
}

// Renderer asks to expand/collapse; main resizes + re-anchors to the left edge.
ipcMain.on('set-expanded', (_event, expanded) => {
  anchorLeft(expanded ? PANEL_W : RAIL_W);
});

ipcMain.on('close-widget', () => app.quit());

app.whenReady().then(createWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => app.quit());
