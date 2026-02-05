<!-- src/components/layout/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="logo" @click="goHome">
        <div class="logo-icon">🏢</div>
        <h1 class="logo-text">党建管理系统</h1>
      </div>
    </div>
    <div class="navbar-center">
      <!-- 可以添加一些状态指示器 -->
      <div v-if="loading" class="loading-indicator">
        <div class="loading-dot"></div>
        正在同步数据...
      </div>
      <div v-else-if="lastUpdate" class="update-info">
        <span class="update-icon">🔄</span>
        数据更新于: {{ formatTime(lastUpdate) }}
      </div>
    </div>
    <div class="navbar-right">
      <div class="navbar-actions">
        <!-- 刷新数据按钮 -->
        <button 
          class="action-btn refresh-btn" 
          @click="refreshData"
          :disabled="loading"
          :title="loading ? '正在刷新...' : '刷新数据'"
        >
          <span v-if="loading" class="loading-spinner small"></span>
          <span v-else>🔄</span>
        </button>
        
        <!-- 通知按钮 -->
        <div class="notification-wrapper">
          <button class="action-btn notification-btn" @click="toggleNotifications">
            <span>🔔</span>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
          
          <!-- 通知下拉菜单 -->
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="notifications-header">
              <h4>系统通知</h4>
              <button class="mark-read-btn" @click="markAllAsRead">全部标记已读</button>
            </div>
            <div class="notifications-list">
              <div v-if="notifications.length === 0" class="empty-notifications">
                暂无通知
              </div>
              <div 
                v-for="notification in notifications.slice(0, 5)" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon">{{ getNotificationIcon(notification.type) }}</div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ formatRelativeTime(notification.time) }}</div>
                </div>
              </div>
            </div>
            <div class="notifications-footer">
              <router-link to="/notifications" class="view-all-link">查看所有通知</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <div class="user-info" @click="toggleUserMenu">
        <div class="user-avatar">
          <span class="avatar-text">{{ userInitials }}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
        
        <!-- 用户菜单下拉 -->
        <div v-if="showUserMenu" class="user-menu-dropdown">
          <div class="user-info-card">
            <div class="user-avatar-large">
              <span class="avatar-text-large">{{ userInitials }}</span>
            </div>
            <div class="user-info-large">
              <div class="user-name-large">{{ userName }}</div>
              <div class="user-role-large">{{ userRole }}</div>
              <div class="user-department">{{ userDepartment }}</div>
            </div>
          </div>
          <div class="user-menu-items">
            <router-link to="/profile" class="menu-item">
              <span class="menu-icon">👤</span>
              <span>个人中心</span>
            </router-link>
            <router-link to="/settings" class="menu-item">
              <span class="menu-icon">⚙️</span>
              <span>系统设置</span>
            </router-link>
            <div class="menu-divider"></div>
            <button class="menu-item logout-btn" @click="handleLogout">
              <span class="menu-icon">🚪</span>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 通知遮罩 -->
    <div 
      v-if="showNotifications" 
      class="dropdown-mask" 
      @click="showNotifications = false"
    ></div>
    <div 
      v-if="showUserMenu" 
      class="dropdown-mask" 
      @click="showUserMenu = false"
    ></div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { formatRelativeTime, formatTime } from '@/utils/dateFormatter'

const router = useRouter()
const dataStore = useDataStore()

// 响应式数据
const loading = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const lastUpdate = ref(null)
const notifications = ref([])

// 计算属性
const userInitials = computed(() => {
  const name = userName.value || '管理员'
  return name.length >= 2 ? name.slice(0, 2) : name
})

const userName = computed(() => {
  return localStorage.getItem('user_name') || '管理员'
})

const userRole = computed(() => {
  return localStorage.getItem('user_role') || '党建工作负责人'
})

