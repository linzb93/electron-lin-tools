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
  },
  {
    path: "/vue",
    component: () => import("./views/vue/index.vue"),
  },
  {
    path: "/monitor",
    component: () => import("./views/monitor/index.vue"),
  },
  {
    path: "/schedule",
    component: () => import("./views/schedule/index.vue"),
  },
  {
    path: "/schedule/result",
    component: () => import("./views/schedule/children/result.vue"),
  },
  {
    path: "/setting",
    component: () => import("./views/setting/index.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
