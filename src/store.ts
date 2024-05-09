import { defineStore } from "pinia";
import { handleMainPost } from "./plugins/util";
import request from "./plugins/request";

export const useGlobalStore = defineStore("oss", {
  state: () => ({
    setting: {},
    ipcIsConnect: false,
  }),
  actions: {
    saveSetting(payload: any) {
      this.setting = payload;
    },
    listenIpcConnected() {
      handleMainPost("ipc-is-connect", (ret: boolean) => {
        this.ipcIsConnect = ret;
      });
      request("ipc-connect", {});
    },
  },
});
