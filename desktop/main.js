// OneChat desktop widget — Electron main process.
//
// A frameless, transparent, always-on-top overlay SNAPPED to the right edge of
// the screen. Collapsed it's a tiny ~3-icon launcher; tap to expand it into a
// compact drawer (the lightweight hub) that grows leftward from the right edge.
// Never a blocking window — a sleek overlay, like the OneChatMini prototype.

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// Collapsed = a small ~3-icon launcher; expanded = rail + compact drawer.
const RAIL_W = 56;
const RAIL_H = 134;  // ~3 icons tall — a compact comm action bar
const PANEL_W = 348;
const PANEL_H = 460;

let win;

// Snap the window to the RIGHT edge of the screen, vertically centered.
function anchorRight(width, height) {
  if (!win) return;
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - width - 12;
  const y = Math.round(workArea.y + (workArea.height - height) / 2);
  win.setBounds({ x, y, width, height });
}

function createWindow() {
  win = new BrowserWindow({
    width: RAIL_W,
    height: RAIL_H,
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
    focusable: true,
    // Don't steal focus when it pops up — it's an overlay, not the main window.
    acceptFirstMouse: true,
  });

  // Stay above full-screen apps too.
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, 'shell.html'));
  anchorRight(RAIL_W, RAIL_H);
}

// Renderer asks to expand/collapse; resize + keep snapped to the right edge.
ipcMain.on('set-expanded', (_event, expanded) => {
  if (expanded) anchorRight(PANEL_W, PANEL_H);
  else anchorRight(RAIL_W, RAIL_H);
});

ipcMain.on('close-widget', () => app.quit());

app.whenReady().then(createWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => app.quit());
