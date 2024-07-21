import { IpcRenderer } from "electron";
import { IPC_ROUTER_EVENT_KEY } from "./constant";

let ipcRenderer: IpcRenderer;
if (process.type === "renderer") {
}

const request = async (path: string, data: any) => {
  return await ipcRenderer.invoke(IPC_ROUTER_EVENT_KEY, {
    path,
    data,
  });
};

request.send = (path: string, data: any) => {
  ipcRenderer.send(IPC_ROUTER_EVENT_KEY, {
    path,
    data,
  });
};

export default request;
