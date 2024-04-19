import dayjs from "dayjs";
import { deleteAsync } from "del";
import db from "./database";
import { tempPath } from "./constant";
import {Database} from '../types/api';

(async () => {
  await db.read();
  const { lastModifiedTime } = db.data as Database;
  const lastTimeDayjs = dayjs(lastModifiedTime).format("YYYY-MM-DD 00:00:00");
  if (dayjs().isAfter(lastTimeDayjs, "d") || !lastModifiedTime) {
    // 每天清理一次.temp文件夹
    await deleteAsync(`${tempPath}/**`,{
      force: true
    });
    (db.data as Database).lastModifiedTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    await db.write();
  }
})();
