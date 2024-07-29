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
import { useGlobalStore } from "@/store";
import { useRouter } from "vue-router";
import { startScheduler } from "@/views/schedule/utils";
import { handleMainPost } from "@/plugins/util";
const router = useRouter();
const globalStore = useGlobalStore();
// globalStore.getSetting();
// globalStore.listenIpcConnected();

startScheduler();
handleMainPost("show-git-scan-result", (data) => {
  router.push("/schedule/result");
});
</script>
<style scoped>
.cont {
  padding: 20px;
  height: 100%;
  overflow: auto;
}
</style>
