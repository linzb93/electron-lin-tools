<template>
  <div class="menu-list full-height">
    <div class="flexpack-end">
      <el-icon
        @click="startSync"
        class="btn-refresh curp"
        title="同步"
        :class="{ loading: syncing }"
      >
        <Refresh />
      </el-icon>
    </div>
    <ul>
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
  </div>
  <el-dialog v-model="visible" title="登录" width="400px">
    <el-form
      label-suffix="："
      label-width="70px"
      :model="account"
      :rules="rules"
      ref="accountRef"
    >
      <el-form-item label="账号">
        <el-input v-model="account.user" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="account.password"
          type="password"
          placeholder="请输入密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { Refresh, Iphone, HomeFilled } from "@element-plus/icons-vue";
import { Oss } from "./icons";
import { VueIcon } from "./icons/index";
import { useRoute } from "vue-router";
import request from "@/plugins/request";
import { shallowReactive, ref, shallowRef } from "vue";

const route = useRoute();

const list = [
  {
    title: "首页",
    to: "/",
    icon: HomeFilled,
  },
  {
    title: "阿里OSS",
    to: "/oss",
    icon: Oss,
  },
  {
    title: "iPhone同步",
    to: "/iPhone",
    icon: Iphone,
    hide: process.platform === "darwin",
  },
  {
    title: "Vue项目管理",
    to: "/vue",
    icon: VueIcon,
  },
];
const menuList = list.filter((item) => !item.hide);
const isActive = (menu) => {
  if (route.path === "/") {
    return menu.to === "/";
  }
  return route.path.startsWith(menu.to) && menu.to !== "/";
};

// 同步
const syncing = shallowRef(false);
const visible = shallowRef(false);
const account = shallowReactive({
  user: "",
  password: "",
});
const rules = {
  user: { required: true, message: "请输入账号" },
  password: { required: true, message: "请输入密码" },
};
const accountRef = ref(null);
const startSync = async () => {
  syncing.value = true;
  const result = await request("sync");
  if (!result.success) {
    // 未登录账号
    visible.value = true;
  }
  syncing.value = false;
};
const save = () => {
  accountRef.value.validate(async (isValid) => {
    if (!isValid) {
      return;
    }
    await request("login", ...account);
    ElMessage.success("登录成功");
    syncing.value = true;
    await request("sync");
    syncing.value = false;
  });
};
</script>
<style lang="scss" scoped>
.btn-refresh {
  font-size: 16px;
  color: #fff;
  margin: 0 10px 10px 0;
}
.loading {
  animation: rotate 1.2s linear infinite;
}
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
