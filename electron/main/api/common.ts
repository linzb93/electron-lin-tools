import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import { join, extname } from "node:path";
import { uuid } from "../plugins/utils";
import { clipboard, dialog } from "electron";
import pMap from "p-map";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";
import { getMainWindow } from "..";
import { config } from "../plugins/server";
import { tempPath } from "../plugins/constant";
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
  async download(url: string) {
    const result = await dialog.showSaveDialog({});
    if (result.canceled) {
      return {};
    }
    await new Promise((resolve) => {
      http
        .get(url)
        .pipe(fs.createWriteStream(result.filePath))
        .on("finished", resolve);
    });
    return {
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
