import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import db from "../plugins/database";
import { Request, Database } from "../types/api";
// import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
  @Route("get-setting")
  async get() {
    await db.read();
    const data = db.data as Database;
    return {
      ipc: data.ipc,
      oaApiPrefix: data.oa ? data.oa.apiPrefix : '',
      user: data.sync ? data.sync.user : "",
      password: data.sync ? data.sync.password : "",
    };
  }
  @Route("save-setting")
  async set(req: Request) {
    const { params } = req;
    await db.read();
    const data = db.data as Database;
    data.ipc = params.ipc;
    if (data.oa) {
      data.oa.apiPrefix = params.oaApiPrefix;
    } else {
      data.oa = {
        apiPrefix: params.oaApiPrefix
      }
    }
    data.sync = {
      user: params.user,
      password: params.password,
    };
    await db.write();
    return {
      success: true,
    };
  }
}
