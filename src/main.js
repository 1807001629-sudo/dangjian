// main.js
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
  size: 'default',
  zIndex: 2000,
});

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 添加路由调试
router.beforeEach((to, from, next) => {
  console.log('=== 路由跳转 ===');
  console.log('从:', from.path, from.name);
  console.log('到:', to.path, to.name);
  console.log('组件:', to.matched[0]?.components?.default);
  next();
});

router.afterEach((to, from) => {
  console.log('路由跳转完成:', to.path);
});

router.onError((error) => {
  console.error('路由错误:', error);
  console.error('错误栈:', error.stack);
});

// 使用路由
app.use(router);

// 挂载到 DOM
app.mount('#app');

console.log('Vue应用已启动');

// 暴露给全局以便调试
window.vueApp = app;