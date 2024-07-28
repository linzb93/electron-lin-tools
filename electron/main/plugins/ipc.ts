import ipc from "node-ipc";
import sql from "./sql";
import { Route } from "@linzb93/event-router";
import { shallowRef } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { Database, Request } from "../types/api";
import { mainPost, uuid } from "./utils";

interface IpcResponse {
  requestId: string;
  action: string;
  params: any;
}

const isConnected = shallowRef(false);
watch(isConnected, (value) => {
  mainPost({
    method: "ipc-is-connect",
    data: value,
    listener: false,
  });
});

ipc.config.id = "electron-lin-tools";
ipc.config.retry = 3000;
ipc.config.silent = true;

const route = Route();
route.handle('save', async (req: Request<{ name: string }>) => {
  await sql(db => {
    db.ipc = req.params.name;
  });
  return null;
});
route.handle('connect', async () => {
  const serverIpcId = await sql(db => db.ipc);
  if (!serverIpcId) {
    return {
      code: 500,
      message: "ipc not set",
    };
  }
  ipc.connectTo(serverIpcId, () => {
    ipc.of[serverIpcId].on("connect", () => {
      isConnected.value = true;
    });
    ipc.of[serverIpcId].on("disconnect", () => {
      isConnected.value = false;
    });
  });
});

export const ipcInvoke = (action: string, request: any) =>
  new Promise(async (resolve, reject) => {
    const serverIpcId = await sql(db => db.ipc);
    if (!serverIpcId) {
      reject("not to set");
      return;
    }
    if (!isConnected.value) {
      reject("not connected");
      return;
    }
    const requestId = uuid();
    ipc.of[serverIpcId].emit("message", {
      action,
      params: request,
      requestId,
    });
    function listener(response: IpcResponse) {
      if (response.requestId === requestId) {
        ipc.of[serverIpcId].off("message", listener);
        resolve(response);
      }
    }
    ipc.of[serverIpcId].on("response", listener);
  });
