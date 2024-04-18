import {basename} from "node:path";
import { dialog } from "electron";
import ipc from 'node-ipc';
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";
export default class extends Controller {
  constructor() {
    super();
    ipc.config.id = 'electron-lin-tools';
    ipc.config.retry = 1500;
  }
  // 获取项目列表
  @Route('vue-get-list')
  async getList() {
    await db.read();
    const list = (db.data as any).vue;
    return {
        list
    }
  }

  // 添加项目
  @Route("vue-add")
  async add(params: any) {
    const data = params.params;
    await db.read();
    const list = (db.data as any).vue;
    list.push({
        serveUrl: '',
        path: data.path,
        name: data.name || basename(data.path)
    });
  }

  // 打包项目
  @Route('vue-build')
  async build(params: any) {
    const {path} = params.params;
  }
}
