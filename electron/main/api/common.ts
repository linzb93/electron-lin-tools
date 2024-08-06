import { join, basename } from "node:path";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { shell, clipboard, dialog, nativeImage } from "electron";
import { execaCommand as execa } from "execa";
import { Application } from "@linzb93/event-router";
import { sleep } from "@linzb93/utils";
import { createClient } from "webdav";
import axios from "axios";
import pMap from "p-map";
import { root } from "../helpers/constant";
import { Request } from "../types/api";
import sql from "../helpers/sql";

export default async (app: Application) => {
  const account = await sql((db) => db.sync);
  const syncClient = createClient("", account);

  // 复制文本
  app.handle("copy", async (req: Request<string>) => {
    const text = req.params;
    clipboard.writeText(text);
  });

  // 下载文件
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
  });
  
  // 打开网页或文件
  app.handle("open", async (req: Request<string>) => {
    await shell.openPath(req.params);
  });

  // 选择文件夹路径
  app.handle(
    "get-selected-path",
    async (req: Request<{ multiSelections: boolean }>) => {
      const {
        params: { multiSelections },
      } = req;
      const result = await dialog.showOpenDialog({
        properties: multiSelections
          ? ["openDirectory", "multiSelections"]
          : ["openDirectory"],
      });
      if (result.canceled) {
        return {
          path: "",
        };
      }
      if (multiSelections) {
        return {
          paths: result.filePaths,
        };
      }
      return {
        path: result.filePaths[0],
      };
    }
  );

  // 选择文件
  app.handle(
    "get-selected-file",
    async (req: Request<{ multiSelections: boolean }>) => {
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
    }
  );

  // 在VSCode中打开
  app.handle("open-in-vscode", async (req: Request<string | string[]>) => {
    const { params } = req;
    if (Array.isArray(params)) {
      for (const param of params) {
        await execa(`code ${param}`);
        await sleep(2000);
      }
      return;
    }
    await execa(`code ${params}`);
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
  app.handle("open-in-browser", (req: Request<{ url: string }>) => {
    const { url } = req.params;
    shell.openExternal(url);
    return null;
  });

  // 复制图片
  app.handle(
    "copy-image",
    async (req: Request<{ url: string; type: string }>) => {
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
    }
  );

  // 获取跨域脚本或接口
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
