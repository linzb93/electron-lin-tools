import { ipcMain } from "electron";
import { createServer } from "@linzb93/event-router";
import oss from "../api/oss";
import monitor from "../api/monitor";
import setting from "../api/setting";
import commonFn from "../api/common";

export default () => {
  const app = createServer({
    handle(name: string, callback: Function) {
      return ipcMain.handle(name, async (_, dataStr) => {
        return await callback(JSON.parse(dataStr));
      });
    },
  });
  app.use("oss", oss);
  app.use("monitor", monitor);
  app.use("setting", setting);
  commonFn(app);
};
