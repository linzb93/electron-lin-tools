<template>
  <div class="container full-height flexalign-start">
    <menus />
    <div class="flexitem-1 cont full-height">
      <router-view />
    </div>
  </div>
</template>
<script setup>
import Menus from "./components/Menus.vue";
</script>
<style scoped>
.cont {
  padding: 20px;
}
</style>
