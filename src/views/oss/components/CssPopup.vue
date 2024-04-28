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
          <el-radio :label="2">二倍图</el-radio>
          <el-radio :label="1">原图</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="平台">
        <el-radio-group v-model="form.platform">
          <el-radio :label="1">移动端</el-radio>
          <el-radio :label="2">PC端</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="copy-con mt10" v-html="copyText"></div>
    <template #footer>
      <el-button type="primary" @click="copy(cssText)">复制</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { watch, shallowRef, computed, shallowReactive } from "vue";
import { copy } from "@/plugins/util";

const props = defineProps({
  visible: Boolean,
  url: String,
});
const emit = defineEmits(["update:visible"]);
const form = shallowReactive({
  pixel: 2,
  platform: 1,
});

const cssText = shallowRef("");
watch(props, ({ visible, url }) => {
  if (!visible) {
    return;
  }
  const img = new Image();
  img.src = url;
  img.onload = function () {
    const { width, height } = this;
    cssText.value = `width: rem(${parseInt(width / 2)});
height: rem(${parseInt(height / 2)});
background-image: url(${props.url});
background-size: 100% 100%;`;
  };
});
const copyText = computed(() => {
  return cssText.value
    .split("\n")
    .filter((item) => !!item)
    .map((item) =>
      item.length > 65 ? `<p>${item.substring(0, 65)}...</p>` : `<p>${item}</p>`
    )
    .join("");
});
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
