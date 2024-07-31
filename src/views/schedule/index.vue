<template>
  <el-form label-suffix="：">
    <h2>
      <span>Git项目同步检查</span>
      <router-link to="/schedule/result">
        <el-button type="primary" size="small" class="ml10">查看结果</el-button>
      </router-link>
    </h2>
    <el-form-item label="选择项目">
      <select-dirs v-model:dirs="gitForm.dirs" />
    </el-form-item>
    <el-form-item label="选择提醒周期">
      <el-radio-group v-model="gitForm.period">
        <el-radio :value="1">每天</el-radio>
        <el-radio :value="2">
          <span>每周</span>
          <el-select
            multiple
            v-model="gitForm.weeks"
            class="input-medium ml10"
            :disabled="gitForm.period !== 2"
          >
            <el-option
              v-for="week in weeks"
              :key="week.id"
              :label="week.title"
              :value="week.id"
            />
          </el-select>
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <h2>监控系统提醒</h2>
    <el-alert type="warning" class="mb20" show-icon :closable="false"
      >监控系统提醒功能目前还未开发</el-alert
    >
    <el-form-item label="选择监听文件">
      <p>{{ monitorForm.file }}</p>
      <el-button type="primary" @click="selectFile">添加文件</el-button>
    </el-form-item>
    <el-form-item label="监听规则">
      <div class="monitor-con">
        <p>
          项目发布后<el-input-number
            v-model="monitorForm.timeAfterPublish"
            class="input-medium mx10"
            :min="1"
            :max="3"
          />小时
        </p>
        <p>
          项目发布后第二天<el-input-number
            v-model="monitorForm.timeNextDay"
            class="input-medium mx10"
            :min="9"
            :max="11"
          />时
        </p>
        <p>
          <span>每周</span>
          <el-select v-model="monitorForm.weekDay" class="input-medium mx10">
            <el-option
              v-for="week in weeks"
              :key="week.id"
              :label="week.title"
              :value="week.id"
            /> </el-select
          >，
          <el-time-picker
            class="input-medium mx10"
            v-model="monitorForm.timeEveryWeek"
          />
          <span class="ml10">遍历所有监控应用。</span>
        </p>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SelectDirs from "./components/SelectDirs.vue";
import { ElMessage } from "element-plus";
import request from "@/plugins/request";

onMounted(async () => {
  const setting = await request("schedule-get");
  if (!setting) {
    return;
  }
  gitForm.value = setting.git;
  monitorForm.value = setting.monitor;
});

const gitForm = ref({
  dirs: [],
  period: 1,
  weeks: [5],
});
const weeks = [
  { title: "星期一", id: 1 },
  { title: "星期二", id: 2 },
  { title: "星期三", id: 3 },
  { title: "星期四", id: 4 },
  { title: "星期五", id: 5 },
];
const makeRange = (start, end) => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

// 监控
const monitorForm = ref({
  file: "",
  timeAfterPublish: 1,
  timeNextDay: 9,
  weekDay: 1,
  timeEveryWeek: "",
});
const selectFile = async () => {
  const file = await request("get-selected-file");
  monitorForm.value.file = file;
};

const save = async () => {
  await request("schedule-save", {
    git: gitForm.value,
    monitor: monitorForm.value,
  });
  ElMessage.success("保存成功");
};
</script>
<style lang="scss" scoped>
h2 {
  font-size: 18px;
  color: #000;
  font-weight: bold;
  margin-bottom: 20px;
}
.input-large {
  width: 200px;
}
.input-medium {
  width: 130px !important;
}
.monitor-con {
  p {
    margin-bottom: 10px;
  }
}
.mx10 {
  margin-left: 10px;
  margin-right: 10px;
}
</style>
