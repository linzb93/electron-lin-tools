import { unref, isReactive } from "vue";
import { sleep } from "@linzb93/utils";
interface Option {
  delay: number;
}
export default async (path: string, params: any, options?: Option) => {
  const res = await window.ipcRenderer.invoke(
    "api",
    JSON.stringify({
      path,
      params,
    })
  );
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
