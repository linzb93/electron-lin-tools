import dayjs from "dayjs";
import db from "./database";
import { tempPath } from "./constant";
import {Database} from '../types/api';
import fsp from 'node:fs/promises';
(async () => {
  await db.read();
  const { lastModifiedTime } = db.data as Database;
  const lastTimeDayjs = dayjs(lastModifiedTime).format("YYYY-MM-DD 00:00:00");
  // 每天清理一次.temp文件夹
  if (dayjs().isAfter(lastTimeDayjs, "d") || !lastModifiedTime) {
    const files = await fsp.readdir(tempPath);
  files.forEach(file => {
    fsp.unlink(`${tempPath}/${file}`);
  });
  }
  (db.data as Database).lastModifiedTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  await db.write();
})();
