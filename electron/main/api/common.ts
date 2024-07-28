import { join, basename } from "node:path";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { shell, clipboard, dialog, nativeImage } from "electron";
import { Application } from "@linzb93/event-router";
import { createClient } from "webdav";
import axios from "axios";
import pMap from "p-map";
import { getMainWindow } from "..";
import { HTTP_STATUS, root } from "../plugins/constant";
import { Request } from "../types/api";
import sql from "../plugins/sql";

export default async (app: Application) => {
  const account = await sql(db => db.sync);
  const syncClient = createClient("", account);
  app.handle("copy", async (req: Request<string>) => {
    const text = req.params;
    clipboard.writeText(text);
    return {
      code: HTTP_STATUS.SUCCESS,
      message: "复制成功",
    };
  });
  app.handle("download", async (req: Request<string | string[]>) => {
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
            http.get(url, (resp) => {
              if (resp.statusCode === 200) {
                resp
                  .pipe(
                    fs.createWriteStream(
                      join(result.filePaths[0], basename(url))
                    )
                  )
                  .on("finish", resolve);
              }
            });
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
      http.get(url, (resp) => {
        if (resp.statusCode === 200) {
          resp
            .pipe(fs.createWriteStream(result.filePath))
            .on("finish", resolve);
        }
      });
    });
    return {
      code: HTTP_STATUS.SUCCESS,
      message: "下载成功",
    };
  });
  app.handle(
    "change-window-size",
    async (
      req: Request<{
        width: number;
        height: number;
      }>
    ) => {
      const { width, height } = req.params;
      const win = await getMainWindow();
      win.setSize(width, height);
      return {
        message: "ok",
      };
    }
  );
  app.handle("get-selected-path", async () => {
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
  });
  app.handle("get-selected-file", async (req: Request<{multiSelections: boolean}>) => {
    const {
      params: { multiSelections },
    } = req;
    const result = await dialog.showOpenDialog({
      properties: multiSelections
        ? ["openFile", "multiSelections"]
        : ["openFile"],
    });
    if (result.canceled) {
      return {
        paths: "",
      };
    }
    const paths = await pMap(result.filePaths, async (file) => {
      const stats = await fsp.stat(file);
      return {
        path: file,
        size: stats.size,
        name: basename(file),
      };
    });
    return {
      paths,
    };
  });
  // 同步
  app.handle("sync", async () => {
    fs.createReadStream(join(root, "sync.json")).pipe(
      syncClient.createWriteStream("electron-lin-tools/sync.json")
    );
    return {
      success: true,
    };
  });
  // 登录
  // async login(
  //   req: Request<{
  //     user: string;
  //     password: string;
  //   }>
  // ) {
  //   const { params } = req;
  //   await db.read();
  //   (db.data as Database).sync = {
  //     user: params.user,
  //     password: params.password,
  //   };
  //   await db.write();
  //   return {
  //     success: true,
  //   };
  // }
  app.handle("open-in-browser", (req: Request<{url: string}>) => {
    const { url } = req.params;
    shell.openExternal(url);
    return null;
  });
  app.handle("copy-image", async (req: Request<{url: string;type: string;}>) => {
    const { url, type } = req.params;
    if (type === "base64") {
      const buf = Buffer.from(url);
      const img = nativeImage.createFromBuffer(buf);
      clipboard.writeImage(img);
      return {
        success: true,
      };
    }
    return {
      success: false,
    };
  });
  app.handle(
    "fetch-api-cross-origin",
    async (
      req: Request<{
        url: string;
        data: any;
        method: string;
      }>
    ) => {
      const { params } = req;
      try {
        const response = await axios({
          method: params.method || "get",
          url: params.url,
          data: params.data || {},
        });
        return {
          success: true,
          result: response.data,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }
  );
};
