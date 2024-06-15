import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("./views/home/index.vue"),
  },
  {
    path: "/oss",
    component: () => import("./views/oss/index.vue"),
  },
  {
    path: "/oss/detail",
    component: () => import("./views/oss/detail.vue"),
  },
  {
    path: "/iPhone",
    component: () => import("./views/iPhone/index.vue"),
    meta: {
      hide: process.platform === "darwin",
    },
  },
  {
    path: "/vue",
    component: () => import("./views/vue/index.vue"),
  },
  {
    path: "/setting",
    component: () => import("./views/setting/index.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes: routes.filter((route) => !route.meta?.hide),
});
