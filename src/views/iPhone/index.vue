<template>
  <div
    class="drop-box"
    id="drop-area"
    @dragover.prevent="active = true"
    @dragleave="active = false"
    @drop="dropFile"
  >
    <p>请将需要同步的图片拖拽至此</p>
  </div>
  <p>已上传图片：{{ files[0] }}</p>
</template>

<script setup>
import { shallowRef, ref } from "vue";
import { handleMainPost } from "@/plugins/util";
const files = ref([]);
const active = shallowRef(false);
const dropFile = (event) => {
  active.value = false;
  const f = event.dataTransfer.files;
  files.value.push(f[0].path);
};
handleMainPost("iPhone-get-img", () => {
  return files.value;
});
</script>
<style lang="scss" scoped>
.drop-box {
  width: 500px;
  height: 300px;
  border: 1px solid #999;
  border-radius: 4px;
}
</style>
