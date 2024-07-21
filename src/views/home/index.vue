<template>
  <div class="home">
    <img src="/logo.png?url" class="logo" />
    <h1 @click="request('copy', 'copy12333332423233')">工具箱</h1>
  </div>
</template>

<script setup>
// test
import request from "@/plugins/request";
</script>
<style scoped lang="scss">
.home {
  text-align: center;
  img {
    width: 220px;
  }
  h1 {
    margin-top: 20px;
    font-size: 30px;
    font-weight: bold;
  }
}
</style>
