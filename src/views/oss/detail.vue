<template>
  <div
    class="wrap"
    :class="{ active: active }"
    @dragover.prevent="active = true"
    @drop="dropFile"
  >
    <div class="layer" @keyup="active = false">
      <p class="tips">请将需要上传的文件拖拽至此</p>
    </div>
    <div class="flexalign-center">
      <el-button type="primary" @click="createDir">创建文件夹</el-button>
      <el-button type="primary" @click="upload">上传文件</el-button>
      <el-button type="primary" @click="visible.setting = true">设置</el-button>
      <template v-if="selected.length">
        <el-button type="danger" @click="deleteMulti">批量删除</el-button>
        <el-button type="primary" @click="downloadMulti">批量下载</el-button>
      </template>
      <div class="path ml20 flexalign-center">
        <template v-if="breadcrumb.length">
          <el-icon @click="clickPath(-1)" class="curp" :size="16">
            <home-filled />
          </el-icon>
          <el-icon class="mr10" :size="16">
            <arrow-right />
          </el-icon>
        </template>
        <div
          class="path-item flexalign-center curp"
          v-for="(item, index) in breadcrumb"
          :key="item"
          @click="clickPath(index)"
        >
          <el-icon :size="16">
            <folder />
          </el-icon>
          <span class="path-name">{{ item }}</span>
          <el-icon v-if="index < breadcrumb.length - 1">
            <arrow-right />
          </el-icon>
        </div>
      </div>
    </div>
    <context-menu
      :menus="[
        {
          title: '创建文件夹',
          onClick() {
            createDir();
          },
        },
      ]"
    >
      <el-table
        :data="tableList"
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
              <file-type-icon :type="getExtName(scope.row.name)" v-else />
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
            <template v-if="scope.row.type !== 'dir'">
              <el-link
                type="primary"
                :underline="false"
                @click="copy(scope.row.url)"
                >获取地址</el-link
              >
              <el-link
                type="primary"
                :underline="false"
                @click="download(scope.row.url)"
                >下载</el-link
              >
              <el-link
                type="primary"
                :underline="false"
                v-if="isPic(scope.row)"
                @click="getCss(scope.row)"
                >复制样式</el-link
              >
            </template>
            <delete-confirm @confirm="del(scope.row)"></delete-confirm>
          </template>
        </el-table-column>
      </el-table>
    </context-menu>
  </div>

  <progress-drawer
    v-model:visible="visible.progress"
    :upload-list="uploadingList"
    :path="fullPath"
    @refresh="getList"
  />
  <setting-dialog
    v-model:visible="visible.setting"
    @submit="(data) => (setting = data)"
  />
  <el-dialog v-model="visible.preview" title="图片预览" :width="`450px`">
    <div class="center">
      <img :src="previewUrl" class="img-preview" />
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="
          request('open-in-browser', {
            url: previewUrl,
          })
        "
        >在浏览器打开</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, shallowRef, shallowReactive, onMounted, computed, h } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import dayjs from "dayjs";
import { Folder, ArrowRight, HomeFilled } from "@element-plus/icons-vue";
import { scrollTo } from "@/plugins/scroll-to";
import request from "@/plugins/request";
import { copy, download } from "@/plugins/util";
import FileTypeIcon from "@/components/FileTypeIcon.vue";
import DeleteConfirm from "@/components/DeleteConfirm.vue";
import ContextMenu from "@/components/ContextMenu.vue";
import ProgressDrawer from "./components/Progress.vue";
import MsgBoxFileList from "./components/FileList.vue";
import SettingDialog from "./components/Setting.vue";

const route = useRoute();

const tableList = shallowRef([]);
const breadcrumb = ref([]);
const fullPath = computed(() =>
  breadcrumb.value.map((item) => `${item}/`).join("")
);
const visible = shallowReactive({
  progress: false,
  preview: false,
  setting: false,
});
const loading = shallowRef(true);
loading.value = true;

// 获取文件列表
const getList = async () => {
  const data = await request("oss-get-oss-list", {
    id: Number(route.query.id),
    config: {
      prefix: fullPath.value,
    },
  });
  loading.value = false;
  tableList.value = data.list;
  scrollTo(0, 800);
};
onMounted(async () => {
  const { result } = await request("oss-get-shortcut", {
    id: Number(route.query.id),
  });
  if (result) {
    breadcrumb.value.push(result);
  }
  getList();
});

// 点击面包屑
const clickPath = (index) => {
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);
  getList();
};

// 多选
const selected = ref([]);
const handleSelectionChange = (selection) => {
  if (selection.every((item) => item.type !== "dir")) {
    selected.value = selection;
  }
};

// 获取文件后缀
const getExtName = (name) => {
  return name.split("/").at(-1).split(".").at(-1).toLowerCase();
};

