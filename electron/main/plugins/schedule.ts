import dayjs from 'dayjs';
import {deleteAsync} from 'del';
import db from './database';
import { tempPath } from './constant';

(async () => {
    await db.read();
    const {lastModifiedTime} = db.data as any;
    const lastTimeDayjs = dayjs(lastModifiedTime).format('YYYY-MM-DD 00:00:00');
    if (dayjs().isAfter(lastTimeDayjs, 'd')) {
        // 每天清理一次.temp文件夹
        await deleteAsync(`${tempPath}/**`);
    }
})()
