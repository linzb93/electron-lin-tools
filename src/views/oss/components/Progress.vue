<template>
  <el-drawer
    class="progress-drawer"
    title="上传进度"
    :model-value="visible"
  ></el-drawer>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive } from "vue";
const props = defineProps({
  visible: Boolean,
});
</script>
<style lang="scss" scoped></style>
