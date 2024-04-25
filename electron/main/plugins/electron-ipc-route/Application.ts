import { ipcMain, IpcMainInvokeEvent } from "electron";
import chalk from "chalk";
import { HTTP_STATUS } from "../constant";
type RouteListener = (event: IpcMainInvokeEvent, obj: any) => void;
type Middleware = (request: any, next: Function) => void;

export default class {
  private routeListeners: {
    method: string;
    listener: RouteListener;
  }[] = [];
  private middlewares: {
    route: string;
    middleware: Middleware;
  }[] = [];
  constructor(private rootName: string) {
    ipcMain.handle(this.rootName, (event, sourceStr: string) => {
      const sourceData = JSON.parse(sourceStr) as {
        method: string;
        data: any;
      };
      // 执行中间件
      const matchMiddlewares = this.middlewares.filter(
        (mw) => mw.route === sourceData.method || !mw.route
      );
      let index = 0;
      const next = () => {
        if (index < matchMiddlewares.length - 1) {
          matchMiddlewares[++index].middleware(sourceData.data, next);
        } else {
          // 找到符合条件的路由程序
          const matchRouteItem = this.routeListeners.find(
            (item) => item.method === sourceData.method
          );
          if (!matchRouteItem) {
            return {
              message: "unknown",
            };
          }
          return matchRouteItem.listener(event, sourceData.data);
        }
      };
      try {
        matchMiddlewares[index].middleware(sourceData.data, next);
      } catch (error) {
        console.log(`api ${chalk.green(sourceData.method)} error`);
        console.trace(error.message);
        return {
          message: "INTERNAL_SERVER_ERROR",
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }
    });
  }

  // 监听
  on(method: string, listener: RouteListener) {
    this.routeListeners.push({
      method,
      listener,
    });
  }
  use(middleware: Middleware): void;
  use(route: string, middleware: Middleware): void;
  use(...params: any[]) {
    if (params.length === 2 && params[1].isRoute) {
      // 处理路由的逻辑
      const routes = params[1];
      const { listeners } = routes;
      this.routeListeners.concat(
        listeners.map((item: { method: string; listener: RouteListener }) => ({
          method: `${params[0]}/${item.method}`,
          listener: item.listener,
        }))
      );
      return;
    }
    let middleware: Middleware;
    let route = "";
    if (params.length === 1) {
      middleware = params[0];
    } else if (params.length === 2) {
      route = params[0];
      middleware = params[1];
    }
    this.middlewares.push({
      route,
      middleware,
    });
  }
}
