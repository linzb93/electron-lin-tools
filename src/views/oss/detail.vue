<template>
  <div class="path flexalign-center">
    <template v-if="pathList.length">
      <el-icon @click="clickPath(-1)" class="curp">
        <home-filled />
      </el-icon>
      <el-icon class="mr10">
        <arrow-right />
      </el-icon>
    </template>
    <div
      class="path-item flexalign-center curp"
      v-for="(item, index) in pathList"
      :key="item"
      @click="clickPath(index)"
    >
      <el-icon>
        <folder />
      </el-icon>
      <span class="path-name">{{ item }}</span>
      <el-icon v-if="index < pathList.length - 1">
        <arrow-right />
      </el-icon>
    </div>
  </div>
  <div class="mt20 flexalign-center">
    <el-icon @click="router.back()" class="mr10 curp" title="返回" :size="20"
      ><back
    /></el-icon>
    <el-button type="primary" @click="createDir">创建文件夹</el-button>
    <el-button type="primary" @click="upload">上传文件</el-button>
    <el-button type="primary" @click="getData">刷新</el-button>
  </div>
  <el-table
    class="mt30"
    :data="fileList"
    v-loading="loading"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column label="名称">
      <template #default="scope">
        <div class="flexalign-center">
          <el-icon
            v-if="scope.row.type === 'dir'"
            :size="16"
            style="margin-right: 5px"
          >
            <folder />
          </el-icon>
          <file-type-icon :type="getFileExt(scope.row)" v-else />
          <span class="file-name" @click="jumpInner(scope.row)">{{
            scope.row.name
          }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="类型/大小">
      <template #default="scope">
        <template v-if="scope.row.type === 'dir'">目录</template>
        <template v-else>{{ getSize(scope.row) }}</template>
      </template>
    </el-table-column>
    <el-table-column label="最后修改时间">
      <template #default="scope">
        {{
          scope.row.type === "dir"
            ? ""
            : dayjs(scope.row.lastModified).format("YYYY-MM-DD HH:mm:ss")
        }}
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-link
          type="primary"
          @click="copy(scope.row.url)"
          v-if="scope.row.type !== 'dir'"
          >获取地址</el-link
        >
        <el-link type="primary" @click="download(scope.row.url)">下载</el-link>
        <delete-confirm @confirm="del(scope.row)"></delete-confirm>
      </template>
    </el-table-column>
  </el-table>
  <progress-drawer
    v-model:visible="visible.progress"
    :upload-list="uploadingList"
    @refresh="getData"
  />
</template>

<script setup>
import { ref, shallowRef, shallowReactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import dayjs from "dayjs";
import { Folder, ArrowRight, Back, HomeFilled } from "@element-plus/icons-vue";
import { scrollTo } from "@/plugins/scroll-to";
import request from "@/plugins/request";
import { copy, download } from "@/plugins/util";
import FileTypeIcon from "./components/FileTypeIcon.vue";
import DeleteConfirm from "@/components/DeleteConfirm.vue";
import ProgressDrawer from "./components/Progress.vue";
const route = useRoute();
const router = useRouter();

const fileList = shallowRef([]);
const pathList = ref([]);
const fullPath = computed(() =>
  pathList.value.map((item) => `${item}/`).join("")
);
const visible = shallowReactive({
  progress: false,
});
const loading = shallowRef(true);
loading.value = true;
const getData = async () => {
  const data = await request("oss-get-oss-list", {
    id: Number(route.query.id),
    config: {
      prefix: fullPath.value,
    },
  });
  loading.value = false;
  fileList.value = data.list;
  scrollTo(0, 800);
};
onMounted(() => {
  getData();
});

const clickPath = (index) => {
  pathList.value = pathList.value.slice(0, index + 1);
  getData();
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
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extName)) {
    return "img";
  }
  if (
    ["mp4", "wav", "avi", "mpeg", "mov", "flv", "m4a", "mp3"].includes(extName)
  ) {
    return "video";
  }
  if (
    [
      "html",
      "css",
      "js",
      "vue",
      "json",
      "md",
      "jsx",
      "vue",
      "scss",
      "svg",
      "txt",
      "ts",
    ].includes(extName)
  ) {
    return extName;
  }
  if (extName.startsWith("json")) {
    return "json";
  }
  if (["sass", "less"].includes(extName)) {
    return "scss";
  }
  if (extName === "tsx") {
    return "jsx";
  }
  return "file";
};
const del = async (item) => {
  const name = item.type === "dir" ? `${item.name}/` : item.name;
  await request("oss-delete-file", {
    id: Number(route.query.id),
    file: `${fullPath.value}${name}`,
  });
  ElMessage.success("删除成功");
  getData();
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
        id: Number(route.query.id),
        path: fullPath.value,
        name: value,
      });
    })
    .catch(() => {
      //
    });
};

const uploadingList = ref([]);
const upload = async () => {
  const { list } = await request("oss-upload", {
    id: Number(route.query.id),
    path: fullPath.value,
  });
  visible.progress = true;
  uploadingList.value = list;
  ElMessage.success("上传成功");
  getData();
};
</script>
<style lang="scss" scoped>
.el-link + .el-link {
  margin-left: 10px;
}
.path-name {
  margin-left: 4px;
}
.file-name {
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
</style>
