<template>
  <div
    class="drop-box"
    id="drop-area"
    @dragover.prevent="active = true"
    @dragleave="active = false"
    @drop="dropFile"
  >
    <p>请将需要压缩的图片拖拽至此</p>
  </div>
  <el-button type="primary" @click="startCompress">开始压缩</el-button>
</template>

<script setup>
import { ref, shallowRef } from "vue";
import request from "@/plugins/request";
const files = ref([]);
const active = shallowRef(false);
const dropFile = (event) => {
  active.value = false;
  const f = event.dataTransfer.files;
  files.value.push(f[0].path);
};
const startCompress = async () => {
  await request("compress-start");
};
</script>
<style lang="scss" scoped>
.drop-box {
  width: 500px;
  height: 300px;
  border: 1px solid #999;
  border-radius: 4px;
}
</style>
