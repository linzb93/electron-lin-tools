import { createRouter, createWebHashHistory } from "vue-router";

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("./views/home/index.vue"),
    },
    {
      path: "/vue",
      component: () => import("./views/vue/index.vue"),
    },
    {
      path: "/oss",
      component: () => import("./views/oss/index.vue"),
    },
    {
      path: "/oss/detail",
      component: () => import("./views/oss/detail.vue"),
    },
  ],
});
