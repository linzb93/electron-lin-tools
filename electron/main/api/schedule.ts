import { Route } from "@linzb93/event-router";
import { Request, Database } from "../types/api";
import sql from "../plugins/sql";

const route = Route();

// 获取项目列表
route.handle("get", async () => {
  let schedule = await sql((db) => db.schedule);
  return schedule;
});
// 保存已选的项目列表
route.handle(
  "save",
  async (req: Request<Database['schedule']>) => {
    const { params } = req;
    await sql((db) => {
      db.schedule = params;
    });
    return null;
  }
);

export default route;
