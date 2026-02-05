// src/router/index.js - 修正版
import { createRouter, createWebHashHistory } from 'vue-router'

// 异步导入组件
const Home = () => import('@/views/Home.vue')
const Members = () => import('@/views/Members.vue')
const Process = () => import('@/views/Process.vue')
const Activities = () => import('@/views/Activities.vue')
const Statistics = () => import('@/views/Statistics.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '系统首页' }
  },
  {
    path: '/members',
    name: 'members',
    component: Members,
    meta: { title: '成员管理' }
  },
  {
    path: '/process',
    name: 'process',
    component: Process,
    meta: { title: '入党流程' }
  },
  {
    path: '/activities',
    name: 'activities',
    component: Activities,
    meta: { title: '活动管理' }
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: Statistics,
    meta: { title: '统计分析' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 党建管理系统` : '党建管理系统'
  next()
})

export default router