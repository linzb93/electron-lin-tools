import { Route } from "../ipc-router";
import sql from "../plugins/sql";
import { Request } from "../types/api";
// import { HTTP_STATUS } from "../plugins/constant";

const route = Route();

route.handle("get", async () => {
  const result = await sql(db => ({
    ipc: db.ipc,
    oaApiPrefix: db.oa ? db.oa.apiPrefix : "",
    user: db.sync ? db.sync.user : "",
    password: db.sync ? db.sync.password : "",
  }))
  return result;
});
route.handle("save", async (req: Request) => {
  const { params } = req;
  await sql(db => {
    db.ipc = params.ipc;
    if (db.oa) {
      db.oa.apiPrefix = params.oaApiPrefix;
    } else {
      db.oa = {
        apiPrefix: params.oaApiPrefix,
      };
    }
    db.sync = {
      user: params.user,
      password: params.password,
    };
  })
  return null;
});

export default route;
