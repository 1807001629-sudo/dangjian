// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 导入 Dashboard 作为首页
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '数据看板' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { title: '人员管理' }
  },
  {
    path: '/process',
    name: 'Process',
    component: () => import('@/views/Process.vue'),
    meta: { title: '流程跟踪' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/Activities.vue'),
    meta: { title: '活动管理' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/Analytics.vue'),
    meta: { title: '数据分析' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router