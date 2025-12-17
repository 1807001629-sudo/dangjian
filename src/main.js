import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 确保有全局样式
import './assets/styles/main.css';

// 创建应用
const app = createApp(App);

// 使用路由
app.use(router);

// 挂载到 DOM
app.mount('#app');

console.log('Vue应用已启动');