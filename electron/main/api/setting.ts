import { Route } from "../ipc-router";
import db from "../plugins/database";
import { Request, Database } from "../types/api";
// import { HTTP_STATUS } from "../plugins/constant";

const route = Route();

route.handle("get", async () => {
  await db.read();
  const data = db.data as Database;
  return {
    ipc: data.ipc,
    oaApiPrefix: data.oa ? data.oa.apiPrefix : "",
    user: data.sync ? data.sync.user : "",
    password: data.sync ? data.sync.password : "",
  };
});
route.handle("save", async (req: Request) => {
  const { params } = req;
  await db.read();
  const data = db.data as Database;
  data.ipc = params.ipc;
  if (data.oa) {
    data.oa.apiPrefix = params.oaApiPrefix;
  } else {
    data.oa = {
      apiPrefix: params.oaApiPrefix,
    };
  }
  data.sync = {
    user: params.user,
    password: params.password,
  };
  await db.write();
  return null;
});

export default route;
