import { Route } from "@linzb93/event-router";
import path from "node:path";
import pMap from "p-map";
import OSS, { OssConfig } from "ali-oss";
import { omit } from "lodash-es";
import db from "../plugins/database";
import { HTTP_STATUS } from "../plugins/constant";
import { Request, Database } from "../types/api";
import sql from "../plugins/sql";

const route = Route();

// 根据id查找对应的OSS客户端
async function findClient(id: number) {
  const accounts = await sql((db) => db.oss.accounts);
  const match = accounts.find((item) => item.id === id);
  if (!match) {
    return {
      code: HTTP_STATUS.BAD_REQUEST,
      message: "OSS不存在",
    };
  }
  const ossobj = omit(match, ["platform", "name"]) as unknown as OssConfig;
  return {
    code: 200,
    client: new OSS(ossobj),
    domain: match.domain,
  };
}

// 获取已添加的客户端列表
route.handle("get-project-list", async () => {
  await db.read();
  return {
    list: (db.data as Database).oss.accounts,
  };
});

// 添加客户端，目前仅支持阿里OSS
route.handle("create", async (req: Request<OssConfig>) => {
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
});

// 移除客户端
route.handle("remove-account", async (req: Request) => {
  const { id } = req.params;
  await db.read();
  let { accounts } = (db.data as Database).oss;
  const index = accounts.findIndex((acc) => acc.id === id);
  accounts.splice(index, 1);
  await db.write();
  return {
    code: 200,
  };
});

// 获取文件/目录列表
route.handle("get-oss-list", async (req: Request) => {
  // https://help.aliyun.com/zh/oss/developer-reference/list-objects-5?spm=a2c4g.11186623.0.i2
  const { id, config } = req.params;
  const projectRes = await findClient(id);
  if (projectRes.code !== 200) {
    return projectRes;
  }
  const { client, domain } = projectRes;
  const result = await client.listV2({
    prefix: config.prefix,
    delimiter: "/",
    "max-keys": 100,
  });
  /**
   * objects会返回目录下所有的文件和目录，根据size字段判断是不是目录
   * prefixes只会返回目录
   */
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
});

// 删除文件
route.handle("delete-file", async (req: Request) => {
  const { id, path, paths } = req.params;
  const projectRes = await findClient(id);
  if (projectRes.code !== 200) {
    return projectRes;
  }
  const { client } = projectRes;
  if (paths) {
    await pMap(paths, (path: string) => client.delete(path), {
      concurrency: 4,
    });
  } else {
    await client.delete(path);
  }
  return null;
});

// 创建目录
route.handle("create-directory", async (req: Request) => {
  const { id, path: uploadPath, name } = req.params;
  const projectRes = await findClient(id);
  if (projectRes.code !== 200) {
    return projectRes;
  }
  const { client } = projectRes;
  await client.put(`${uploadPath}${name}/`, Buffer.from(""));
  return null;
});

// 上传文件
route.handle("upload", async (req: Request) => {
  const { id, path: uploadPath, files } = req.params;
  const projectRes = await findClient(id);
  if (projectRes.code !== 200) {
    return projectRes;
  }
  const { client } = projectRes;
  await Promise.all(
    files.map((file: string) =>
      client.put(`${uploadPath}${path.basename(file)}`, file)
    )
  );
  return null;
});

// 读取CSS代码设置
route.handle("get-setting", async () => {
  await db.read();
  const { setting } = (db.data as Database).oss;
  return {
    setting,
  };
});
// 修改CSS代码设置
route.handle("save-setting", async (req: Request) => {
  const { params } = req;
  await db.read();
  (db.data as Database).oss.setting = {
    pixel: params.pixel,
    platform: params.platform,
    previewType: params.previewType,
  };
  await db.write();
  return null;
});
// 获取项目前缀，快捷使用
route.handle("get-shortcut", async (req: Request) => {
  const { params } = req;
  await db.read();
  const { accounts } = (db.data as Database).oss;
  return {
    shortcut: accounts.find((acc) => acc.id === params.id).shortcut,
  };
});
export default route;