// 删除文件
const del = async (item) => {
  const name = item.type === "dir" ? `${item.name}/` : item.name;
  await request("oss-delete-file", {
    id: Number(route.query.id),
    path: `${fullPath.value}${name}`,
  });
  ElMessage.success("删除成功");
  getList();
};
const deleteMulti = () => {
  ElMessageBox({
    message: h(MsgBoxFileList, {
      list: selected.value.map((item) => item.name),
      tips: "确认删除以下文件：",
    }),
    title: "温馨提醒",
    showCancelButton: true,
    confirmButtonText: "删除",
    cancelButtonText: "取消",
  }).then(async () => {
    await request("oss-delete-file", {
      id: Number(route.query.id),
      paths: selected.value.map((item) => `${fullPath.value}${item.name}`),
    });
    ElMessage.success("删除成功");
    selected.value = [];
    getList();
  });
};

// 图片预览
const previewUrl = shallowRef("");
const isPic = (item) => {
  return ["jpg", "png", "gif"].includes(getExtName(item.name));
};
// 进入文件夹内层
const jumpInner = (item) => {
  if (item.size > 0) {
    // 是图片
    if (isPic(item)) {
      previewUrl.value = item.url;
      visible.preview = true;
    }
    return;
  }
  breadcrumb.value.push(item.name);
  getList();
};

const getSize = (file) => {
  const { size } = file;
  const units = ["B", "KB", "MB", "GB"];
  let calcSize = size;
  let index = 0;
  while (calcSize >= 1024) {
    index++;
    calcSize = calcSize / 1024;
  }
  return `${calcSize.toFixed(2)}${units[index]}`;
};

// 批量下载
const downloadMulti = async () => {
  await download(selected.value.map((item) => item.url));
  selected.value = [];
};

// 创建文件夹
const createDir = () => {
  ElMessageBox.prompt("请输入文件夹名称", "温馨提醒", {
    confirmButtonText: "创建",
  })
    .then(async ({ value }) => {
      if (!value) {
        ElMessage.error("请输入文件夹名称");
        return;
      }
      if (
        tableList.value.some(
          (file) => file.type === "dir" && file.name === value
        )
      ) {
        ElMessage.warning("存在同名文件夹，无需创建");
        return;
      }
      await request("oss-create-directory", {
        id: Number(route.query.id),
        path: fullPath.value,
        name: value,
      });
      ElMessage.success("创建成功");
      getList();
    })
    .catch(() => {
      //
    });
};

const uploadingList = ref([]);
const upload = async () => {
  const { paths } = await request("get-selected-file", {
    multiSelections: true,
  });
  visible.progress = true;
  uploadingList.value = paths.map((item) => ({
    ...item,
    size: getSize(item),
  }));
};

// 拖拽上传
const active = shallowRef(false);
const dropFile = async (event) => {
  active.value = false;
  const upOriginList = Array.from(event.dataTransfer.files);
  const resolveList = await new Promise((resolve) => {
    // 过滤重名文件，其他正常上传
    const duplicateFiles = upOriginList.filter((item) =>
      tableList.value.find((sub) => sub.name === item.name)
    );
    if (duplicateFiles.length) {
      ElMessageBox({
        message: h(MsgBoxFileList, {
          list: duplicateFiles.map((item) => item.name),
          tips: "下列文件已存在，是否覆盖？",
        }),
        title: "温馨提醒",
        showCancelButton: true,
        confirmButtonText: "覆盖",
        cancelButtonText: "不覆盖",
      })
        .then(() => {
          resolve(upOriginList);
        })
        .catch(() => {
          resolve(
            upOriginList.filter(
              (item) => !duplicateFiles.find((d) => d.name === item.name)
            )
          );
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      resolve(upOriginList);
    }
  });
  if (resolveList.length) {
    uploadingList.value = resolveList.map((item) => ({
      name: item.name,
      path: item.path,
      size: getSize(item),
    }));
    visible.progress = true;
  } else {
    ElMessage.warning("没有文件需要上传");
  }
};

const setting = ref({
  pixel: 2,
  platform: 1,
});
const getCss = (item) => {
  const img = new Image();
  img.src = item.url;
  img.onload = function () {
    const { width, height } = this;
    const widthData = setting.value.pixel === 2 ? parseInt(width / 2) : width;
    const heightData =
      setting.value.pixel === 2 ? parseInt(height / 2) : height;
    const text = `width: ${
      setting.value.platform === 1 ? `rem(${widthData})` : `${widthData}px`
    };
height: ${
      setting.value.platform === 1 ? `rem(${heightData})` : `${heightData}px`
    };
background-image: url(${item.url});
background-size: 100% 100%;`;
    copy(text);
  };
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
.wrap {
  min-height: 100%;
  position: relative;
  &.active {
    .layer {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: 2;
      background: rgb(64, 158, 255, 0.4);
    }
    .tips {
      display: block;
      text-align: center;
      padding-top: 30px;
      font-size: 16px;
    }
  }
  .layer {
    display: none;
    pointer-events: none;
  }
  .tips {
    display: none;
  }
}
.center {
  text-align: center;
}
.img-preview {
  max-width: 400px;
}
</style>
