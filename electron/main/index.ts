import { app, BrowserWindow, shell, ipcMain, screen } from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// import isDev from "electron-is-dev";
import registerRoute from "./plugins/route";
import "./plugins/server";
import "./plugins/schedule";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;
const isMac = process.platform === "darwin";
// Set application name for Windows 10+ notifications
if (!isMac) app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.mjs");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
  const screens = screen.getAllDisplays();
  const mainScreen = screens.find(screen => screen.id === screens[0].id);
  const secondScreen = screens.find(screen => screen.id === screens[1].id);
  // 如果有双屏，窗口在第二屏全屏，否则第一屏右半屏
  let bounds;
  if (secondScreen) {
    bounds = {
      width: secondScreen.size.width,
      height: secondScreen.size.height,
      x: 0,
      y: 0
    };
  } else {
    bounds = {
      width: mainScreen.size.width / 2,
      height: mainScreen.size.height,
      x: mainScreen.size.width / 2,
      y: 0
    }
  }
  win = new BrowserWindow({
    title: "小林工具箱",
    ...bounds,
    webPreferences: {
      preload,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(async () => {
  createWindow();
  // 设置开机自启动
  // app.setLoginItemSettings({
  //   openAtLogin: !isDev
  // });
  registerRoute();
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

export function getMainWindow() {
  return win;
}