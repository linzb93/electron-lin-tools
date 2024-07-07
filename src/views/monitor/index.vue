<template>
  <div>
    <div>
      <el-button type="primary" @click="add">添加</el-button>
    </div>
    <el-form label-suffix="：">
      <el-form-item label="选择应用">
        <el-checkbox-group v-model="apps">
          <el-checkbox
            v-for="app in form.apps"
            :key="app.siteId"
            :label="app.siteId"
            >{{ app.title }}</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="选择日期">
        <el-radio-group v-model="form.dateValue">
          <el-radio-button :label="0">今日</el-radio-button>
          <el-radio-button :label="1"
            >昨日<qa
              class="ml10"
              v-if="yesterdayInfo.is"
              :content="yesterdayInfo.content"
          /></el-radio-button>
          <el-radio-button :label="2">近7日</el-radio-button>
          <el-radio-button :label="3">自定义</el-radio-button>
          <el-date-picker v-model="form.range"></el-date-picker>
        </el-radio-group>
      </el-form-item>
      <el-button type="primary" class="ml10" @click="generate">生成</el-button>
    </el-form>
    <div class="mt20">
      <div v-for="panel in panels" :key="panel.id">
        <h2>{{ panel.title }}</h2>
        <el-table :data="panel.data">
          <el-table-column>
            <template #default="scope">
              <el-button size="small" @click="focusError(scope.row)"
                >定位错误</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <el-dialog v-model="visible.apps" title="编辑应用" width="400px">
    <div class="app-list">
      <el-checkbox-group v-model="selectedApps">
        <div v-for="app in apps" :key="app.siteId">
          <el-checkbox :label="app.siteId">{{ app.name }}</el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="visible.apps = false">关闭</el-button>
      <el-button @click="save" type="primary">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import axios from "axios";
import dayjs from "dayjs";
import request from "@/plugins/request";
import { omit } from "lodash-es";
import { ElMessage } from "element-plus";
import { reactive, shallowReactive, ref, shallowRef, onMounted } from "vue";
import Qa from "@/components/Qa.vue";

const service = axios.create({
  baseURL: "https://api.diankeduo.cn/zhili/dataanaly",
});
service.interceptors.response.use((response) => {
  return response.data.result;
});
const visible = shallowReactive({
  apps: false,
  code: false,
});

const add = () => {
  if (apps.value.length) {
    return;
  }
  loadApps();
  visible.apps = true;
};
const selectedApps = ref([]);
// 保存
const save = async () => {
  await request("monitor-save-apps", selectedApps);
  ElMessage.success("保存成功");
  visible.apps = false;
  getSelectedApps();
};

const getSelectedApps = async () => {
  const data = await request("monitor-get-apps");
  form.apps = data;
};
onMounted(() => {
  getSelectedApps();
});

const apps = ref([]);
const loadApps = () => {
  service
    .post("/siteInfo/getSiteInfo", {
      pageSize: 100,
      pageIndex: 1,
    })
    .then((res) => {
      const { list } = res;
      apps.value = list;
    });
};
const form = reactive({
  apps: [],
  dateValue: 0,
  startDate: "",
  endDate: "",
  range: [],
});
const yesterdayInfo = {
  is: dayjs().day() === 1,
  content: `获取的是${dayjs().subtract(3, "d").format("YYYY-MM-DD")}~${dayjs()
    .subtract(1, "d")
    .format("YYYY-MM-DD")}的报告`,
};
const panels = ref([]);
const generate = () => {
  const pMap = form.apps.value.map((app) => {
    return service.post("/", {});
  });
  Promise.all(pMap).then((resList) => {
    panels.value = resList;
  });
};
const focusError = (row) => {
  visible.code = true;
  // TODO:取错误定位前200个字符，后100个字符。去掉无用的代码，然后格式化，定位改成用箭头指示。
};
</script>
<style scoped lang="scss">
.app-list {
  max-height: 700px;
  overflow: auto;
}
</style>
