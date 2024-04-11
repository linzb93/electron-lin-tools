import { createRouter, createWebHashHistory } from "vue-router";

export default createRouter({
  history: createWebHashHistory(),
  routes: [
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
      path: '/iPhone',
      component: () => import("./views/iPhone/index.vue"),
    },
    {
      path: '/img-compress',
      component: () => import("./views/img-compress/index.vue"),
    },
  ],
});
