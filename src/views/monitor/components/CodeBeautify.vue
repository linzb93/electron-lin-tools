<template>
<el-dialog :model-value="visible" width="400px" title="错误定位" @close="close" @closed="closed">
    <div class="code-wrap" v-if="loaded">
        <span>{{ codePre }}</span>
        <em class="cursor">|</em>
        <span>{{ codeNext }}</span>
    </div>
</el-dialog>
</template>

<script setup>
import { shallowRef, watch } from 'vue';
import request from '@/plugins/request';
const props = defineProps({
    visible: Boolean,
    path: String,
});
const emit = defineEmits(['update:visible']);
const close = () => emit('update:visible');
const closed = () => {};

const loaded = shallowRef(false);
const codePre = shallowRef('');
const codeNext = shallowRef('');
watch(props, async ({visible}) => {
    if (!visible) {
        return;
    }
    let row = 0;
    let column = 0;
    const realPath = props.path.replace(/\:\d+\:\d+/, (match) => {
        const seg = match.split(':');
        row = Number(seg[1]);
        column = Number(seg[2]);
        return '';
    });
    const {result:code} = await request('fetch-api-cross-origin', {
        url: realPath,
    });
    const splitedCode = code.split('\n');
    codePre.value = splitedCode[row - 1].slice(column - 100, column - 1);
    codeNext.value = splitedCode[row - 1].slice(column -1, column + 100);
    loaded.value = true;
})
</script>
<style lang="scss" scoped>
@keyframes fadeIn{
    29% {
        opacity: 0;
    }
    30%,to {
        opacity: 1;
    }
}
.code-wrap {
    background: #222;
    padding: 10px;
    border-radius: 2px;
    color: #fff;
    word-break: break-all;
    .cursor {
        opacity: 0;
        animation: fadeIn 1.2s linear infinite;
        color: #F56C6C;
    }
}
</style>
