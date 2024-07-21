import { MiddlewareContext, Listener } from "./types";

interface ListenerItem {
  path: string;
  callback: Listener;
  async: boolean;
}

const Route = () => {
  const database: ListenerItem[] = [];
  const middleware = async (ctx: MiddlewareContext, next: Function) => {
    const match = database.find((item) => ctx.path === item.path);
    if (!match) {
      return await next();
    }
    return await match.callback(ctx);
  };
  middleware.on = (path: string, callback: Listener) => {
    database.push({
      path,
      callback,
      async: false,
    });
  };
  middleware.handle = (path: string, callback: Listener) => {
    database.push({
      path,
      callback,
      async: true,
    });
  };
  return middleware;
};

export default Route;
