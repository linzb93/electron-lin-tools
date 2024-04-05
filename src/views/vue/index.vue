<template>
  <el-button @click="add">添加项目</el-button>
  <el-table :data="list">
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column prop="url" label="地址">
      <template #default="scope">
        {{ scope.row.url }}
        <el-link type="primary" @click="copy(scope.row.url)">复制地址</el-link>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-link type="primary" @click="serve(scope.row)">启动服务</el-link>
        <el-link type="primary" @click="build(scope.row)">打包</el-link>
        <el-link type="danger" @click="remove(scope.row)">移除</el-link>
        <el-dropdown @command="handleCommand">
          <el-link type="primary"
            >更多<el-icon class="el-icon--right"><arrow-down /></el-icon
          ></el-link>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="build-serve"
                >打包后启动服务</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import request from "@/plugins/request";
const list = ref([]);

const serve = async (project) => {
  const url = await request("vue-serve", project.path);
  project.url = url;
};
const build = async (project) => {
  await request("vue-build", project.path);
};
const remove = async (project) => {
  await request("vue-remove", project.path);
};
const handleCommand = async (command) => {
  if (command === "build-serve") {
    await request("vue-build", project.path);
  }
};
const copy = (text) => {
  request("copy", text);
  ElMessage.success("复制成功");
};
</script>
<style lang="scss" scoped></style>
