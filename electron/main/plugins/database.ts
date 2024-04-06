import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "node:path";
import { app } from "electron";
const db = new Low(new JSONFile(join(app.getAppPath(), "app.json")), {});
export default db;
