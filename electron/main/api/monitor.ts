import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { Request, Database } from "../types/api";

export default class extends Controller {
  // 获取项目列表
  @Route("monitor-get-apps")
  async getList() {
    await db.read();
    let list = (db.data as Database).monitor;
    return {
      list: list || [],
    };
  }
  @Route("monitor-save-apps")
  async save(req: Request<{ siteId: string; name: string }[]>) {
    const { params } = req;
    await db.read();
    (db.data as Database).monitor = params;
    await db.write();
  }
}
