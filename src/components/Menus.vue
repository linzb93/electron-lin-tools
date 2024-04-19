<template>
  <ul class="menu-list full-height">
    <li
      v-for="menu in menuList"
      :key="menu.title"
      :class="{ active: isActive(menu) }"
    >
      <router-link :to="menu.to" class="flexalign-center">
        <el-icon class="pre-icon">
          <component :is="menu.icon" />
        </el-icon>
        <span>{{ menu.title }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup>
import { Refresh, Iphone } from "@element-plus/icons-vue";
import { VueIcon } from "./icons/index";
import { useRoute } from "vue-router";

const route = useRoute();

const list = [
  {
    title: "OSS",
    to: "/oss",
    icon: Refresh,
  },
  {
    title: "iPhone",
    to: "/iPhone",
    icon: Iphone,
    hide: process.platform === "darwin",
  },
  {
    title: "Vue",
    to: "/vue",
    icon: VueIcon,
  },
];
const menuList = list.filter((item) => !item.hide);
const isActive = (menu) => route.path.startsWith(menu.to);
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
    font-size: 16px;
    cursor: pointer;
    &:first-child {
      margin-top: 0;
    }
    &:hover,
    &.active {
      background-color: lighten(#3f4156, 5%);
    }
    a {
      color: inherit;
    }
  }
  .pre-icon {
    margin-right: 5px;
  }
}
</style>
