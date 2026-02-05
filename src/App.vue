<!-- src/App.vue - 简化版 -->
<template>
  <div id="app">
    <Navbar v-if="showNavbar" />
    <div class="app-container">
      <Sidebar v-if="showSidebar" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'

const route = useRoute()
const showNavbar = ref(true)
const showSidebar = ref(true)

// 根据路由决定是否显示导航栏
watch(route, (newRoute) => {
  // 可以根据需要隐藏某些页面的导航
  showNavbar.value = true
  showSidebar.value = true
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.app-container {
  display: flex;
  min-height: calc(100vh - 64px); /* 减去Navbar高度 */
}

.main-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>