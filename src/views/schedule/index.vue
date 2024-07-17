<template>
<el-form>
    <h2>Git项目同步检查</h2>
    <el-form-item label="选择项目">
        <select-dirs v-model="gitForm.dirs" />
    </el-form-item>
    <el-form-item label="选择提醒周期">
        <el-radio-group v-model="gitForm.period">
            <el-radio :label="1">每天</el-radio>
            <el-radio :label="2">
                <span>每周</span>
                <el-select multiple v-model="gitForm.weeks" :disabled="gitForm.period !== 2">
                    <el-option v-for="week in weeks" :key="week.id" :label="week.title" :value="week.id" />
                </el-select>
            </el-radio>
        </el-radio-group>
    </el-form-item>
    <el-form-item label="选择提醒时间">
        <el-time-picker v-model="gitForm.time" :disabled-hours="makeRange(0,16).concat(makeRange(18,23))" />
    </el-form-item>
    <h2>监控系统提醒</h2>
    <el-form-item label="选择监听文件">
        <el-input />
    </el-form-item>
    <el-form-item label="监听规则">
        <p>项目发布后<el-input-number v-model="monitorForm.timeAfterPublish" :min="1" :max="3" />小时</p>
        <p>项目发布后第二天<el-input-number v-model="monitorForm.timeNextDay" :min="9" :max="11"  />时</p>
        <p>每周<el-input v-model="monitorForm.weekDay" />，<el-time-picker v-model="monitorForm.timeEveryWeek" />遍历所有监控应用。</p>
    </el-form-item>
    <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
    </el-form-item>
</el-form>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive } from 'vue';
import SelectDirs from './components/SelectDirs.vue';
import { ElMessage } from 'element-plus';
const gitForm = shallowReactive({
    dirs: []
});
const weeks = [
    {title: '星期一', id: 1},
    {title: '星期二', id: 2},
    {title: '星期三', id: 3},
    {title: '星期四', id: 4},
    {title: '星期五', id: 5},
];
const makeRange = (start, end) => {
  const result= [];
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
};

// 监控
const monitorForm = shallowReactive({
    timeAfterPublish: 1,
});

const save = () => {
    ElMessage.success('保存成功');
}
</script>
<style lang="scss" scoped>

</style>