import Application from "./Application";
import Route from "./Route";
export const createIpcRoute = (eventName: string) => {
  return new Application(eventName);
};

export { Route };
