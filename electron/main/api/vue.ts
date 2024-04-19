import {basename} from "node:path";
import ipc from 'node-ipc';
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
// import { HTTP_STATUS } from "../plugins/constant";
import { Request, Database } from "../types/api";
import { mainPost } from "../plugins/utils";

export default class extends Controller {
  constructor() {
    super();
    ipc.config.id = 'electron-lin-tools';
    ipc.config.retry = 1500;
    ipc.config.silent = true;
    // ipc.connectTo("node14", () => {
    //   ipc.of.node14.on("connect",() => {
    //     mainPost({
    //       method: 'vue-ipc-is-connect',
    //       data: true,
    //       listener:false,
    //     });
    //   });
    //   ipc.of.node14.on("disconnect", () => {
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
    // ipc.of.node14.emit("message", "Hello from client");
    return {
      message: 'vue-build'
    }
  }

  // 启动项目
  @Route('vue-start')
  async start(req: Request) {
    const {path} = req.params;
    // ipc.of.node14.emit("message", "Hello from client");
    return {
      message: 'vue-start'
    }
  }

  // 停止项目
  @Route('vue-stop')
  async stop(req: Request) {
    const {path} = req.params;
    // ipc.of.node14.emit("message", "Hello from client");
    return {
      message: 'vue-stop'
    }
  }


  // 删除项目
  @Route('vue-delete')
  async delete(req: Request) {
    const {path} = req.params;
    // ipc.of.node14.emit("message", "Hello from client");
    return {
      message: 'vue-delete'
    }
  }
}
