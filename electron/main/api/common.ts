import fs from "node:fs";
import http from 'node:http';
import { clipboard, dialog } from "electron";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";

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
      http.get(url)
        .pipe(fs.createWriteStream(result.filePath))
        .on("finished", resolve);
    });
    return {
      message: "下载成功",
    };
  }
  @Route('save-temp')
  async saveTemp(list: any[]) {
    return {
      list: []
    }
  }
}
