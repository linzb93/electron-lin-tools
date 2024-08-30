import { ipcMain } from "electron";
import { createServer } from "@linzb93/event-router";
import monitor from "../api/monitor";
import setting from "../api/setting";
import schedule from '../api/schedule';
import commonFn from "../api/common";

export default () => {
  const app = createServer({
    handle(name: string, callback: Function) {
      return ipcMain.handle(name, async (_, dataStr) => {
        return await callback(JSON.parse(dataStr));
      });
    },
  });
  app.use("monitor", monitor);
  app.use("setting", setting);
  app.use("schedule", schedule);
  commonFn(app);
};
