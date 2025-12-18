import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';

// 确保有全局样式
import './assets/styles/main.css';

// 创建应用
const app = createApp(App);

// 使用 Element Plus
app.use(ElementPlus, {
  size: 'default', // 'large' | 'default' | 'small'
  zIndex: 2000,
});

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用路由
app.use(router);

// 挂载到 DOM
app.mount('#app');

console.log('Vue应用已启动');