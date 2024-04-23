import { ipcMain } from "electron";
import chalk from "chalk";
import CommonController from "../../api/common";
import OSSController from "../../api/oss";
import VueController from '../../api/vue';
import { getApiList } from "./decorators";
import wrapResponse from "../../plugins/wrapResponse";
import { HTTP_STATUS } from "../../plugins/constant";
import { Request } from "../../types/api";

export default () => {
  new CommonController();
  new OSSController();
  new VueController();

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
        console.log(`api ${chalk.green(match.path)} error`);
        error && console.trace(error.message);
        return wrapResponse({
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Server error",
        });
      }
    }
  });
};
