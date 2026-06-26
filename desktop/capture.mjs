// Dev-only: verify the two-window open flow + screenshot (no browser).
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIL_W = 64, RAIL_H = 156, DRAW_W = 320, DRAW_H = 448;
let rail, drawer;

function place() {
  const { workArea } = screen.getPrimaryDisplay();
  const rx = workArea.x + workArea.width - RAIL_W - 8;
  rail.setBounds({ x: rx, y: Math.round(workArea.y + (workArea.height - RAIL_H) / 2), width: RAIL_W, height: RAIL_H });
  drawer.setBounds({ x: rx - DRAW_W - 2, y: Math.round(workArea.y + (workArea.height - DRAW_H) / 2), width: DRAW_W, height: DRAW_H });
}
function makeWin(w, h, file, show) {
  const win = new BrowserWindow({
    width: w, height: h, frame: false, resizable: false, show,
    backgroundColor: "#0b0e16",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: false },
  });
  win.loadFile(path.join(__dirname, file));
  return win;
}
ipcMain.on("toggle-drawer", () => { if (drawer.isVisible()) drawer.hide(); else { place(); drawer.showInactive(); } });
ipcMain.on("hide-drawer", () => drawer.hide());
ipcMain.on("close-app", () => {});

app.whenReady().then(async () => {
  rail = makeWin(RAIL_W, RAIL_H, "rail.html", true);
  drawer = makeWin(DRAW_W, DRAW_H, "drawer.html", false);
  place();
  await new Promise((r) => setTimeout(r, 500));
  await rail.webContents.executeJavaScript("document.getElementById('logo').click();");
  await new Promise((r) => setTimeout(r, 500));
  console.log("DRAWER_VISIBLE " + drawer.isVisible());
  writeFileSync(path.join(__dirname, "cap-rail.png"), (await rail.webContents.capturePage()).toPNG());
  writeFileSync(path.join(__dirname, "cap-drawer.png"), (await drawer.webContents.capturePage()).toPNG());
  app.quit();
});
