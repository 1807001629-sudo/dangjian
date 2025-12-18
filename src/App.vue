<template>
  <div class="app">
    <Navbar />
    <div class="app-layout">
      <Sidebar :total-count="totalMembers" />
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import rawData from '@/assets/data.json';

console.log('App.vue 加载');

const membersData = ref([]);

const totalMembers = computed(() => {
  return membersData.value.length || 0;
});

onMounted(() => {
  console.log('App.vue mounted');
  try {
    membersData.value = Array.isArray(rawData) ? rawData : [];
    console.log('App 数据加载完成，共', membersData.value.length, '条记录');
  } catch (error) {
    console.error('App 数据加载错误:', error);
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 
               'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5715;
  color: #262626;
  background: #fafafa;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 64px);
  position: relative;
}

/* 关键修改：简化侧边栏和主内容的交互 */
.sidebar {
  width: 250px;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  background: white;
  border-right: 1px solid #f0f0f0;
  z-index: 1000;
}

/* 主要内容区域 - 关键修改 */
.app-main {
  flex: 1;
  margin-left: 250px; /* 与侧边栏宽度一致 */
  min-width: 0; /* 防止内容溢出 */
  transition: margin-left 0.3s ease;
  padding: 20px;
  background: #fafafa;
  min-height: calc(100vh - 64px);
}

/* 侧边栏收起时的样式 */
.sidebar.collapsed ~ .app-main {
  margin-left: 60px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 250px;
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 60px;
  }
  
  .app-main {
    margin-left: 0 !important;
    width: 100%;
  }
  
  .sidebar.collapsed ~ .app-main {
    margin-left: 60px !important;
  }
}
</style>