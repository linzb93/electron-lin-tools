import fsp from "node:fs/promises";
import { Notification } from "electron";
import dayjs from "dayjs";
import pMap from "p-map";
import pReduce from "p-reduce";
import sql from "./sql";
import { tempPath } from "./constant";
import { onShutDown } from "./utils";
import gitUtil from "./git";
import { mainPost } from "./utils";
import { getMainWindow } from "..";

(async () => {
  await sql(async (db) => {
    const { lastModifiedTime, schedule } = db;
    const lastTimeDayjs = dayjs(lastModifiedTime).format("YYYY-MM-DD 00:00:00");
    // 每天清理一次.temp文件夹
    if (dayjs().isAfter(lastTimeDayjs, "d") || !lastModifiedTime) {
      const files = await fsp.readdir(tempPath);
      files.forEach((file) => {
        fsp.unlink(`${tempPath}/${file}`);
      });
    }
    db.lastModifiedTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    // 定时任务
    if (!schedule || !schedule.inited) {
      return;
    }
    const { git } = schedule;
    const todayNeedScan = git.period === 1 || git.weeks.includes(dayjs().day());
    if (!todayNeedScan) {
      return;
    }
    onShutDown(async () => {
      const allDirs = await pReduce(
        git.dirs,
        async (acc, dir) => {
          const dirs = await fsp.readdir(dir.path);
          return acc.concat(dirs);
        },
        []
      );
      const result = await pMap(
        allDirs,
        async (dir) => {
          return {
            dir,
            status: await gitUtil.getPushStatus(dir),
          };
        },
        { concurrency: 4 }
      );
      const notice = new Notification({
        title: "温馨提醒",
        body: "Git项目扫描完成，请查看结果",
      });
      notice.show();
      notice.on('click', async () => {
        const win = await getMainWindow();
        win.show();
        mainPost({
          method: "show-git-scan-result",
          data: result,
          listener: false,
        });
      });
    });
  });
})();
