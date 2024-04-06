<template></template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import request from "@/plugins/request";
const route = useRoute();

onMounted(async () => {
  const data = await request("oss-get-oss-list", {
    id: route.query.id,
    config: {
      prefix: "diankeduo/dkd-aibaodan/home/",
      delimiter: "/",
    },
  });
});
</script>
<style lang="scss" scoped></style>