const userDepartment = computed(() => {
  return localStorage.getItem('user_department') || '党委办公室'
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 通知图标映射
const getNotificationIcon = (type) => {
  const icons = {
    system: '🔔',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }
  return icons[type] || '🔔'
}

// 方法
const goHome = () => {
  router.push('/')
}

const refreshData = async () => {
  loading.value = true
  try {
    await dataStore.fetchStatistics()
    await dataStore.fetchMembers()
    lastUpdate.value = new Date()
    
    // 添加通知
    addNotification({
      type: 'success',
      title: '数据刷新完成',
      message: '所有数据已成功同步'
    })
  } catch (error) {
    console.error('刷新数据失败:', error)
    addNotification({
      type: 'error',
      title: '数据刷新失败',
      message: error.message || '请检查网络连接'
    })
  } finally {
    loading.value = false
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const addNotification = (notification) => {
  notifications.value.unshift({
    id: Date.now(),
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    time: new Date(),
    read: false
  })
  
  // 限制通知数量
  if (notifications.value.length > 50) {
    notifications.value = notifications.value.slice(0, 50)
  }
  
  // 保存到本地存储
  saveNotifications()
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  saveNotifications()
}

const handleNotificationClick = (notification) => {
  notification.read = true
  saveNotifications()
  
  // 根据通知类型处理点击
  switch (notification.type) {
    case 'warning':
    case 'error':
      // 跳转到错误日志页面
      router.push('/logs')
      break
    default:
      // 默认行为
      console.log('通知被点击:', notification)
  }
  
  showNotifications.value = false
}

const handleLogout = () => {
  // 清除用户信息
  localStorage.removeItem('user_name')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_department')
  
  // 跳转到登录页
  router.push('/login')
}

const saveNotifications = () => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
  } catch (error) {
    console.error('保存通知失败:', error)
  }
}

const loadNotifications = () => {
  try {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      notifications.value = JSON.parse(saved).map(n => ({
        ...n,
        time: new Date(n.time)
      }))
    }
  } catch (error) {
    console.error('加载通知失败:', error)
  }
}

// 模拟系统通知
const simulateSystemNotifications = () => {
  // 模拟一些系统通知
  const now = new Date()
  
  // 每小时检查一次数据同步
  const lastSync = localStorage.getItem('last_data_sync')
  if (!lastSync || (now - new Date(lastSync)) > 3600000) {
    addNotification({
      type: 'info',
      title: '数据同步提醒',
      message: '建议每小时同步一次数据以确保信息最新'
    })
  }
  
  // 如果有重要更新
  if (Math.random() > 0.7) {
    addNotification({
      type: 'system',
      title: '系统更新',
      message: '系统已更新到最新版本，修复了若干问题'
    })
  }
}

// 初始化
onMounted(() => {
  loadNotifications()
  simulateSystemNotifications()
  lastUpdate.value = new Date()
  
  // 每5分钟检查一次通知
  setInterval(simulateSystemNotifications, 300000)
})

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const navbar = document.querySelector('.navbar')
  if (navbar && !navbar.contains(event.target)) {
    showNotifications.value = false
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 原有的样式保持不变，添加以下新样式 */

.navbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 16px;
  font-size: 12px;
  color: #1890ff;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 16px;
  font-size: 12px;
  color: #52c41a;
}

.update-icon {
  font-size: 12px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #f0f0f0;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.action-btn:hover {
  border-color: #ffa39e;
  color: #c7000a;
  background: #fffafa;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn:disabled:hover {
  border-color: #f0f0f0;
  color: #595959;
  background: white;
}

.notification-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: bold;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.notifications-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.mark-read-btn {
  padding: 4px 8px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 11px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mark-read-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.unread {
  background: #fffafa;
  border-left: 3px solid #c7000a;
}

.notification-icon {
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 11px;
  color: #8c8c8c;
}

.empty-notifications {
  text-align: center;
  padding: 32px 16px;
  color: #bfbfbf;
  font-size: 13px;
}

.notifications-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  background: #fafafa;
}

.view-all-link {
  color: #1890ff;
  font-size: 12px;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.user-info {
  position: relative;
  cursor: pointer;
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow: hidden;
}

.user-info-card {
  padding: 20px;
  background: linear-gradient(135deg, #fffafa 0%, #fff 100%);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text-large {
  color: white;
  font-weight: bold;
  font-size: 24px;
}

.user-info-large {
  flex: 1;
  overflow: hidden;
}

.user-name-large {
  font-weight: 600;
  color: #262626;
  font-size: 16px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role-large {
  color: #c7000a;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.user-department {
  color: #8c8c8c;
  font-size: 12px;
}

.user-menu-items {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #262626;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
}

.menu-item:hover {
  background: #fafafa;
  color: #c7000a;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
}

.logout-btn {
  color: #ff4d4f;
}

.logout-btn:hover {
  background: #fff1f0;
}

.dropdown-mask {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1000;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
  border-top-color: #c7000a;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .user-details {
    display: none;
  }
  
  .notifications-dropdown {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 0;
  }
  
  .user-menu-dropdown {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 0;
  }
  
  .navbar-center {
    display: none;
  }
  
  .navbar-actions {
    margin-right: 8px;
  }
}
</style>