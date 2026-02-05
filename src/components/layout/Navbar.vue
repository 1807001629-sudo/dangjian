<!-- src/components/layout/Navbar.vue - 简化版 -->
<template>
  <header class="navbar">
    <div class="navbar-left">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <span class="system-name">党建管理系统</span>
        <span class="separator">/</span>
        <span class="current-page">{{ currentPageName }}</span>
      </div>
    </div>
    
    <div class="navbar-right">
      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-avatar">
          <span>👤</span>
        </div>
        <div class="user-details">
          <div class="user-name">管理员</div>
          <div class="user-role">系统管理员</div>
        </div>
      </div>
      
      <!-- 系统状态 -->
      <div class="system-status">
        <div class="status-item" :class="{ 'online': apiStatus }" @click="refreshStatus">
          <span class="status-dot"></span>
          <span class="status-text">{{ apiStatus ? '在线' : '离线' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const apiStatus = ref(false)

// 获取当前页面名称
const currentPageName = computed(() => {
  const routeName = route.name
  const nameMap = {
    'home': '系统首页',
    'members': '成员管理',
    'process': '入党流程',
    'activities': '活动管理',
    'statistics': '统计分析'
  }
  return nameMap[routeName] || '未知页面'
})

// 检查API状态
async function checkApiStatus() {
  try {
    const response = await fetch('http://localhost:3001/api/health')
    apiStatus.value = response.ok
  } catch (error) {
    apiStatus.value = false
  }
}

// 刷新状态
function refreshStatus() {
  checkApiStatus()
}

// 初始化
onMounted(() => {
  checkApiStatus()
})
</script>

<style scoped>
.navbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.system-name {
  font-weight: 600;
  color: #c7000a;
}

.separator {
  color: #d9d9d9;
}

.current-page {
  color: #595959;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #262626;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  color: #8c8c8c;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f5f5f5;
}

.status-item:hover {
  background: #f0f0f0;
}

.status-item.online {
  background: #f6ffed;
}

.status-item.online .status-dot {
  background: #52c41a;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f5222d;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #595959;
}

.status-item.online .status-text {
  color: #52c41a;
}
</style>