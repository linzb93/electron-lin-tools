import { ipcMain } from "electron";
import chalk from "chalk";
import VueController from "../../api/vue";
import OSSController from "../../api/oss";
import { getApiList } from "./decorators";
import wrapResponse from "../../plugins/wrapResponse";
import { HTTP_STATUS } from "../../plugins/constant";
import { Request } from "../../types/api";
export default () => {
  new VueController();
  new OSSController();

  ipcMain.handle("api", async (_, requestStr: string) => {
    const request = JSON.parse(requestStr) as Request;
    const { path } = request;
    const apiList = getApiList();
    const match = apiList.find((item) => item.path === path);
    if (match) {
      const { Class, propertyKey } = match;
      try {
        const ctor = new Class();
        const ret = await ctor[propertyKey](request);
        return wrapResponse(ret);
      } catch (error) {
        console.log(`api ${chalk.green(match.path)} error`);
        console.log(error.message);
        return wrapResponse({
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "服务器故障",
        });
      }
    }
  });
};
