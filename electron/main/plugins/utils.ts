import { ipcMain } from "electron";
import { getMainWindow } from "..";

export const uuid = (len = 36) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    const arr = [];
    let r = 0;
    arr[8] = arr[13] = arr[18] = arr[23] = '-';
    arr[14] = '4';
    for (let i = 0; i < len; i++) {
        if (!arr[i]) {
            r = 0 | (Math.random() * 16);
            arr[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
        }
    }
    return arr.join('');
};

export const mainPost = ({method, data}) => new Promise(resolve => {
    const win = getMainWindow();
    const uid = uuid();
    const handler = (_, dataStr:any) => {
        const data = JSON.parse(dataStr);
        if (data.requestId === uid && data.method === method) {
            ipcMain.off('main-post-receive', handler);
            resolve(data.data);
        }
    };
    ipcMain.on('main-post-receive', handler);
    win.webContents.send('main-post', {
        requestId: uid,
        method,
        data
    });
});