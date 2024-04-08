<template>
  <div class="path flex">
    <div
      class="path-item flexalign-center"
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
    <el-icon @click="router.back()" class="mr10"><back /></el-icon>
    <el-button type="primary" @click="createDir">创建文件夹</el-button>
    <el-button type="primary" @click="upload">上传文件</el-button>
    <el-button type="primary" @click="getData">刷新</el-button>
  </div>
  <el-table :data="fileList" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <el-table-column label="名称">
      <template #default="scope">
        <file-type-icon :type="getFileExt(scope.row)" />
        <span @click="jumpInner(scope.row)">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column label="类型/大小">
      <template #default="scope">
        <template v-if="scope.row.type === 'dir'">目录</template>
        <template v-else>{{ getSize(scope.row) }}</template>
      </template>
    </el-table-column>
    <el-table-column label="最后修改时间" prop="lastModified"></el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-link
          type="primary"
          @click="copy(scope.row.url)"
          v-if="scope.row.type !== 'dir'"
          >获取地址</el-link
        >
        <el-link type="primary">下载</el-link>
        <delete-confirm @confirm="del(scope.row)"></delete-confirm>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, shallowRef, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { Folder, ArrowRight, Back } from "@element-plus/icons-vue";
import request from "@/plugins/request";
import { copy } from "@/plugins/util";
import FileTypeIcon from "./components/FileTypeIcon.vue";
import DeleteConfirm from "@/components/DeleteConfirm.vue";
const route = useRoute();
const router = useRouter();

const fileList = shallowRef([]);
const getData = async () => {
  const data = await request("oss-get-oss-list", {
    id: route.query.id,
    config: {
      prefix: pathList.value.map((item) => `${item}/`).join(""),
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
const getExtName = (name) => {
  return name.split("/").at(-1).split(".").at(-1);
};
const getFileExt = (item) => {
  if (item.type === "dir") {
    return "dir";
  }
  const extName = getExtName(item.name);
  if (["jpg", "jpeg", "png", "webp"].includes(extName)) {
    return "img";
  }
  if (["mp4", "wav"].includes("extName")) {
    return "video";
  }
  return "file";
};
const del = async (item) => {
  await request("oss-delete-file", {
    name: item.name,
  });
};
const jumpInner = (item) => {
  if (item.size > 0) {
    // 是文件
    return;
  }
  pathList.value.push(item.name);
  getData();
};
const getSize = (file) => {
  const { size } = file;
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < Math.pow(1024, 2)) {
    return `${(size / 1024).toFixed(1)}KB`;
  }
  if (size < Math.pow(1024, 3)) {
    return `${(size / Math.pow(1024, 2)).toFixed(1)}MB`;
  }
  return `${(size / Math.pow(1024, 3)).toFixed(1)}GB`;
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
<style lang="scss" scoped>
.el-link + .el-link {
  margin-left: 10px;
}
</style>
