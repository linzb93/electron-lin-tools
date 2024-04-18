<template>
  <el-button type="primary" @click="add">添加项目</el-button>
  <el-table :data="list">
    <el-table-column label="名称" prop="name"></el-table-column>
    <el-table-column label="地址" prop="path"></el-table-column>
    <el-table-column label="状态">
      <template #default="scope">
        <div class="status active" v-if="scope.row.status"></div>
        <div class="status nothing" v-else></div>
      </template>
    </el-table-column>
    <el-table-column label="操作">
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
            type="warn"
            @click="kill(scope.row)"
            v-else
            >关闭服务</el-link
          >
          <el-link :underline="false" type="primary" @click="build(scope.row)"
            >打包</el-link
          >
          <delete-confirm @confirm="remove(scope.row)"
            >确认删除？</delete-confirm
          >
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
                  >打包后启动</el-dropdown-item
                >
                <el-dropdown-item command="copy">复制服务地址</el-dropdown-item>
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
    <el-form ref="formRef" label-width="80px" label-suffix="：">
      <el-form-item label="名称" prop="name">
        <el-input size="small" v-model="form.name" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input size="small" v-model="form.path" />
        <el-button size="small" @click="selectPath">选择</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="small" type="primary" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, shallowRef } from "vue";
import request from "@/plugins/request";
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import DeleteConfirm from "@/components/DeleteConfirm.vue";

const list = ref([
  {
    name: "dkd-jyzs-mobile",
    path: "/meituan/dkd-jyzs-mobile",
    status: false,
  },
]);
const getList = async () => {
  const res = await request("vue-get-list");
  list.value = res.list;
};
// getList();

const form = ref({
  name: "",
  path: "",
});
const formRef = ref(null);
const visible = shallowRef(false);
const isEdit = shallowRef(false);
// 添加应用
const add = async () => {
  visible.value = true;
};
const selectPath = async () => {
  const pt = await request("select-path");
  form.value.path = pt;
};
const submit = () => {
  formRef.value.validate(async (isValid) => {
    if (!isValid) {
      return;
    }
    await request("vue-add", form.value);
    ElMessage.success("添加成功");
    getList();
  });
};

// 启动服务
const serve = async (item) => {
  await request("vue-serve", {
    path: item.path,
  });
  ElMessage.success("启动成功");
  getList();
};
// 中断服务
const kill = async (item) => {
  await request("vue-kill", {
    path: item.path,
  });
  ElMessage.success("停止成功");
  getList();
};

// 打包
const build = async (item) => {
  await request("vue-build", {
    path: item.path,
  });
  ElMessage.success("打包成功");
};

// 更多操作
const handleMore = async (item, command) => {
  if (command === "copy") {
    await request("copy", item.serveUrl);
  } else if (command === "build-serve") {
    await request("vue-build-serve", {
      path: item.path,
    });
    ElMessage.success("启动成功");
    getList();
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
.nothing {
  background-color: #ccc;
}
</style>
