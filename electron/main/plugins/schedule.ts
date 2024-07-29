import dayjs from "dayjs";
import fsp from 'node:fs/promises';
import sql from "./sql";
import { tempPath } from "./constant";
(async () => {
  await sql(async db => {
    const { lastModifiedTime } = db;
    const lastTimeDayjs = dayjs(lastModifiedTime).format("YYYY-MM-DD 00:00:00");
    // 每天清理一次.temp文件夹
    if (dayjs().isAfter(lastTimeDayjs, "d") || !lastModifiedTime) {
      const files = await fsp.readdir(tempPath);
      files.forEach(file => {
        fsp.unlink(`${tempPath}/${file}`);
      });
    }
    db.lastModifiedTime = dayjs().format('YYYY-MM-DD HH:mm:ss');  
  });
})();
