<template>
  <el-drawer
    class="progress-drawer"
    title="上传进度"
    :size="300"
    :model-value="visible"
    direction="btt"
    style="width: 700px; left: auto"
  >
    <ul class="upload-list">
      <li v-for="item in list"></li>
    </ul>
  </el-drawer>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive, watch } from "vue";
const props = defineProps({
  visible: Boolean,
});
const list = ref([]);
watch(props, ({ visible }) => {});
</script>
<style lang="scss" scoped></style>
