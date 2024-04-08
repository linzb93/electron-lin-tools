import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "node:path";
import { app } from "electron";
import cachedir from 'cachedir';
const db = new Low(new JSONFile(join(app.getAppPath(), "app.json")), {});
export default db;


// 目录：~/linzhibin-app/lin-tools/Cache/database/xx.json