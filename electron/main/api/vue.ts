import fs from 'node:fs/promises';
import path from 'node:path';
import { dialog, powerMonitor } from 'electron';
import Store from 'electron-store';
import {execaCommand as execa} from 'execa';
import Controller from "../plugins/route/Controller";
import { Route } from "../plugins/route/decorators";
import { HTTP_STATUS } from "../plugins/constant";

const store = new Store();

export default class extends Controller {
    constructor() {
        super();
        powerMonitor.on('shutdown', () => {
            // 清空所有应用的端口号
        });
    }
    
    @Route('vue-get-list')
    getList() {
        if (!store.get('vueProjects')) {
            return {
                list: [
                    {
                        name: 'dkd-jyzs-mobile',
                        path: '/Users/linzhibin/Documents/project/dkd-jyzs-mobile'
                    }
                ]
            }
        }
        return {
            list: store.get('vueProjects')
        }
    }
    @Route('vue-add')
    async add() {
        const selected = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        try {
            await fs.open(path.resolve(selected.filePaths[0], 'vue.config.js'))
        } catch (error) {
            return {
                code: HTTP_STATUS.BAD_REQUEST
            }
        }
    }
    @Route('vue-serve')
    async serve(projPath: string) {
        await execa(`nvm exec v14.18.2 npm run serve`, {
            cwd: projPath
        });;
    }
    @Route('vue-build')
    async build(projPath: string) {
        await execa(`nvm exec v14.18.2 npm run build`, {
            cwd: projPath
        });
    }
    @Route('vue-build-serve')
    async buildServe(projPath: string) {
        await execa(`nvm exec v14.18.2 npm run build`, {
            cwd: projPath
        });
    }
    @Route('vue-remove')
    async remove(projPath: string) {}
}