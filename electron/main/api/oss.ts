import OSS from "ali-oss";
import { omit } from "lodash-es";
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";
export default class extends Controller {
  constructor() {
    super();
  }
  @Route("oss-create")
  async create(params: any) {
    await db.read();
    (db.data as any).oss.push(params.params);
    await db.write();
    // const oss = new OSS(omit(config, ["name", "type"]));
    return {
      message: "ok",
    };
  }
  @Route("oss-get-project-list")
  async getProjectList() {
    await db.read();
    return {
      list: (db.data as any).oss,
    };
  }
  @Route("oss-get-oss-list")
  async getOssList(params) {
    // https://help.aliyun.com/zh/oss/developer-reference/list-objects-5?spm=a2c4g.11186623.0.i2
    const { id, config } = params.params;
    await db.read();
    const match = (db.data as any).oss.find((item) => item.id === id);
    if (!match) {
      return {
        code: HTTP_STATUS.BAD_REQUEST,
        message: "不存在",
      };
    }
    const oss = new OSS(omit(match, ["name", "platform"]));
    const result = await oss.listV2({
      ...config,
    });
    if (result && result.prefixes) {
      result.prefixes.forEach((subDir) => {
        console.log("SubDir: %s", subDir);
      });
    }
    if (result && result.objects) {
      result.objects.forEach((obj) => {
        console.log("Object: %s", obj.name);
      });
    }
    return {
      list: [],
    };
  }
  @Route('oss-delete-file')
  async deleteFile() {}
  @Route('oss-create-directory')
  createDirectory() {}
  @Route('oss-upload')
  upload() {}
}
