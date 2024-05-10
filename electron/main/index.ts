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
    const tray = new Tray(
      nativeImage.createFromDataURL(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0VXHyAAACeUlEQVQ4EX1TS2gUQRB93T3Tu4lRVkEleFEQIYkBUURRBEEkCB725NUvRqNeAiqevahIArkoEuMH1IMi6EGRiCAmQoiCqCGGqLj+4gZWZI3ZzK/bqtmd7B40xRymu+pVvX5VJUDWtGdqO4Teb43fSEfDd3OYFFJPwPqXR6829Ivm3aVtVjqPIJSCDefA1biEA9goEiZscwzMYUqpTFSqiaj+Wkv/Iv6qlwggVVrFWAu7xNpo1hkQibByZHBdCtBU0K+552DGMNYRkLPoGR/Y2CzhB8Drj5Sf1Dh/SGPgrUEub/BrChj7YpByy/UYK5PSJQ/Y0qpwqTOFlcskAkq7aIHAulUK418NNrUo9B1nn4BHBRIjcgCDt65R6Dmm0XUnwO2nIRS9u2U5JSLq778ZvPpgML9e4NrJNPae8zD+nZ6mAOn5Bm3rFbo7NM7cDHDlYRhTjIj+5tUSIzmD4jTgUvDp6z7uPQ/RdyKF1hWc3ECyUIszAmktMPGTZKlw0/TODU0KA28qEhEjFvdHwSIzTyDTIMBFnHRK4sbjEGFg0XNU41Svj/uDYazD0oUCw+8iOFTdJ4E7sg7ad7po757B4IiiohKxBmkN3HoSkjgWZw/quAvcvkLR4vOkjbtxJOti3w5K0OVhaNSgvo7mjhkkajLg7rMI056Pwm+LXWsdvBgz4Na6FPWJ2sjgYbrj2MQcys+Cx8aO/pflNxf/BDGYey6p2Q+GIggKZLaJMZYGSUwKQXRoPNl46thy+bKcqjIpyX3ZS6NNGBqkvCMhL1hrskLxo6rLRI7/Gy0TjTJNobgYsy+vs3vAmKCxdrT/lYFpS+nSOge9vM5/AfpxBUcmBSWXAAAAAElFTkSuQmCC"
      )
    ); // 用图片路径打包后会显示不了
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
              message: `${pkg.version
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

export async function getMainWindow(): Promise<BrowserWindow> {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (win) {
        clearInterval(timer);
        resolve(win);
      }
    }, 300);
  });
}
