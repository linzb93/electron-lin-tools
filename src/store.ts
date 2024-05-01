import { defineStore } from "pinia";
import { handleMainPost } from "./plugins/util";

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
      handleMainPost("ipc-is-connected", (ret) => {
        this.ipcIsConnect = ret;
      });
    },
  },
});
