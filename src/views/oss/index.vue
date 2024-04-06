<template>
  <el-button type="primary" @click="add">添加项目</el-button>
  <ul>
    <li v-for="item in list" :key="item.id" @click="jump(item)">
      {{ item.name }}({{ getPlatformName(item.platform) }})
    </li>
  </ul>
  <el-dialog v-model="visible" title="添加项目" width="400" @close="close">
    <el-form :model="form" label-suffix=":" label-width="130px">
      <el-form-item label="名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="平台">
        <el-select v-model="form.platform">
          <el-option label="阿里云" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="region">
        <el-input v-model="form.region" />
      </el-form-item>
      <el-form-item label="accessKeyId">
        <el-input v-model="form.accessKeyId" />
      </el-form-item>
      <el-form-item label="accessKeySecret">
        <el-input v-model="form.accessKeySecret" />
      </el-form-item>
      <el-form-item label="bucket">
        <el-input v-model="form.bucket" />
      </el-form-item>
      <el-form-item label="domain">
        <el-input v-model="form.domain" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive, onMounted } from "vue";
import request from "@/plugins/request";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();

const list = ref([]);
const getList = async () => {
  const data = await request("oss-get-project-list");
  list.value = data.list;
};
onMounted(() => {
  getList();
});

const visible = shallowRef(false);
const add = () => {
  visible.value = true;
};
const form = ref({});
const close = () => {
  visible.value = false;
};
const submit = async () => {
  await request("oss-create", form.value);
  ElMessage.success("添加成功");
  close();
  getList();
};
const getPlatformName = (type) => {
  if (type === 1) {
    return "阿里云";
  }
  return "";
};
const jump = (item) => {
  router.push({
    path: "/oss/detail",
    query: {
      id: item.id,
    },
  });
};
</script>
<style lang="scss" scoped>
.el-link + .el-link {
  margin-left: 10px;
}
</style>
