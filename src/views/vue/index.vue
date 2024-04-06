<template>
  <el-button @click="add">添加项目</el-button>
  <el-table :data="list">
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column prop="url" label="地址">
      <template #default="scope">
        <template v-if="scope.row.url">
          {{ scope.row.url }}
          <el-link type="primary" @click="copy(scope.row.url)"
            >复制地址</el-link
          >
        </template>
        <p v-else>未启动服务</p>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <div class="flexalign-center">
          <el-link :underline="false" type="primary" @click="serve(scope.row)"
            >启动服务</el-link
          >
          <el-link :underline="false" type="primary" @click="build(scope.row)"
            >打包</el-link
          >
          <el-link :underline="false" type="danger" @click="remove(scope.row)"
            >移除</el-link
          >
          <el-dropdown @command="handleCommand" class="ml10">
            <el-link :underline="false" type="primary"
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
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive, onMounted } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import request from "@/plugins/request";
const list = ref([]);
onMounted(async () => {
  const res = await request("vue-get-list");
  list.value = res.list;
});
const add = async () => {
  await request("vue-add");
};
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
<style lang="scss" scoped>
.el-link + .el-link {
  margin-left: 10px;
}
</style>
