<template>
  <el-table :data="list">
    <el-table-column label="项目名称" prop="name"></el-table-column>
    <el-table-column label="文件夹" prop="path"></el-table-column>
    <el-table-column label="状态">
      <template #default="scope">
        <p class="red" v-if="scope.row.status === 1">未提交</p>
        <p class="yellow" v-else-if="scope.row.status === 2">未推送</p>
        <p class="gray" v-else-if="scope.row.status === 4">不在主分支上</p>
        <p class="green" v-else-if="scope.row.status === 3">成功</p>
        <p v-else>非Git项目</p>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-link
          type="primary"
          :underline="false"
          @click="request('open-is-vscode', scope.row.path)"
          >打开编辑器</el-link
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted } from "vue";
import request from "@/plugins/request";

const list = ref([]);
const getList = async () => {
  const result = await request("schedule-git-scan-result");
  list.value = result.list;
};
onMounted(() => {
  getList();
});
</script>
<style lang="scss" scoped>
.red {
  color: #f56c6c;
}
.green {
  color: #67c23a;
}
.gray {
  color: #909399;
}
.yellow {
  color: #e6a23c;
}
</style>
