// OneChat desktop widget — Electron main process.
//
// Two fixed-size, frameless, always-on-top windows snapped to the RIGHT edge:
//   • rail   — small, always visible (logo / open / close)
//   • drawer — the hub; shown/hidden next to the rail on demand
// No window resizing (transparent Windows windows can't be resized) and no
// click-through tricks — each window is exactly its content, so clicks always
// land and the desktop behind stays free.

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const RAIL_W = 72, RAIL_H = 200;
const DRAW_W = 320, DRAW_H = 448;

let rail, drawer;

function place() {
  const { workArea } = screen.getPrimaryDisplay();
  const rx = workArea.x + workArea.width - RAIL_W - 8;
  const ry = Math.round(workArea.y + (workArea.height - RAIL_H) / 2);
  rail.setBounds({ x: rx, y: ry, width: RAIL_W, height: RAIL_H });
  if (drawer) {
    const dy = Math.round(workArea.y + (workArea.height - DRAW_H) / 2);
    drawer.setBounds({ x: rx - DRAW_W - 2, y: dy, width: DRAW_W, height: DRAW_H });
  }
}

function makeWin(w, h, file, show) {
  const win = new BrowserWindow({
    width: w, height: h, frame: false, transparent: true, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, hasShadow: false, show,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Preload reads the live-messages file (fs) — sandboxed preloads can't
      // require Node modules, which silently broke the whole bridge before.
      sandbox: false,
    },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, file));
  return win;
}

function createWindows() {
  rail = makeWin(RAIL_W, RAIL_H, 'rail.html', true);
  drawer = makeWin(DRAW_W, DRAW_H, 'drawer.html', false);
  place();
}

ipcMain.on('toggle-drawer', () => {
  if (!drawer) return;
  if (drawer.isVisible()) drawer.hide();
  else { place(); drawer.showInactive(); }
});
ipcMain.on('hide-drawer', () => drawer && drawer.hide());
ipcMain.on('close-app', () => app.quit());

// Real send: route to the connector that owns the thread (tg- / gm- prefix) and
// run its send.mjs. We reuse Electron's bundled Node via ELECTRON_RUN_AS_NODE so
// there's no separate Node install dependency. Returns { ok, error } to the UI.
ipcMain.handle('send-message', async (_e, { id, text }) => {
  const dir = String(id).startsWith('gm-') ? 'gmail' : 'telegram';
  const cwd = path.join(__dirname, '..', 'connectors', dir);
  return await new Promise((resolve) => {
    const child = spawn(process.execPath, ['send.mjs', id, text], {
      cwd,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    });
    let err = '';
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => resolve({ ok: false, error: e.message }));
    child.on('close', (code) =>
      resolve({ ok: code === 0, error: err.trim() || `exit ${code}` }),
    );
  });
});

app.whenReady().then(createWindows);
app.on('activate', () => { if (!rail) createWindows(); });
app.on('window-all-closed', () => app.quit());
