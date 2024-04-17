import fs from "node:fs";
import fsp from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { uuid } from "../plugins/utils";
import { clipboard, dialog } from "electron";
import pMap from "p-map";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";
import { getMainWindow } from "..";
import { config } from "../plugins/server";
import { tempPath } from "../plugins/constant";
import download from "download";
export default class extends Controller {
  @Route("copy")
  doCopy(params: any) {
    const text = params.params;
    clipboard.writeText(text);
    return {
      code: HTTP_STATUS.SUCCESS,
      message: "复制成功",
    };
  }
  @Route("download")
  async download(params: any) {
    if (Array.isArray(params.params)) {
      // 下载多份
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (result.canceled) {
        return {};
      }
      await pMap(
        params.params,
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
    const url = params.params as string;
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
  @Route("save-temp")
  async saveTemp(params: any) {
    const inputList = params.params as any[];
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
}
