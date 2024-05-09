import { basename, join } from "node:path";
import fs from "node:fs/promises";
import killPort from "kill-port";
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { Request, Database } from "../types/api";
import { ipcInvoke } from "../plugins/ipc";
import { root } from "../plugins/constant";

const isMac = process.platform === "darwin";

export default class extends Controller {
  // 获取项目列表
  @Route("vue-get-list")
  async getList() {
    await db.read();
    const list = (db.data as Database).vue;
    return {
      list,
    };
  }

  // 添加项目
  @Route("vue-add")
  async add(req: Request) {
    const data = req.params;
    await db.read();
    const list = (db.data as Database).vue;
    list.push({
      serveUrl: "",
      path: data.path,
      name: data.name || basename(data.path),
    });
    await db.write();
    return {
      message: "vue-add",
    };
  }

  // 打包项目
  @Route("vue-build")
  async build(req: Request) {
    // ipc可以用，后面逻辑有空再写。
    const { path } = req.params;
    await ipcInvoke("vue-build", {
      cwd: path,
    });
    console.log("build success");
    return {
      message: "vue-build",
    };
  }

  // 启动项目
  @Route("vue-start")
  async start(req: Request) {
    const { path } = req.params;
    const response = await ipcInvoke("vue-serve", {
      cwd: path,
    });
    console.log('vue serve success');
    const {message} = response as any;
    const reg = /(\d{1,3}\.){3}\d{1,3}:\d{4}/;
    const arr = message.match(reg);
    return {
      message: "vue-start",
      ip: arr[0]
    };
  }
  @Route("vue-build-serve")
  async buildServe(req: Request) {
    const { path } = req.params;
    const response = await ipcInvoke("vue-serve", {
      cwd: path,
    });
    await fs.copyFile(join(path, "dist"), join(root, "./server"));
    return {
      message: "success",
    };
  }

  // 停止项目
  @Route("vue-stop")
  async stop(req: Request) {
    const { port } = req.params;
    await killPort(port);
    return {
      message: "vue-stop",
    };
  }

  // 删除项目
  @Route("vue-remove")
  async remove(req: Request) {
    const { path } = req.params;
    await db.read();
    const list = (db.data as Database).vue;
    const idx = list.findIndex((item) => item.path === path);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    await db.write();
    return {
      message: "vue-delete",
    };
  }
}
