<template>
  <el-dialog :model-value="visible" width="400px" title="复制样式">
    <el-input type="textarea" v-model="cssText" resize="none" :rows="6" />
    <template #footer>
      <el-button type="primary" @click="copy(cssText)">复制</el-button>
      <el-button @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive, watch } from "vue";
import { copy } from "@/plugins/util";
import request from "@/plugins/request";
import { ElMessageBox, ElMessage } from "element-plus";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible"]);
watch(props, () => {
  console.log(props);
});

const cssText = shallowRef("");
const close = () => {
  emit("update:visible", false);
};
const save = async () => {
  await request("oss-save-css", {
    content: cssText.value,
  });
  ElMessage.success("保存成功");
  close();
};
</script>
<style lang="scss" scoped></style>
