<template>
  <el-alert type="error" :closeable="false" v-if="isDisconnect" class="mb20"
    >服务器已断联，请重新打开</el-alert
  >
  <div>
    <el-button type="primary" @click="add">添加项目</el-button>
  </div>

  <el-table :data="list">
    <el-table-column label="名称" prop="name"></el-table-column>
    <el-table-column label="地址" prop="path"></el-table-column>
    <el-table-column label="状态" width="80px">
      <template #default="scope">
        <div class="status active" v-if="scope.row.status === 2"></div>
        <div class="status starting" v-else-if="scope.row.status === 1"></div>
        <div class="status nothing" v-else></div>
      </template>
    </el-table-column>
    <el-table-column label="端口" prop="port" width="80px">
      <template #default="scope">
        {{ scope.row.port || "无" }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="250px">
      <template #default="scope">
        <div class="flexalign-center">
          <el-link
            :underline="false"
            type="primary"
            @click="serve(scope.row)"
            v-if="!scope.row.serveUrl"
            >启动服务</el-link
          >
          <el-link
            :underline="false"
            type="warning"
            @click="kill(scope.row)"
            v-else
            >关闭服务</el-link
          >
          <el-link :underline="false" type="primary" @click="build(scope.row)"
            >打包</el-link
          >
          <delete-confirm @confirm="remove(scope.row)"></delete-confirm>
          <el-dropdown
            class="ml10"
            @command="(command) => handleMore(scope.row, command)"
          >
            <el-link :underline="false" type="primary"
              >更多 <el-icon> <arrow-down /> </el-icon
            ></el-link>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="build-serve"
                  >打包后启动服务</el-dropdown-item
                >
                <el-dropdown-item command="copy">复制服务地址</el-dropdown-item>
                <el-dropdown-item command="copy-qr"
                  >生成二维码</el-dropdown-item
                >
                <el-dropdown-item command="serve-test"
                  >打包测试环境</el-dropdown-item
                >
                <el-dropdown-item command="build-serve-test"
                  >打包测试环境并启动服务</el-dropdown-item
                >
                <el-dropdown-item command="get-memory-used"
                  >获取项目占用内存</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑项目' : '添加项目'"
    width="400px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      label-suffix="："
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="地址" prop="path">
        <el-input v-model="form.path" style="width: 218px" />
        <el-button type="primary" class="ml10" @click="selectPath"
          >选择</el-button
        >
      </el-form-item>
      <el-form-item label="appKey" prop="appKey">
        <el-input v-model="form.appKey" />
      </el-form-item>
      <el-form-item label="平台" prop="platform">
        <el-input v-model="form.platform" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, shallowRef, onMounted, computed } from "vue";
import request from "@/plugins/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import DeleteConfirm from "@/components/DeleteConfirm.vue";
import { useGlobalStore } from "@/store";
import qrcode from "qrcode";

const globalStore = useGlobalStore();
const isDisconnect = computed(() => !globalStore.ipcIsConnect); // 是否与ipc断联

// 获取列表
const list = ref([]);
const getList = async () => {
  const res = await request("vue-get-list");
  list.value = res.list;
};
onMounted(() => {
  getList();
});

// 添加/编辑项目
const form = ref({
  name: "",
  path: "",
  appKey: "",
  platform: "",
});
const rules = {
  path: {
    required: true,
    message: "请选择或输入项目地址",
  },
};
const formRef = ref(null);
const visible = shallowRef(false);
const isEdit = shallowRef(false);

// 添加应用
const add = async () => {
  visible.value = true;
};
const selectPath = async () => {
  const { path } = await request("get-selected-path");
  form.value.path = path;
};
const submit = () => {
  formRef.value.validate(async (isValid) => {
    if (!isValid) {
      return;
    }
    await request("vue-add", form.value);
    ElMessage.success("添加成功");
    visible.value = false;
    getList();
  });
};

// 启动服务
const serve = async (item) => {
  if (isDisconnect.value) {
    ElMessage.error("请先启动ipc服务");
    return;
  }
  ElMessage({
    type: "info",
    message: "正在启动项目",
    duration: 3000,
  });
  item.status = 1;
  try {
    const { address } = await request("vue-start", {
      path: item.path,
    });
    ElMessage.success("启动成功");
    item.port = address.slice(-4);
    item.serveUrl = address;
    item.status = 2;
  } catch (error) {
    ElMessage.success("启动失败");
    item.port = 0;
    console.log(error);
  }
};
// 中断服务
const kill = async (item) => {
  await request("vue-kill", {
    path: item.path,
  });
  ElMessage.success("停止成功");
  item.status = 0;
  item.port = "";
};

// 打包
const build = async (item) => {
  if (isDisconnect.value) {
    ElMessage.error("请先启动ipc服务");
    return;
  }
  ElMessage({
    type: "info",
    message: "正在打包项目",
    duration: 3000,
  });
  item.status = 1;
  try {
    await request("vue-build", {
      path: item.path,
    });
    item.status = 2;
    ElMessage.success("打包成功");
  } catch (error) {
    ElMessage.success("打包失败");
    console.log(error);
  }
};

// 更多操作
const handleMore = async (item, command) => {
  if (command === "copy") {
    await request("copy", item.serveUrl);
  } else if (command === "build-serve") {
    if (!isDisconnect.value) {
      ElMessage.error("请先启动ipc服务");
      return;
    }
    await request("vue-build-serve", {
      path: item.path,
    });
    ElMessage.success("启动成功");
    getList();
  } else if (command === "copy-qr") {
    const base64Qr = await qrcode.toDataURL(
      `${item.serveUrl}${item.publicPath}/#/login?code=${item.token}`
    );
    await request("copy-image", {
      url: base64Qr,
      type: "base64",
    });
    ElMessage.success("复制成功");
  } else {
    building();
  }
};

// 移除
const remove = async (item) => {
  await request("vue-remove", {
    path: item.path,
  });
  ElMessage.success("移除成功");
  getList();
};

// 即将上线
const building = () => {
  ElMessageBox.alert("该功能即将上线，敬请期待", "温馨提醒", {
    confirmButtonText: "我知道了",
  });
};
</script>
<style lang="scss" scoped>
.el-link + .el-link {
  margin-left: 10px;
}
.status {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.active {
  background-color: #67c23a;
}
.starting {
  background: pink;
}
.nothing {
  background-color: #ccc;
}
@keyframes scaleLight {
  from {
    transform: none;
    opacity: 0.8;
  }
  to {
    transform: scale(1.1);
    opacity: 0;
  }
}
.doing {
  background-color: #67c23a;
  position: relative;
  &:after {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: scaleLight 1.2s infinite;
  }
}
</style>
