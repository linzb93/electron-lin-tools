import { ipcMain } from "electron";
import chalk from "chalk";
import CommonController from "../../api/common";
import OSSController from "../../api/oss";
import VueController from "../../api/vue";
import MonitorController from "../../api/monitor";
import SettingController from "../../api/setting";
import { IpcController } from "../ipc";
import { getApiList } from "./decorators";
import wrapResponse from "../wrapResponse";
import { HTTP_STATUS } from "../constant";
import { Request } from "../../types/api";
import logger from "../logger";

export default () => {
  new CommonController();
  new SettingController();
  new IpcController();
  new OSSController();
  new VueController();
  new MonitorController();

  ipcMain.handle("api", async (event, requestStr: string) => {
    const request = JSON.parse(requestStr) as Request;
    const { path } = request;
    const apiList = getApiList();
    const match = apiList.find((item) => item.path === path);
    if (match) {
      const { Class, propertyKey } = match;
      try {
        const ctor = new Class();
        const ret = await ctor[propertyKey](request, event);
        return wrapResponse(ret);
      } catch (error) {
        error &&
          error.message &&
          logger(`api ${chalk.green(match.path)} error:
        ${error.message}`);

        return wrapResponse({
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Server error",
        });
      }
    }
  });
};
