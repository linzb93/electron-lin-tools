import { join, basename } from "node:path";
import fs from "node:fs";
import { clipboard, dialog } from "electron";
import { createClient } from "webdav";
import pMap from "p-map";
import download from "download";
import { getMainWindow } from "..";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS, root } from "../plugins/constant";
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
    const account = (db.data as Database).sync;
    this.syncClient = createClient("", account);
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
      // 下载多份文件
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

  @Route("change-window-size")
  changeWindowSize(
    req: Request<{
      width: number;
      height: number;
    }>
  ) {
    const { width, height } = req.params;
    const win = getMainWindow();
    win.setSize(width, height);
    return {
      message: "ok",
    };
  }
  @Route("get-selected-path")
  async selectPath() {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (result.canceled) {
      return {
        path: "",
      };
    }
    return {
      path: result.filePaths[0],
    };
  }
  // 同步
  @Route("sync")
  async sync() {
    fs.createReadStream(join(root, "sync.json")).pipe(
      this.syncClient.createWriteStream("electron-lin-tools/sync.json")
    );
    return {
      success: true,
    };
  }
  // 登录
  async login(
    req: Request<{
      user: string;
      password: string;
    }>
  ) {
    const { params } = req;
    await db.read();
    (db.data as Database).sync = {
      user: params.user,
      password: params.password,
    };
    await db.write();
    return {
      success: true,
    };
  }
}
