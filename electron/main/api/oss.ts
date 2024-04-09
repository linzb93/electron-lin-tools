import path from "node:path";
import { dialog } from "electron";
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
  // 查找对应的用户信息
  private async findClient(id: string) {
    await db.read();
    const match = (db.data as any).oss.find((item) => item.id === id);
    if (!match) {
      return {
        success:false,
        response: {
          code: HTTP_STATUS.BAD_REQUEST,
          message: "不存在",
        }
      };
    }
    return {
      success: true,
      client: new OSS(match, ['platform','name'])
    };
  }

  // 添加用户，目前仅支持阿里OSS
  @Route("oss-create")
  async create(params: any) {
    await db.read();
    const data = db.data as any;
    const id = data.at(-1).id + 1;
    data.oss.push({
      ...params.params,
      id,
    });
    await db.write();
    // const oss = new OSS(omit(config, ["name", "type"]));
    return {
      message: "ok",
    };
  }

  // 移除用户
  @Route("oss-remove-account")
  async removeAccount(params: any) {}

  // 获取用户列表
  @Route("oss-get-project-list")
  async getProjectList() {
    await db.read();
    return {
      list: (db.data as any).oss,
    };
  }

  // 获取文件/目录列表
  @Route("oss-get-oss-list")
  async getOssList(params) {
    // https://help.aliyun.com/zh/oss/developer-reference/list-objects-5?spm=a2c4g.11186623.0.i2
    const { id, config } = params.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const {client} = projectRes;
    const result = await client.listV2({
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

  // 删除文件
  @Route("oss-delete-file")
  async deleteFile(params: any) {
    const { id, file } = params.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const {client} = projectRes;
    await client.delete(file);
    return {
      message: 'success'
    }
  }

  // 创建目录
  @Route("oss-create-directory")
  async createDirectory(params) {
    const { id, path: uploadPath,name } = params.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const {client} = projectRes;
    await client.put(
      `${uploadPath}${name}/`,Buffer.from('')
    );
    return {
      message: 'success'
    }
  }

  // 上传目录
  @Route("oss-upload")
  async upload(params) {
    const { id, path: uploadPath } = params.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const {client} = projectRes;
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
    });
    if (result.canceled) {
      return {
        message: "cancel",
      };
    }
    const resp = await client.put(
      `${uploadPath}${path.basename(result.filePaths[0])}`,
      result.filePaths[0]
    );
    return {
      message: resp.name,
    };
  }
}
