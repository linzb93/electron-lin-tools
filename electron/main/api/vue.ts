import {basename} from "node:path";
import ipc from 'node-ipc';
import {join} from 'node:path';
import fs from 'node:fs/promises';
import killPort from 'kill-port';
import {execaCommand as execa} from 'execa';
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { root } from "../plugins/constant";
import { Request, Database } from "../types/api";
import { mainPost } from "../plugins/utils";

const isMac = process.platform === 'darwin';

export default class extends Controller {
  constructor() {
    super();
    this.init();
  }
  private async init() {
    ipc.config.id = 'electron-lin-tools';
    ipc.config.retry = 1500;
    ipc.config.silent = true;
    await db.read();
    const serverIpcId = (db.data as Database).ipc;
    if (!serverIpcId) {
      return;
    }
    // ipc.connectTo(serverIpcId, () => {
    //   ipc.of[serverIpcId].on("connect",() => {
    //     mainPost({
    //       method: 'vue-ipc-is-connect',
    //       data: true,
    //       listener:false,
    //     });
    //   });
    //   ipc.of[serverIpcId].on("disconnect", () => {
    //     mainPost({
    //       method: 'vue-ipc-is-connect',
    //       data: false,
    //       listener:false,
    //     });
    //   });
    // });
  }
  // 获取项目列表
  @Route('vue-get-list')
  async getList() {
    await db.read();
    const list = (db.data as Database).vue;
    return {
        list
    }
  }

  // 添加项目
  @Route("vue-add")
  async add(req: Request) {
    const data = req.params;
    await db.read();
    const list = (db.data as Database).vue;
    list.push({
        serveUrl: '',
        path: data.path,
        name: data.name || basename(data.path)
    });
    await db.write();
    return {
        message: 'vue-add'
    }
  }

  // 打包项目
  @Route('vue-build')
  async build(req: Request) {
    const {path} = req.params;
    if(isMac) {
      await execa(`nvm exec 14 npm run build`, {
        cwd: path
      });
    } else {
      ipc.of.node14.emit("vue-action", {
        action: "build",
        path
      });
    }
    return {
      message: 'vue-build'
    }
  }

  // 启动项目
  @Route('vue-start')
  async start(req: Request) {
    const {path} = req.params;
    if(isMac) {
      await execa(`nvm exec 14 npm run serve`, {
        cwd: path
      });
    } else {
      ipc.of.node14.emit("vue-action", {
        action: "serve",
        path
      });
    }
    return {
      message: 'vue-start'
    }
  }
  @Route('vue-build-serve')
  async buildServe(req: Request) {
    const {path} = req.params;
    if (isMac) {
      await execa(`nvm exec 14 npm run build`, {
        cwd: path
      });
    } else {
      ipc.of.node14.emit("vue-action", {
        action: "build",
        path
      });
    }
    // await fs.copyFile('', '');
    return {
      message: 'success'
    }
  }

  // 停止项目
  @Route('vue-stop')
  async stop(req: Request) {
    const {port} = req.params;
    await killPort(port);
    return {
      message: 'vue-stop'
    }
  }


  // 删除项目
  @Route('vue-remove')
  async remove(req: Request) {
    const {path} = req.params;
    await db.read();
    const list = (db.data as Database).vue;
    const idx = list.findIndex(item => item.path === path);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    await db.write();
    return {
      message: 'vue-delete'
    }
  }
}
