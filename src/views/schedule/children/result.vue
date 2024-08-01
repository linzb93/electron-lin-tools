<template>
  <div class="head">
    <div class="curp flexalign-center" @click="$router.back()">
      <el-icon><Back /></el-icon>
    <span class="ml10">定时任务管理</span>
    </div>
  </div>
  <template v-if="loaded">
    <el-alert class="mt30" type="info" :closable="false">扫描完成，用时{{ duration }}秒</el-alert>
    <div class="mt20">
      <el-button type="primary" @click="openInEditor()">批量打开编辑器</el-button>
    </div>
    <el-table :data="list" class="mt20" @selection-change="handleSelectionChange">
      <el-table-column type="selection" />
      <el-table-column label="项目名称" prop="name"></el-table-column>
      <el-table-column label="文件夹" prop="folderName"></el-table-column>
      <el-table-column sortable prop="status" label="状态">
        <template #default="scope">
          <p class="red" v-if="scope.row.status === 1">未提交</p>
          <p class="yellow" v-else-if="scope.row.status === 2">未推送</p>
          <p class="gray" v-else-if="scope.row.status === 4">不在主分支上</p>
          <p v-else>非Git项目</p>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-link
            type="primary"
            :underline="false"
            @click="openInEditor(scope.row)"
            >打开编辑器</el-link
          >
        </template>
      </el-table-column>
    </el-table>
  </template>
</template>

<script setup lang="ts">
import { shallowRef, onMounted } from "vue";
import { useRouter } from "vue-router";
import {Back} from '@element-plus/icons-vue';
import request from "@/plugins/request";

const router = useRouter();
const loaded = shallowRef(false);
const list = shallowRef([]);
let duration = shallowRef('0');
const getList = async () => {
  const startTime = Date.now();
  const result = await request(
    "schedule-git-scan-result",
    {},
    {
      showLoading: true,
    }
  );
  duration.value = ((Date.now() - startTime) / 1000).toFixed(2);
  list.value = result.list;
  loaded.value = true;
};
onMounted(() => {
  getList();
});

const selected = shallowRef([] as any[]);
const handleSelectionChange = (rows:any[]) => {
  selected.value = rows;
}
const openInEditor = (row?:any) => {
  if (row) {
    request('open-in-vscode', row.path);
    return;
  }
  request('open-in-vscode', selected.value.map(item =>item.path));
}
</script>
<style lang="scss" scoped>
.red {
  color: #f56c6c;
}
.gray {
  color: #909399;
}
.yellow {
  color: #e6a23c;
}
.head {
  font-size: 16px;
  color: #212121;
}
</style>
