import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "./styles/common.scss";
import "element-plus/dist/index.css";
import router from "./router";
import { createPinia } from "pinia";
createApp(App)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .use(router)
  .use(createPinia())
  .mount("#app")
  .$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
  });
