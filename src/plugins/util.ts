import request from "./request";
import { ElMessage } from "element-plus";
export const sleep = (time:number) => new Promise(resolve => {
    setTimeout(() => resolve(null), time);
})

export const copy = (text:string) => {
    request("copy", text);
    ElMessage.success("复制成功");
}
export const download = async (url:string) => {
    try {
        await request('download', url);
    } catch (error) {
        return;
    }
    ElMessage.success('下载成功');
}