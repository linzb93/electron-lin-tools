import { Route } from "@linzb93/event-router";
import { Request } from "../types/api";
import sql from "../helpers/sql";

const route = Route();

// 获取项目列表
route.handle("get-apps", async () => {
  let list = await sql((db) => db.monitor);
  return {
    list: list || [],
  };
});
// 保存已选的项目列表
route.handle(
  "save-apps",
  async (req: Request<{ siteId: string; name: string }[]>) => {
    const { params } = req;
    await sql((db) => {
      db.monitor = params;
    });
    return null;
  }
);

export default route;
