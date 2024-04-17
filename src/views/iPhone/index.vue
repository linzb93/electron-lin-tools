<template>
  <div
    class="drop-box"
    :class="{ active: active }"
    id="drop-area"
    @dragover.prevent="active = true"
    @dragleave="active = false"
    @drop="dropFile"
  >
    <p v-if="files.length === 0">请将需要同步的图片拖拽至此</p>
    <div class="sended-img" v-else>
      <el-image
        v-for="img in files"
        :key="img"
        :src="img"
        fit="cover"
        class="img-item"
      />
    </div>
  </div>
  <el-dialog title="收到图片" v-model:visible="visible" width="500px">
    <el-image :src="gettedImg" class="received-image" />
    <template #footer>
      <el-button type="primary" @change="download">下载</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { shallowRef, ref } from "vue";
import { ElMessage } from "element-plus";
import { handleMainPost } from "@/plugins/util";
import request from "@/plugins/request";

const files = ref([]);
const active = shallowRef(false);
const dropFile = async (event) => {
  active.value = false;
  const fList = event.dataTransfer.files;
  const res = await request(
    "save-temp",
    Array.from(fList).map((file) => file.path)
  );
  files.value = files.value.concat(res.list);
};

// iPhone批量获取电脑图片地址
handleMainPost("iPhone-get-img", () => {
  return files.value;
});

// iPhone批量上传图片
const gettedImg = shallowRef("");
const visible = shallowRef(false);
handleMainPost("iPhone-upload-img", (data) => {
  gettedImg.value = data.url;
  visible.value = true;
});
const download = async () => {
  await request("download", gettedImg.value);
  ElMessage.success("下载成功");
};
</script>
<style lang="scss" scoped>
.drop-box {
  width: 500px;
  height: 300px;
  border: 1px solid #999;
  border-radius: 4px;
  text-align: center;
  padding: 10px;
  position: relative;
  &.active {
    &:after {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: 2;
      background: rgba(255, 255, 0, 0.4);
    }
  }
}
.receive-image {
  width: 150px;
  height: 150px;
  border-radius: 2px;
  margin-right: 10px;
}
.sended-img {
  margin-top: 30px;
  .img-item {
    width: 120px;
    height: 120px;
    border-radius: 2px;
    margin-left: 10px;
    &:first-child {
      margin-left: 0;
    }
  }
}
</style>
