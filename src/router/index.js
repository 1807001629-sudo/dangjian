import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';

// 使用函数式导入避免立即报错
const loadView = (view) => {
  return () => import(`@/views/${view}.vue`);
};

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '数据看板' }
  },
  // 其他页面使用懒加载，这样即使有错误也不会影响主页面
  {
    path: '/members',
    name: 'Members',
    component: loadView('Members'),
    meta: { title: '人员管理' }
  },
  {
    path: '/process',
    name: 'Process',
    component: loadView('Process'),
    meta: { title: '流程跟踪' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: loadView('Activities'),
    meta: { title: '活动管理' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: loadView('Analytics'),
    meta: { title: '数据分析' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 错误处理
router.onError((error) => {
  console.error('路由错误:', error);
});

// 导航守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path);
  document.title = to.meta.title ? `${to.meta.title} - 党建管理系统` : '党建管理系统';
  next();
});

export default router;