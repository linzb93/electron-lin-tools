<template>
<el-dialog title="应用管理" width="400px" :model-value="visible" @close="close" @closed="closed">
    <div class="app-list">
      <el-checkbox-group v-model="selected">
        <div v-for="app in apps" :key="app.siteId">
          <el-checkbox :label="app">{{ app.name }}</el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="close">关闭</el-button>
      <el-button @click="save" type="primary">保存</el-button>
    </template>
</el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from "element-plus";
import request from "@/plugins/request";
import { pick } from "lodash-es";
import { service } from '../utils';
const props = defineProps({
    visible: Boolean
});
const emit = defineEmits(['update:visible', 'confirm']);
watch(props, ({visible}) => {
  if (!visible || list.value.length) {
    return;
  }
  service
    .post("/siteInfo/getSiteInfo", {
      pageSize: 100,
      pageIndex: 1,
    })
    .then((res) => {
      list.value = res.list;
    });
});
const list = ref([]);
const selected = ref([]);

// 保存
const save = async () => {
  await request("monitor-save-apps", selected.value.map(item => pick(item, ['name', 'siteId'])));
  ElMessage({
    type: 'success',
    message: "保存成功",
    onClose() {
      close();
      emit('confirm');
    }
  });
};
const close = () => {
  emit('update:visible', false);
};
const closed = () => {};
</script>
<style lang="scss" scoped>
.app-list {
  max-height: 700px;
  overflow: auto;
}
</style>