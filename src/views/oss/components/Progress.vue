<template>
  <el-drawer
    class="progress-drawer"
    title="上传进度"
    :size="300"
    :model-value="visible"
    :modal="false"
    direction="btt"
    @close="close"
    @closed="closed"
  >
    <div class="ctrl-bar flexalign-center">
      <el-button
        type="primary"
        size="small"
        @click="copy(list.value.map((item) => item.url))"
        >复制全部</el-button
      >
    </div>
    <el-table :data="list" :border="false">
      <el-table-column>
        <template #default="scope">
          <div class="status"></div>
          <img class="thumb" :src="scope.row.url" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="size" label="尺寸"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-popconfirm
            title="确认撤销"
            placement="top"
            @confirm="redo(scope.row)"
          >
            <template #reference>
              <el-link type="primary">撤销</el-link>
            </template>
          </el-popconfirm>
          <el-link type="primary" @click="copy(scope.row.url)">复制</el-link>
        </template>
      </el-table-column>
    </el-table>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import request from "@/plugins/request";
import { copy } from "@/plugins/util";
const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible", "refresh"]);
const list = ref([]);
watch(props, ({ visible }) => {});

// 撤销
const redo = async (item) => {
  await request("", {
    file: item.url,
  });
  ElMessage.success("撤销成功");
  emit("refresh");
};
const close = () => {
  emit("update:visible", false);
};
const closed = () => {
  list.value = [];
};
</script>
<style lang="scss" scoped>
.progress-drawer {
  width: 700px;
  left: auto;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}
</style>
