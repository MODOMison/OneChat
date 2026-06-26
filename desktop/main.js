// OneChat desktop widget — Electron main process.
//
// A frameless, transparent, always-on-top overlay snapped to the RIGHT edge.
// The window is a FIXED size (transparent Windows windows can't be resized via
// setBounds). Expand/collapse is pure CSS in the renderer; the empty transparent
// area is click-through (setIgnoreMouseEvents) so it never blocks your desktop.

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const WIDTH = 360;
const HEIGHT = 480;

let win;

function anchorRight() {
  if (!win) return;
  const { workArea } = screen.getPrimaryDisplay();
  win.setPosition(
    workArea.x + workArea.width - WIDTH - 8,
    Math.round(workArea.y + (workArea.height - HEIGHT) / 2),
  );
}

function createWindow() {
  win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, 'shell.html'));
  anchorRight();

  // Start fully click-through; the renderer disables this while the cursor is
  // over the rail/drawer (forward:true keeps mousemove flowing so it can tell).
  win.setIgnoreMouseEvents(true, { forward: true });
}

// Renderer toggles click-through based on what the cursor is over.
ipcMain.on('set-ignore', (_event, ignore) => {
  if (win) win.setIgnoreMouseEvents(!!ignore, { forward: true });
});

ipcMain.on('close-widget', () => app.quit());

app.whenReady().then(createWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => app.quit());
