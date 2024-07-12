import path from "node:path";
import pMap from "p-map";
import OSS, { OssConfig } from "ali-oss";
import { omit } from "lodash-es";
import db from "../plugins/database";
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";
import { Request, Database } from "../types/api";

export default class extends Controller {
  constructor() {
    super();
  }
  // 查找对应的用户信息
  private async findClient(id: number) {
    await db.read();
    const match = (db.data as Database).oss.accounts.find(
      (item) => item.id === id
    );
    if (!match) {
      return {
        success: false,
        response: {
          code: HTTP_STATUS.BAD_REQUEST,
          message: "不存在",
        },
      };
    }
    const ossobj = omit(match, ["platform", "name"]) as unknown as OssConfig;
    return {
      success: true,
      client: new OSS(ossobj),
      domain: match.domain,
    };
  }

  // 添加用户，目前仅支持阿里OSS
  @Route("oss-create")
  async create(req: Request<OssConfig>) {
    await db.read();
    const data = db.data as Database;
    if (req.params.id) {
      // 是编辑
      const index = data.oss.accounts.findIndex(
        (acc) => acc.id === req.params.id
      );
      if (index > -1) {
        data.oss.accounts[index] = req.params;
      }
    } else {
      const id = data.oss.accounts.length
        ? Number(data.oss.accounts.at(-1).id + 1)
        : 1;
      data.oss.accounts.push({
        ...req.params,
        id,
      });
    }
    await db.write();
    return {
      message: "ok",
    };
  }

  // 移除用户
  @Route("oss-remove-account")
  async removeAccount(req: Request) {
    const { id } = req.params;
    await db.read();
    let { accounts } = (db.data as Database).oss;
    const index = accounts.findIndex((acc) => acc.id === id);
    accounts.splice(index, 1);
    await db.write();
    return {
      message: "success",
    };
  }

  // 获取用户列表
  @Route("oss-get-project-list")
  async getProjectList() {
    await db.read();
    return {
      list: (db.data as Database).oss.accounts,
    };
  }

  // 获取文件/目录列表
  @Route("oss-get-oss-list")
  async getOssList(req: Request) {
    // https://help.aliyun.com/zh/oss/developer-reference/list-objects-5?spm=a2c4g.11186623.0.i2
    const { id, config } = req.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const { client, domain } = projectRes;
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
        url: obj.url.replace(/^https?:\/\/[^\/]+/, domain),
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
  async deleteFile(req: Request) {
    const { id, path, paths } = req.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const { client } = projectRes;
    if (paths) {
      await pMap(paths, (path: string) => client.delete(path), {
        concurrency: 4,
      });
    } else {
      await client.delete(path);
    }
    return {
      message: "success",
    };
  }

  // 创建目录
  @Route("oss-create-directory")
  async createDirectory(req: Request) {
    const { id, path: uploadPath, name } = req.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const { client } = projectRes;
    await client.put(`${uploadPath}${name}/`, Buffer.from(""));
    return {
      message: "success",
    };
  }

  // 上传文件
  @Route("oss-upload")
  async upload(req: Request) {
    const { id, path: uploadPath, files } = req.params;
    const projectRes = await this.findClient(id);
    if (!projectRes.success) {
      return projectRes.response;
    }
    const { client } = projectRes;
    await Promise.all(
      files.map((file: string) =>
        client.put(`${uploadPath}${path.basename(file)}`, file)
      )
    );
    return {
      message: "success",
    };
  }

  // CSS代码
  @Route("oss-get-setting")
  async getSetting() {
    await db.read();
    const { setting } = (db.data as Database).oss;
    return {
      message: "success",
      setting,
    };
  }
  @Route("oss-save-setting")
  async saveSetting(req: Request) {
    const { params } = req;
    await db.read();
    (db.data as Database).oss.setting = {
      pixel: params.pixel,
      platform: params.platform,
    };
    await db.write();
    return {
      message: "success",
    };
  }
  @Route("oss-get-shortcut")
  async getShortcut(req: Request) {
    const { params } = req;
    await db.read();
    const { accounts } = (db.data as Database).oss;
    return {
      result: accounts.find((acc) => acc.id === params.id).shortcut,
    };
  }
}
