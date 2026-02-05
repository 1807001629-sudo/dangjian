<template>
  <div id="app">
    <!-- 简单的导航 -->
    <div v-if="showNav" class="simple-nav">
      <h1 style="color: #c7000a; margin-bottom: 20px;">党建管理系统</h1>
      <div class="nav-buttons">
        <button @click="goToPage('/members')" :class="{ active: currentRoute === '/members' }">
          人员管理
        </button>
        <button @click="goToPage('/activities')" :class="{ active: currentRoute === '/activities' }">
          活动管理
        </button>
        <button @click="goToPage('/process')" :class="{ active: currentRoute === '/process' }">
          流程跟踪
        </button>
      </div>
    </div>
    
    <!-- 路由视图 -->
    <div class="content">
      <router-view></router-view>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div>加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const showNav = ref(true)

const currentRoute = computed(() => {
  return route.path
})

const goToPage = (path) => {
  loading.value = true
  router.push(path).finally(() => {
    setTimeout(() => {
      loading.value = false
    }, 300)
  })
}

onMounted(() => {
  console.log('App.vue已挂载')
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
  background: #f5f5f5;
}

.simple-nav {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.nav-buttons button {
  padding: 10px 30px;
  border: 2px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  color: #595959;
}

.nav-buttons button:hover {
  border-color: #c7000a;
  color: #c7000a;
  background: #fffafa;
}

.nav-buttons button.active {
  border-color: #c7000a;
  background: #c7000a;
  color: white;
}

.content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #c7000a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nav-buttons {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .nav-buttons button {
    width: 200px;
  }
}
</style>