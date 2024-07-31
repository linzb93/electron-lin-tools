import { unref, isReactive } from "vue";
import { sleep } from "@linzb93/utils";
import { createClient } from "@linzb93/event-router";
import { loading } from "./util";
interface Option {
  delay: number;
  showLoading: boolean;
}

const request = createClient({
  invoke(name, data) {
    return window.ipcRenderer.invoke(name, JSON.stringify(data));
  },
});

export default async (path: string, params: any, options?: Option) => {
  if (options?.showLoading) {
    loading.open();
  }
  const res = await request(path, params);
  if (options?.showLoading) {
    loading.close();
  }
  if (options?.delay) {
    await sleep(options.delay);
  }
  console.groupCollapsed(`发送请求：%c${path}%c`, "color:green", "");
  console.log("参数：");
  console.log(isReactive(params) ? unref(params) : params);
  console.log("收到请求结果：");
  console.log(res);
  console.groupEnd();
  if (res.code !== 200) {
    return Promise.reject(res);
  }
  return res.result;
};
