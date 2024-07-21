import db from "../plugins/database";
import { Route } from "../ipc-router";
import { Request, Database } from "../types/api";
const route = Route();
// 获取项目列表
route.handle("get-apps", async () => {
  await db.read();
  let list = (db.data as Database).monitor;
  return {
    list: list || [],
  };
});
route.handle(
  "save-apps",
  async (req: Request<{ siteId: string; name: string }[]>) => {
    const { params } = req;
    await db.read();
    (db.data as Database).monitor = params;
    await db.write();
  }
);

export default route;
