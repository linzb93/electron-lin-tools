<template>
  <span class="file-icon">
    <component :is="map[type]" />
  </span>
</template>

<script setup>
import {
  VueIcon,
  Css,
  Html,
  Js,
  File,
  Json,
  Jsx,
  Markdown,
  Pic,
  Scss,
  Svg,
  Txt,
  Typescript,
  Video,
} from "@/components/icons";
const props = defineProps({
  type: String,
});
const map = {
  html: Html,
  css: Css,
  js: Js,
  json: Json,
  md: Markdown,
  jsx: Jsx,
  img: Pic,
  vue: VueIcon,
  scss: Scss,
  svg: Svg,
  txt: Txt,
  ts: Typescript,
  video: Video,
  file: File,
};
</script>
<style lang="scss" scoped>
.file-icon {
  width: 20px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
}
</style>
