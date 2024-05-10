import { net } from 'electron'
import { basename, join } from "node:path";
import fs from "node:fs/promises";
import killPort from "kill-port";
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { Request, Database } from "../types/api";
import { ipcInvoke } from "../plugins/ipc";
import { root } from "../plugins/constant";
import request from '../plugins/request';

type VueElementType = Database['vue'][number];

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
      appKey: data.appKey
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

  // 获取项目token

  private async getToken(proj: VueElementType) {
    await db.read();
    const { apiPrefix } = (db.data as Database).oa;
    const response = await net.fetch(`${apiPrefix}/occ/order/getOrderInfoList`, {
      method: 'post',
      body: JSON.stringify({
        pageSize: 1,
        pageIndex: 1,
        version: 1,
        minPrice: 0,
        platform: proj.platform,
        param: '15983528161',
        serviceName: proj.serviceName
      })
    });
    if (response.ok) {
      const body = await response.json();
      // return {}
    }
  }

  // 启动项目
  @Route("vue-start")
  async start(req: Request) {
    const { path } = req.params;
    await db.read();
    const match = (db.data as Database).vue.find(item => item.path === path);
    const [ipcResponse, token] = await Promise.all([
      ipcInvoke("vue-serve", {
        cwd: path,
      }),
      this.getToken(match)
    ])
    const { address } = ipcResponse as any;
    match.serveUrl = address;
    await db.write();
    return {
      message: "vue-start",
      address,
      token
    };
  }
  @Route("vue-build-build")
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
