// Dev-only: drive the expand flow + screenshot from Electron (no browser).
import { app, BrowserWindow, ipcMain } from "electron";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
ipcMain.on("set-ignore", () => {});

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 360,
    height: 480,
    show: false,
    backgroundColor: "#0b0e16",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  await win.loadFile(path.join(__dirname, "shell.html"));
  await new Promise((r) => setTimeout(r, 400));
  await win.webContents.executeJavaScript("document.getElementById('toggle').click();");
  await new Promise((r) => setTimeout(r, 800));

  const diag = await win.webContents.executeJavaScript(`JSON.stringify({
    cls: document.body.className,
    searchW: Math.round(document.querySelector('.search').getBoundingClientRect().width),
    railH: Math.round(document.getElementById('rail').getBoundingClientRect().height),
    winW: window.innerWidth
  })`);
  console.log("DIAG " + diag);
  writeFileSync(
    path.join(__dirname, "cap-expanded.png"),
    (await win.webContents.capturePage()).toPNG(),
  );
  app.quit();
});
