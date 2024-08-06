import fsp from "node:fs/promises";
import { join } from "node:path";
import pReduce from "p-reduce";
import pMap from "p-map";
import gitUtil from "../helpers/git";
import { Route } from "@linzb93/event-router";
import { Request, Database } from "../types/api";
import sql from "../helpers/sql";
import { HTTP_STATUS } from "../helpers/constant";

const route = Route();

// 获取项目列表
route.handle("get", async () => {
  let schedule = await sql((db) => db.schedule);
  return schedule;
});
// 保存已选的项目列表
route.handle("save", async (req: Request<Database["schedule"]>) => {
  const { params } = req;
  await sql((db) => {
    db.schedule = {
      ...params,
      inited: true,
    };
  });
  return null;
});

export const getGitScanResult = async () => {
  const schedule = await sql(async (db) => db.schedule);
  if (!schedule) {
    return {
      code: HTTP_STATUS.BAD_REQUEST,
      message: "未初始化，请选择要扫描的文件夹",
    };
  }
  const { git } = schedule;
  const allDirs = await pReduce(
    git.dirs,
    async (acc, dir) => {
      const dirs = await fsp.readdir(dir.path);
      return acc.concat(
        await pMap(dirs, async (subDir) => {
          return {
            dir: subDir,
            prefix: dir.path,
            folderName: dir.name,
          };
        })
      );
    },
    []
  );
  const result = await pMap(
    allDirs,
    async (dirInfo) => {
      const full = join(dirInfo.prefix, dirInfo.dir);
      return {
        name: dirInfo.dir,
        path: full,
        folderName: dirInfo.folderName,
        status: await gitUtil.getPushStatus(full),
      };
    },
    { concurrency: 5 }
  );
  return {
    list: result.filter(item => ![0, 3].includes(item.status)),
  };
};
route.handle("git-scan-result", getGitScanResult);

export default route;
