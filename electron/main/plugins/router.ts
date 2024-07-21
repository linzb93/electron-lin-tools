import ipcRouter from "../ipc-router";
import oss from "../api/oss";
import monitor from "../api/monitor";
import setting from "../api/setting";
import commonRouteRegister from "../api/common";

export default () => {
  const app = ipcRouter.create();
  app.use("oss", oss);
  app.use("monitor", monitor);
  app.use("setting", setting);
  commonRouteRegister(app);
};
