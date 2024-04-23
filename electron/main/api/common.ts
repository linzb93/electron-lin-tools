import fs from "node:fs";
import fsp from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { uuid } from "../plugins/utils";
import { clipboard, dialog, nativeImage, IpcMainEvent } from "electron";
import pMap from "p-map";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";
import { getMainWindow } from "..";
import { config } from "../plugins/server";
import { tempPath, publicPath } from "../plugins/constant";
import download from "download";
import db from "../plugins/database";
import { Request, Database } from "../types/api";

export default class extends Controller {
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
        .pipe(fs.createWriteStream(join(result.filePath, basename(url))))
        .on("finished", resolve);
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
  @Route('drag')
  async drag(req: Request, event:IpcMainEvent) {
    const {url} = req.params;
    const dragIcon = await nativeImage.createThumbnailFromPath(join(publicPath, 'drag-and-drop.png'), {
      width: 128,
      height: 128
    });
    event.sender.startDrag({
      file: join(tempPath, basename(url)),
      icon: dragIcon
    })
  }
}
