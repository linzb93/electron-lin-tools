<template>
  <div class="path flexalign-center">
    <div
      class="path-item"
      v-for="(item, index) in pathList"
      :key="item"
      @click="clickPath(index)"
    >
      <el-icon>
        <folder />
      </el-icon>
      <span>{{ item }}</span>
      <el-icon v-if="index < pathList.length - 1">
        <arrow-right />
      </el-icon>
    </div>
  </div>
  <div>
    <el-button type="primary" @click="createDir">创建文件夹</el-button>
    <el-button type="primary" @click="upload">上传文件</el-button>
    <el-button type="primary" @click="getData">刷新</el-button>
  </div>
  <el-table :data="fileList" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <el-table-column label="名称">
      <template #default="scope">
        <file-type-icon :type="getFileExt(scope.row)" />
      </template>
    </el-table-column>
    <el-table-column label="类型/大小"></el-table-column>
    <el-table-column label="最后修改时间"></el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-link type="primary" @click="copy(scope.row.url)">获取地址</el-link>
        <el-link type="primary">下载</el-link>
        <delete-confirm @confirm="del(scope.row)"></delete-confirm>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, shallowRef, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { Folder, ArrowRight } from "@element-plus/icons-vue";
import request from "@/plugins/request";
import { copy } from "@/plugins/util";
import FileTypeIcon from "./components/FileTypeIcon.vue";
import DeleteConfirm from "@/components/DeleteConfirm.vue";
const route = useRoute();

const fileList = shallowRef([]);
const getData = async () => {
  const data = await request("oss-get-oss-list", {
    id: route.query.id,
    config: {
      prefix: `diankeduo/${pathList.join("/")}`,
      delimiter: "/",
    },
  });
  fileList.value = data.list;
};
onMounted(() => {
  getData();
});

const pathList = ref([]);
const clickPath = (index) => {
  pathList.value = pathList.value.slice(0, index);
};

const handleSelectionChange = (val) => {
  console.log(val);
};
const getFileExt = (item) => {
  return "";
};
const del = async (item) => {
  await request("oss-delete-file", {
    name: item.name,
  });
};
const createDir = () => {
  ElMessageBox.prompt("请输入文件夹名称", "温馨提醒", {
    confirmButtonText: "创建",
  })
    .then(({ value }) => {
      if (!value) {
        ElMessage.error("请输入文件夹名称");
        return;
      }
      request("oss-create-directory", {
        name: value,
      });
    })
    .catch(() => {
      //
    });
};
const upload = () => {
  request("oss-upload");
};
</script>
<style lang="scss" scoped></style>
