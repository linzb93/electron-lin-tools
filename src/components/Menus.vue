<template>
  <ul class="menu-list full-height">
    <li v-for="menu in menuList" :key="menu.title">
      <router-link :to="menu.to">{{ menu.title }}</router-link>
    </li>
  </ul>
</template>

<script setup>
import { shallowRef } from "vue";

const menuList = shallowRef([
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
  width: 200px;
  padding-top: 20px;
  background: #3f4156;
  padding-bottom: 20px;
  li {
    padding: 0 10px;
    line-height: 2;
    color: #e9eaf2;
    font-size: 14px;
    &:first-child {
      margin-top: 0;
    }
    &:hover {
      color: #fff;
    }
    a {
      color: inherit;
    }
  }
}
</style>
