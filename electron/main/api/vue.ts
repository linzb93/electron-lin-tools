import fs from 'node:fs/promises';
import { join, basename} from 'node:path';
import { dialog, powerMonitor } from 'electron';
import {execaCommand as execa} from 'execa';
import db from '../plugins/database';
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";

export default class extends Controller {
    constructor() {
        super();
        powerMonitor.on('shutdown', () => {
            // 清空所有应用的端口号
        });
    }
    
    @Route('vue-get-list')
    async getList() {
        await db.read();
        const list = (db.data as any).vue;
        return {
            list
        }
    }
    @Route('vue-add')
    async add() {
        const selected = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        const dest = selected.filePaths[0];
        try {
            await fs.access(join(dest, 'vue.config.js'))
        } catch (error) {
            return {
                code: HTTP_STATUS.BAD_REQUEST
            }
        }
        await db.read();
        (db.data as any).vue.push({
            name: basename(dest),
            url: dest,
            port: 0,
        });
        await db.write();
        return {
            path: selected.filePaths[0]
        }
    }
    @Route('vue-serve')
    async serve(projPath: string) {
        await execa(`nvm exec v14.18.2 npm run serve`, {
            cwd: projPath
        });
        return {
            message: 'ok'
        }
    }
    @Route('vue-build')
    async build(projPath: string) {
        await execa(`nvm exec v14.18.2 npm run build`, {
            cwd: projPath
        });
        return {
            message: 'ok'
        }
    }
    @Route('vue-build-serve')
    async buildServe(projPath: string) {
        await execa(`nvm exec v14.18.2 npm run build`, {
            cwd: projPath
        });
        return {
            message: 'ok'
        }
    }
    @Route('vue-remove')
    async remove(projPath: string) {
        await db.read();
        (db.data as any).vue = (db.data as any).vue.filter(item => item.url !== projPath);
        await db.write();
        return {
            message: 'ok'
        }
    }
}