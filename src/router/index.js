import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Members.vue'), // 默认显示成员管理
    meta: { title: '首页' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { title: '人员管理' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/Activities.vue'),
    meta: { title: '活动管理' }
  },
  {
    path: '/process',
    name: 'Process',
    component: () => import('@/views/Process.vue'),
    meta: { title: '流程跟踪' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/members'  // 404重定向到成员管理
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 党建管理系统`
  }
  next()
})

export default router