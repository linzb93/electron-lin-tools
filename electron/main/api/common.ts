import { join, extname, basename } from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { clipboard, dialog } from "electron";
import { createClient } from 'webdav';
import pMap from "p-map";
import download from "download";
import { getMainWindow } from "..";
import { uuid } from "../plugins/utils";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS, root, tempPath } from "../plugins/constant";
import { config } from "../plugins/server";
import db from "../plugins/database";
import { Request, Database } from "../types/api";

export default class extends Controller {
  private syncClient = null;
  constructor() {
    super();
    this.init();
  }
  private async init() {
    await db.read();
    const account  =(db.data as Database).sync;
    this.syncClient = createClient('', account);
  }
  @Route("copy")
  doCopy(req: Request<string>) {
    const text = req.params;
    clipboard.writeText(text);
    return {
      code: HTTP_STATUS.SUCCESS,
      message: "复制成功",
    };
  }
  @Route("download")
  async download(req: Request<string | string[]>) {
    if (Array.isArray(req.params)) {
      // 下载多份
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (result.canceled) {
        return {};
      }
      await pMap(
        req.params,
        (url: string) =>
          new Promise((resolve) => {
            download(url)
              .pipe(
                fs.createWriteStream(join(result.filePaths[0], basename(url)))
              )
              .on("finish", resolve);
          }),
        { concurrency: 4 }
      );
      return {
        code: HTTP_STATUS.SUCCESS,
        message: "下载成功",
      };
    }
    const url = req.params as string;
    const result = await dialog.showSaveDialog({
      defaultPath: basename(url),
    });
    if (result.canceled) {
      return {};
    }
    await new Promise((resolve) => {
      download(url)
        .pipe(fs.createWriteStream(result.filePath))
        .on("finish", resolve);
    });
    return {
      code: HTTP_STATUS.SUCCESS,
      message: "下载成功",
    };
  }
  @Route("save-temp-file")
  async saveTempFile(req: Request<string[]>) {
    const inputList = req.params;
    const list = await pMap(
      inputList,
      async (item) => {
        const uid = uuid();
        const filename = `${uid}${extname(item)}`;
        const dest = join(tempPath, filename);
        await fsp.copyFile(item, dest);
        return `http://localhost:${config.port}${config.static}/${filename}`;
      },
      { concurrency: 4 }
    );
    return {
      list,
    };
  }
  @Route("change-window-size")
  changeWindowSize({ width, height }: { width: number; height: number }) {
    const win = getMainWindow();
    win.setSize(width, height);
    return {
      message: "ok",
    };
  }
  @Route('select-path')
  async selectPath() {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (result.canceled) {
      return {
        path: ''
      };
    }
    return {
      path: result.filePaths[0]
    }
  }
  @Route('save-ipc')
  async saveIpc(req: Request) {
    const {name} = req.params;
    await db.read();
    (db.data as Database).ipc = name;
    await db.write();
  }
  // 同步
  @Route('sync')
  async sync() {
    fs.createReadStream(join(root, 'sync.json'))
    .pipe(this.syncClient.createWriteStream('electron-lin-tools/sync.json'));
    return {
      success: true,
    }
  }
  // 登录
  async login(req: Request) {
    const {params} = req;
    await db.read();
    (db.data as Database).sync = {
      user: params.user,
      password: params.password
    };
    await db.write();
    return {
      success: true
    }
  }
}
