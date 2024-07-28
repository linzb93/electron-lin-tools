import { Route } from "@linzb93/event-router";
import path from "node:path";
import pMap from "p-map";
import OSS, { OssConfig } from "ali-oss";
import { omit } from "lodash-es";
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
  return {
    list: await sql(db => db.oss.accounts)
  };
});

// 添加客户端，目前仅支持阿里OSS
route.handle("create", async (req: Request<OssConfig>) => {
  await sql(db => {
    if (req.params.id) {
      // 是编辑
      const index = db.oss.accounts.findIndex(
        (acc) => acc.id === req.params.id
      );
      if (index > -1) {
        db.oss.accounts[index] = req.params;
      }
    } else {
      const id = db.oss.accounts.length
        ? Number(db.oss.accounts.at(-1).id + 1)
        : 1;
      db.oss.accounts.push({
        ...req.params,
        id,
      });
    }
  });
  return null;
});

// 移除客户端
route.handle("remove-account", async (req: Request<{ id: number }>) => {
  const { id } = req.params;
  await sql(db => {
    let { accounts } = db.oss;
    const index = accounts.findIndex((acc) => acc.id === id);
    accounts.splice(index, 1);
  })
  return null;
});

// 获取文件/目录列表
route.handle("get-oss-list", async (req: Request<{ id: number, config: { prefix: string; } }>) => {
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
route.handle("delete-file", async (req: Request<{
  id: number;
  path: string;
  paths: string[]
}>) => {
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
route.handle("create-directory", async (req: Request<
  {
    id: number;
    path: string;
    name: string;
  }>) => {
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
route.handle("upload", async (req: Request<
  {
    id: number;
    path: string;
    name: string;
    files: string[]
  }>) => {
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
  return {
    setting: await sql(db => db.oss.setting),
  };
});
// 修改CSS代码设置
route.handle("save-setting", async (req: Request<Database['oss']['setting']>) => {
  const { params } = req;
  await sql(db => {
    db.oss.setting = {
      pixel: params.pixel,
      platform: params.platform,
      previewType: params.previewType,
    };
  });
  return null;
});
// 获取项目前缀，快捷使用
route.handle("get-shortcut", async (req: Request<{ id: number }>) => {
  const { params } = req;
  const { accounts } = await sql(db => db.oss);
  return {
    shortcut: accounts.find((acc) => acc.id === params.id).shortcut,
  };
});
export default route;
