import axios from "axios";
import { loading } from "@/plugins/util";

export const service = axios.create({
    baseURL: "https://api.diankeduo.cn/zhili/dataanaly",
  });
service.interceptors.request.use(config => {
    loading.open();
    return config;
  })
  service.interceptors.response.use((response) => {
    loading.close();
    return response.data.result;
  });
  