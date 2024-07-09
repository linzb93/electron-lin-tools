<template>
  <div>
    <div>
      <el-button type="primary" @click="visible.apps = true"
        >管理应用</el-button
      >
    </div>
    <el-form label-suffix="：" class="mt20">
      <el-form-item label="选择应用">
        <el-checkbox-group v-model="form.selected" v-if="apps.length">
          <el-checkbox
            v-for="app in apps"
            :key="app.siteId"
            :value="app.siteId"
            >{{ app.name }}</el-checkbox
          >
        </el-checkbox-group>
        <p v-else>无</p>
      </el-form-item>
      <el-form-item label="选择日期">
        <el-radio-group v-model="form.dateValue" @change="radioChange">
          <el-radio-button :value="0">今日</el-radio-button>
          <el-radio-button :value="1"
            >昨日<qa
              class="ml10"
              v-if="yesterdayInfo.is"
              :content="yesterdayInfo.content"
          /></el-radio-button>
          <el-radio-button :value="2">近7日</el-radio-button>
          <el-radio-button :value="3" class="date-picker-wrap">
            <span>自定义</span>
            <el-date-picker
              ref="customerDatePicker"
              v-model="form.range"
              @change="changeDate"
              type="daterange"
              placeholder="请选择日期"
              class="above"
            ></el-date-picker>
          </el-radio-button>
        </el-radio-group>
        <span class="ml10">{{ dateRange }}</span>
      </el-form-item>
      <el-button type="primary" @click="generate">生成</el-button>
    </el-form>
    <div v-for="panel in panels" :key="panel.id" class="mt30">
      <h2>{{ panel.title }}</h2>
      <el-table :data="panel.data" class="mt20">
        <el-table-column label="错误信息" prop="content" />
        <el-table-column label="发生页面" prop="url" />
        <el-table-column label="浏览量" prop="errorCount" />
        <el-table-column label="影响客户数" prop="numberOfAffectedUsers" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="focusError(scope.row, panel.siteId)"
              >定位错误</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <app-manage v-model:visible="visible.apps" @confirm="resetSelectedApps" />
</template>

<script setup>
import { reactive, shallowReactive, ref, onMounted, computed } from "vue";
import dayjs from "dayjs";
import { pick } from "lodash-es";
import { ElMessage } from "element-plus";
import request from "@/plugins/request";
import { service } from "./utils";
import Qa from "@/components/Qa.vue";
import AppManage from "./components/AppManage.vue";

const visible = shallowReactive({
  apps: false,
  code: false,
});

const getSelectedApps = async () => {
  const data = await request("monitor-get-apps");
  apps.value = data.list;
};
onMounted(() => {
  getSelectedApps();
});

const resetSelectedApps = () => {
  form.selected = [];
  getSelectedApps();
};

const apps = ref([]);
const form = reactive({
  selected: [],
  dateValue: 0,
  beginDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
  range: [],
});

const dateRange = computed(() => {
  if (form.beginDate === form.endDate) {
    return form.beginDate;
  }
  return `${form.beginDate}~${form.endDate}`;
});

const customerDatePicker = ref(null);
const radioChange = (value) => {
  if (value === 3) {
    customerDatePicker.value.focus();
  } else {
    typeof customerDatePicker.value.blur === "function" &&
      customerDatePicker.value.blur();
    const map = [
      [0, 0],
      [1, 1],
      [7, 0],
    ];
    form.beginDate = dayjs().subtract(map[value][0], "d").format("YYYY-MM-DD");
    form.endDate = dayjs().subtract(map[value][1], "d").format("YYYY-MM-DD");
  }
};
const changeDate = (range) => {
  form.beginDate = dayjs(range[0]).format("YYYY-MM-DD");
  form.endDate = dayjs(range[1]).format("YYYY-MM-DD");
  console.log(form.dateValue);
};

const panels = ref([]);
const generate = async () => {
  if (!form.selected.length) {
    ElMessage.error("请至少选择一个应用");
    return;
  }
  const pMap = form.selected.map((app) =>
    service.post("/data/analysis/jsErrorCount", {
      beginTime: `${form.beginDate} 00:00:00`,
      endTime: `${form.endDate} 23:59:59`,
      orderKey: "errorCount",
      orderByAsc: false,
      pageIndex: 1,
      pageSize: 100,
      siteId: app.siteId,
      type: ["eventError", "consoleError"],
      visitType: 0,
    })
  );
  panels.value = await Promise.all(pMap);
};
const focusError = async (row, siteId) => {
  const res = await service.post("/data/analysis/getVisitInfo", {
    ...pick(row, ["content", "url"]),
    beginTime: `${form.beginDate} 00:00:00`,
    endTime: `${form.endDate} 23:59:59`,
    pageIndex: 1,
    pageSize: 1,
    siteId,
    type: ["eventError", "consoleError"],
  });
  const target = res.list[0];
  // visible.code = true;
  // TODO:取错误定位前200个字符，后100个字符。去掉无用的代码，然后格式化，定位改成用箭头指示。
};

const yesterdayInfo = {
  is: dayjs().day() === 1,
  content: `获取的是${dayjs().subtract(3, "d").format("YYYY-MM-DD")}~${dayjs()
    .subtract(1, "d")
    .format("YYYY-MM-DD")}的报告`,
};
</script>
<style scoped lang="scss">
.date-picker-wrap {
  position: relative !important;
  :deep(.el-date-editor) {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    width: 0;
    z-index: -1;
    padding: 0;
    .el-input__inner {
      padding: 0;
    }
  }
}
.above {
  z-index: 1 !important;
  width: 100% !important;
  cursor: pointer;
}
</style>
