<template>
  <el-dialog
    :model-value="visible"
    width="500px"
    title="复制样式"
    @close="close"
  >
    <el-form label-suffix="：">
      <el-form-item label="倍数">
        <el-radio-group v-model="form.pixel">
          <el-radio :value="2">二倍图</el-radio>
          <el-radio :value="1">原图</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="平台">
        <el-radio-group v-model="form.platform">
          <el-radio :value="1">移动端</el-radio>
          <el-radio :value="2">PC端</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import request from "@/plugins/request";
import { ElMessage } from "element-plus";
const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible", "submit"]);
const form = ref({
  pixel: 2,
  platform: 1,
});

const getSetting = async () => {
  const data = await request("oss-get-setting");
  form.value = data.setting;
  emit("submit", form.value);
};
getSetting();

const save = async () => {
  await request("oss-save-setting", form.value);
  ElMessage.success("保存成功");
  emit("submit", form.value);
  close();
};
const close = () => {
  emit("update:visible", false);
};
</script>
<style lang="scss" scoped>
.copy-con {
  background: #e1e1e1;
  padding: 10px;
  border-radius: 2px;
}
</style>
