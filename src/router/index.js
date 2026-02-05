import { createRouter, createWebHistory } from 'vue-router'
import { h, defineAsyncComponent } from 'vue'

console.log('🚦 路由配置开始加载...')

// 创建一个简单的加载组件
const LoadingComponent = {
  render() {
    return h('div', {
      style: {
        padding: '50px',
        textAlign: 'center',
        color: '#666'
      }
    }, '页面加载中...')
  }
}

// 错误组件
const ErrorComponent = {
  render() {
    return h('div', {
      style: {
        padding: '30px',
        background: '#fff2f0',
        borderRadius: '8px',
        border: '1px solid #ffccc7'
      }
    }, '❌ 页面加载失败，请刷新重试')
  }
}

// 定义路由
const routes = [
  {
    path: '/',
    redirect: '/members'
  },
  {
    path: '/members',
    name: 'Members',
    component: defineAsyncComponent({
      loader: () => import('../views/Members.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: ErrorComponent,
      delay: 200,
      timeout: 3000
    }),
    meta: { title: '人员管理' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: defineAsyncComponent({
      loader: () => import('../views/Activities.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: ErrorComponent
    }),
    meta: { title: '活动管理' }
  },
  {
    path: '/process',
    name: 'Process',
    component: defineAsyncComponent({
      loader: () => import('../views/Process.vue'),
      loadingComponent: LoadingComponent,
      errorComponent: ErrorComponent
    }),
    meta: { title: '流程跟踪' }
  }
]

console.log('✅ 路由配置完成，共', routes.length, '个路由')

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  console.log(`📍 路由跳转: ${from.path || '/'} → ${to.path}`)
  if (to.meta.title) {
    document.title = `${to.meta.title} - 党建管理系统`
  }
  next()
})

router.afterEach((to) => {
  console.log(`✅ 路由跳转完成: ${to.path}`)
})

export default router