<template>
<el-table :data="list">
    <el-table-column label="项目名称"></el-table-column>
    <el-table-column label="文件夹"></el-table-column>
    <el-table-column label="状态"></el-table-column>
    <el-table-column label="详情">
        <template #default="scope">
            <p>分支：{{ scope.row.branch }}</p>
            <p>有XX个文件未提交</p>
            <p>有XX个commit未推送</p>
        </template>
    </el-table-column>
    <el-table-column label="操作">
        <el-link type="primary" :underline="false">打开编辑器</el-link>
        <el-link type="primary" :underline="false">打开文件夹</el-link>
        <el-link type="primary" :underline="false">自动处理</el-link>
    </el-table-column>
</el-table>
</template>

<script setup>
import { ref, shallowRef, reactive, shallowReactive } from 'vue';

const list = ref([]);
</script>
<style lang="scss" scoped>

</style>