import {dialog} from 'electron';
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
      prefix: config.prefix,
      delimiter: "/",
      "max-keys": 100,
    });
    const objects = result.objects
      .filter((obj) => obj.size > 0)
      .map((obj) => ({
        ...obj,
        name: obj.name.split("/").slice(-1)[0],
      }));
    return {
      list: result.prefixes
        ? result.prefixes
            .map((subDir) => ({
              name: subDir.replace(/\/$/, "").split("/").slice(-1)[0],
              type: "dir",
            }))
            .concat(objects)
        : objects,
    };
  }
  @Route("oss-delete-file")
  async deleteFile(params:any) {
    const { id, config } = params.params;
    await db.read();
    const match = (db.data as any).oss.find((item) => item.id === id);
    if (!match) {
      return {
        code: HTTP_STATUS.BAD_REQUEST,
        message: "不存在",
      };
    }
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });
    if (result.canceled) {
      return;
    }
    const oss = new OSS(omit(match, ["name", "platform"]));
    await oss.delete(config.path);
  }
  @Route("oss-create-directory")
  createDirectory() {}
  @Route("oss-upload")
  async upload(params) {
    const { id, config } = params.params;
    await db.read();
    const match = (db.data as any).oss.find((item) => item.id === id);
    if (!match) {
      return {
        code: HTTP_STATUS.BAD_REQUEST,
        message: "不存在",
      };
    }
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });
    if (result.canceled) {
      return;
    }
    const oss = new OSS(omit(match, ["name", "platform"]));
    const resp = await oss.put(result.filePaths[0]);
    console.log(resp.name);
  }
}
