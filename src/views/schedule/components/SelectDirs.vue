<template>
  <ul v-if="props.value.length">
    <li v-for="item in props.value" :key="item">{{ item }}</li>
  </ul>
  <el-button type="primary" @click="selectDirs">添加目录</el-button>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive } from "vue";
import request from "@/plugins/request";

const props = defineProps({
  value: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["input"]);

const selectDirs = () => {};
</script>
<style lang="scss" scoped></style>
