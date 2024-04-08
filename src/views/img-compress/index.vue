<template>
  <div class="drop-box" id="dropbox">
    <p>请将需要压缩的图片拖拽至此</p>
  </div>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive } from "vue";
</script>
<style lang="scss" scoped>
.drop-box {
  width: 500px;
  height: 300px;
  border: 1px solid #999;
  border-radius: 4px;
}
</style>
