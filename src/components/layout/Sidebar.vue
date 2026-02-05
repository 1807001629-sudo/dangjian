<!-- src/components/layout/Sidebar.vue - 简化修复版 -->
<template>
  <aside class="sidebar" :class="{ 'collapsed': collapsed }">
    <!-- Logo区域 -->
    <div class="sidebar-logo">
      <div class="logo-icon">🏛️</div>
      <span v-if="!collapsed" class="logo-text">党建系统</span>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.path" class="nav-item">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ 'active': $route.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="!collapsed" class="nav-text">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- 折叠按钮 -->
    <button @click="toggleCollapse" class="collapse-btn">
      {{ collapsed ? '→' : '←' }}
    </button>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const collapsed = ref(false)

// 导航菜单项
const menuItems = [
  { path: '/', name: '系统首页', icon: '🏠' },
  { path: '/members', name: '成员管理', icon: '👥' },
  { path: '/process', name: '入党流程', icon: '📋' },
  { path: '/activities', name: '活动管理', icon: '🎯' },
  { path: '/statistics', name: '统计分析', icon: '📊' }
]

// 切换折叠状态
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1f1f1f 0%, #2d2d2d 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  min-height: calc(100vh - 64px);
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 64px;
}

/* Logo区域 */
.sidebar-logo {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(199, 0, 10, 0.2);
  border-radius: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .logo-text {
  display: none;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: 0 16px;
}

.nav-item {
  margin-bottom: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 12px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background: rgba(199, 0, 10, 0.2);
  color: white;
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
  white-space: nowrap;
}

.sidebar.collapsed .nav-text {
  display: none;
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  top: 20px;
  right: -12px;
  width: 24px;
  height: 24px;
  background: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #262626;
  z-index: 100;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>