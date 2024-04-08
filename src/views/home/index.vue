<template>
  <ul class="menu-list flexalign-center">
    <li v-for="menu in menuList" :key="menu.title">
      <router-link :to="menu.to">{{ menu.title }}</router-link>
    </li>
  </ul>
</template>

<script setup>
import { shallowRef } from "vue";

const menuList = shallowRef([
  {
    title: "Vue",
    to: "/vue",
  },
  {
    title: "OSS",
    to: "/oss",
  },
  {
    title: "iPhone",
    to: "/iPhone",
  },
]);
</script>
<style lang="scss" scoped>
.menu-list {
  li {
    margin-left: 30px;
    padding: 0 10px;
    width: 120px;
    height: 30px;
    border-radius: 4px;
    line-height: 30px;
    border: 1px solid #999;
    font-size: 18px;
    color: #333;
    &:first-child {
      margin-left: 0;
    }
  }
}
</style>
