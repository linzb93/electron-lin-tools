import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu,
  Tray,
  nativeImage,
  dialog,
} from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import isDev from "electron-is-dev";
import registerRoute from "./plugins/route";
import { root, publicPath } from "./plugins/constant";
import unhandled from "electron-unhandled";
unhandled();
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
  win = new BrowserWindow({
    title: "我的工具箱",
    width: 1000,
    height: 750,
    webPreferences: {
      preload,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url);
  } else {
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  createWindow();
  if (!isDev) {
    isMac &&
      app.dock.setIcon(
        nativeImage.createFromPath(join(publicPath, "logo.icns"))
      );
    // 托盘
    let tray = new Tray(
      nativeImage.createFromPath(join(publicPath, "logo_16x16.png"))
    );
    const contextMenu = Menu.buildFromTemplate([
      { label: "打开窗口", click: createWindow },
      { label: "退出", click: app.quit },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on("double-click", () => {
      if (!win) createWindow();
    });
  }

  // 应用菜单
  const menu = Menu.buildFromTemplate([
    {
      label: "应用",
      submenu: [
        { role: "reload" },
        {
          label: "about",
          click: async () => {
            const pkg = {
              version: "v1.1.0",
            };
            dialog.showMessageBox({
              title: "关于我们",
              message: `${
                pkg.version
              }\n @copyright ${new Date().getFullYear()} linzb93`,
            });
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "调试",
      submenu: [
        { role: "toggleDevTools" },
        {
          label: "打开缓存页面",
          click: () => {
            shell.openPath(root);
          },
          visible: isDev,
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
  registerRoute();
});

app.on("window-all-closed", () => {
  win = null;
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }
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
