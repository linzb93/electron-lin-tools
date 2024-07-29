import { ipcMain } from "electron";
import dayjs from "dayjs";
import { timejs } from "@linzb93/utils";
import { getMainWindow } from "..";

export const uuid = (len = 36) => {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  const arr = [];
  let r = 0;
  arr[8] = arr[13] = arr[18] = arr[23] = "-";
  arr[14] = "4";
  for (let i = 0; i < len; i++) {
    if (!arr[i]) {
      r = 0 | (Math.random() * 16);
      arr[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
    }
  }
  return arr.join("");
};

export const mainPost = ({
  method,
  data,
  listener = true,
}: {
  method: string;
  data: any;
  listener?: boolean;
}) =>
  new Promise(async (resolve) => {
    const win = await getMainWindow();
    const uid = uuid();
    if (listener) {
      const handler = (_: any, dataStr: string) => {
        const dataObj = JSON.parse(dataStr);
        if (dataObj.requestId === uid && dataObj.method === method) {
          ipcMain.off("main-post-receive", handler);
          resolve(dataObj.data);
        }
      };
      ipcMain.on("main-post-receive", handler);
    } else {
      resolve(null);
    }
    win &&
      win.webContents.send("main-post", {
        requestId: uid,
        method,
        data,
        listener,
      });
  });

export const onShutDown = (callback: Function) => {
  const timer = setInterval(() => {
    if (timejs(dayjs().format("HH:mm:ss")).isAfter("18:00")) {
      clearInterval(timer);
      callback();
    }
  }, 1000 * 60);
};

export const pFlatten = async function (list: any[], (item) => Promise<any>) {}