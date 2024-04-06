import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import './styles/common.scss';
import 'element-plus/dist/index.css';
import router from './router';

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

createApp(App)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
