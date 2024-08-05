import { ref, unref, isReactive, shallowRef } from "vue";
import { sleep } from "@linzb93/utils";
import { createClient } from "@linzb93/event-router";
import { loading } from "./util";
interface Option {
  delay?: number;
  showLoading?: boolean;
}

const request = createClient({
  invoke(name, data) {
    return window.ipcRenderer.invoke(name, JSON.stringify(data));
  },
});

export default async function doRequest(
  path: string,
  params?: any,
  options?: Option
) {
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
}

// hook
export function useRequest<T = any>(
  path: string,
  params?: any,
  options?: Option
) {
  const loaded = shallowRef(false);
  const result = ref<T>();
  return {
    loaded,
    result,
    async fetch() {
      const res = await doRequest(path, params, options);
      loaded.value = true;
      result.value = res;
    },
  };
}
