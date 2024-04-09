import { join, dirname } from "node:path";
import fs from 'node:fs';
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import cachedir from 'cachedir';

const dbPath = join(cachedir('electron-lin-tools'), 'app.json');
console.log(dbPath);
try {
    fs.accessSync(dbPath)
} catch (error) {
    fs.mkdirSync(dirname(dbPath), {
        recursive: true
    })
    fs.writeFileSync(dbPath, JSON.stringify({
        vue: [],
        oss: []
    }), {})
}
const db = new Low(new JSONFile(dbPath), {});
export default db;