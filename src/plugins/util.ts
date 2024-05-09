import request from "./request";
import { ElMessage } from "element-plus";
export const sleep = (time: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(null), time);
  });

export const copy = (text: string) => {
  request("copy", text);
  ElMessage.success("复制成功");
};
export const download = async (url: string) => {
  try {
    await request("download", url);
  } catch (error) {
    return;
  }
  ElMessage.success("下载成功");
};

// 处理来自主进程的请求
export const handleMainPost = (receiveMethod: string, callback: Function) => {
  window.ipcRenderer.on(
    "main-post",
    async (evt, { requestId, method, data, listener }) => {
      console.groupCollapsed(
        `收到来自主进程发起的请求：%c${receiveMethod}`,
        "color:orange"
      );
      console.log(data);
      console.groupEnd();
      if (method !== receiveMethod) {
        return;
      }
      const ret = await callback(data);
      if (listener) {
        window.ipcRenderer.send(
            "main-post-receive",
            JSON.stringify({
              requestId,
              method,
              data: ret,
            })
          );
      }
    }
  );
};
