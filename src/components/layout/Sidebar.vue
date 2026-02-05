<!-- src/components/layout/Sidebar.vue -->
<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <h3 v-if="!collapsed" class="sidebar-title">导航菜单</h3>
      <button class="collapse-btn" @click="toggleCollapse">
        {{ collapsed ? '→' : '←' }}
      </button>
    </div>
    
    <div class="sidebar-search" v-if="!collapsed && showSearch">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索成员..."
          class="search-input"
          @input="handleSearch"
          @focus="showSearchResults = true"
        />
        <span class="search-icon">🔍</span>
        
        <!-- 搜索结果下拉 -->
        <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
          <div class="search-results-header">
            <span>搜索结果 ({{ searchResults.length }})</span>
            <button class="clear-search" @click="clearSearch">清除</button>
          </div>
          <div class="search-results-list">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="search-result-item"
              @click="handleSearchResultClick(result)"
            >
              <div class="result-avatar" :style="{ background: getAvatarColor(result.姓名) }">
                {{ getInitials(result.姓名) }}
              </div>
              <div class="result-info">
                <div class="result-name">{{ result.姓名 }}</div>
                <div class="result-details">{{ result.学号 }} · {{ result.班级 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <nav class="sidebar-menu">
      <!-- 主菜单 -->
      <div class="menu-section" v-if="!collapsed">
        <div class="section-label">主要功能</div>
      </div>
      
      <div 
        v-for="item in mainMenuItems"
        :key="item.path"
        class="menu-item"
        :class="{ 
          active: isActive(item.path),
          'has-notification': item.notificationCount > 0
        }"
        @click="handleMenuClick(item)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span v-if="!collapsed" class="menu-text">{{ item.name }}</span>
        <span v-if="!collapsed && item.notificationCount > 0" class="notification-count">
          {{ item.notificationCount }}
        </span>
        <span v-if="!collapsed && item.isNew" class="new-badge">NEW</span>
      </div>
      
      <!-- 统计菜单 -->
      <div class="menu-section" v-if="!collapsed && statsMenuItems.length > 0">
        <div class="section-label">数据统计</div>
      </div>
      
      <div 
        v-for="item in statsMenuItems"
        :key="item.path"
        class="menu-item stats-item"
        :class="{ active: isActive(item.path) }"
        @click="handleMenuClick(item)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span v-if="!collapsed" class="menu-text">{{ item.name }}</span>
        <span v-if="!collapsed && item.count !== undefined" class="stats-count">
          {{ formatCount(item.count) }}
        </span>
      </div>
      
      <!-- 快捷操作 -->
      <div class="menu-section" v-if="!collapsed && quickActions.length > 0">
        <div class="section-label">快捷操作</div>
      </div>
      
      <div 
        v-for="action in quickActions"
        :key="action.id"
        class="menu-item quick-action"
        @click="handleQuickAction(action)"
      >
        <span class="menu-icon">{{ action.icon }}</span>
        <span v-if="!collapsed" class="menu-text">{{ action.name }}</span>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="system-info">
        <div v-if="!collapsed" class="info-item">
          <span class="info-label">数据总数:</span>
          <span class="info-value">{{ formatCount(totalCount) }}</span>
        </div>
        <div v-if="!collapsed && dataStore.loading" class="data-loading">
          <div class="loading-dot"></div>
          <span>同步数据中...</span>
        </div>
        <div class="info-date">{{ currentDate }}</div>
        <div class="info-time">{{ currentTime }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { getInitials, getAvatarColor } from '@/utils/memberUtils'

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle', 'search'])

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

// 响应式数据
const collapsed = ref(false)
const searchQuery = ref('')
const showSearchResults = ref(false)
const searchResults = ref([])
const searchTimeout = ref(null)

// 计算属性
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
})

const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

const showSearch = computed(() => {
  return route.path === '/members' || route.path === '/process'
})

const mainMenuItems = computed(() => {
  return [
    { 
      name: '人员管理', 
      path: '/members', 
      icon: '👥',
      notificationCount: dataStore.newMembersCount || 0
    },
    { 
      name: '流程跟踪', 
      path: '/process', 
      icon: '📈',
      notificationCount: dataStore.pendingProcessCount || 0
    },
    { 
      name: '活动管理', 
      path: '/activities', 
      icon: '🎯',
      notificationCount: dataStore.upcomingActivitiesCount || 0
    },
    { 
      name: '数据统计', 
      path: '/statistics', 
      icon: '📊',
      isNew: true
    }
  ]
})

const statsMenuItems = computed(() => {
  const stats = dataStore.statistics
  if (!stats) return []
  
  return [
    { 
      name: '中共党员', 
      path: '/members?politicalStatus=中共党员', 
      icon: '⭐',
      count: stats.partyMembers || 0
    },
    { 
      name: '积极分子', 
      path: '/members?politicalStatus=入党积极分子', 
      icon: '🌱',
      count: stats.activists || 0
    },
    { 
      name: '共青团员', 
      path: '/members?politicalStatus=共青团员', 
      icon: '👥',
      count: stats.leagueMembers || 0
    }
  ]
})

const quickActions = computed(() => {
  return [
    {
      id: 'refresh',
      name: '刷新数据',
      icon: '🔄',
      handler: () => refreshData()
    },
    {
      id: 'export',
      name: '导出数据',
      icon: '📤',
      handler: () => exportData()
    },
    {
      id: 'add-member',
      name: '添加成员',
      icon: '➕',
      handler: () => addNewMember()
    },
    {
      id: 'query-activists',
      name: '积极分子查询',
      icon: '🔍',
      handler: () => queryActivists()
    }
  ]
})

// 方法
const isActive = (path) => {
  return route.path === path
}

const handleMenuClick = (item) => {
  if (route.path !== item.path) {
    router.push(item.path)
      .then(() => {
        console.log('路由跳转成功:', item.path)
      })
      .catch((error) => {
        console.error('路由跳转失败:', error)
      })
  }
  
  // 收起搜索下拉
  showSearchResults.value = false
}

const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  searchTimeout.value = setTimeout(async () => {
    try {
      const query = searchQuery.value.toLowerCase()
      
      // 从store获取成员数据
      const members = dataStore.members
      
      // 本地搜索
      const results = members.filter(member => {
        return (
          (member.姓名 && member.姓名.toLowerCase().includes(query)) ||
          (member.学号 && member.学号.toString().toLowerCase().includes(query)) ||
          (member.班级 && member.班级.toLowerCase().includes(query))
        )
      }).slice(0, 10) // 限制结果数量
      
      searchResults.value = results
      emit('search', { query, results })
      
    } catch (error) {
      console.error('搜索失败:', error)
      searchResults.value = []
    }
  }, 300)
}

const handleSearchResultClick = (member) => {
  // 跳转到成员详情页
  router.push(`/members/${member.id || member.学号}`)
  
  // 清空搜索
  clearSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

const handleQuickAction = (action) => {
  if (action.handler) {
    action.handler()
  }
}

const refreshData = async () => {
  try {
    await dataStore.fetchStatistics()
    await dataStore.fetchMembers()
    console.log('数据刷新完成')
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

const exportData = () => {
  console.log('导出数据')
  // 这里可以触发导出功能
}

const addNewMember = () => {
  console.log('添加新成员')
  router.push('/members/new')
}

const queryActivists = () => {
  console.log('积极分子查询')
  // 这里可以打开积极分子查询弹窗
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('toggle', collapsed.value)
}

const formatCount = (count) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 点击外部关闭搜索结果
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSearchResults.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载统计数据
  dataStore.fetchStatistics()
  
  // 监听点击外部事件
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// 监听路由变化，关闭搜索结果
watch(() => route.path, () => {
  showSearchResults.value = false
})

// 暴露方法以便调试
defineExpose({
  collapsed,
  mainMenuItems,
  handleMenuClick
})
</script>

<style scoped>
/* 原有的样式保持不变，添加以下新样式 */

.sidebar-search {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: #262626;
  background: #fafafa;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #c7000a;
  background: white;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
  font-size: 14px;
}

.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  font-size: 11px;
  color: #595959;
}

.clear-search {
  padding: 2px 6px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  font-size: 10px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.search-results-list {
  padding: 4px 0;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-result-item:hover {
  background: #fafafa;
}

.result-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  font-size: 13px;
  color: #262626;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-details {
  font-size: 11px;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-section {
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 0 16px;
}

.section-label {
  font-size: 11px;
  color: #8c8c8c;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-item.has-notification {
  position: relative;
}

.notification-count {
  position: absolute;
  right: 16px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: bold;
}

.new-badge {
  position: absolute;
  right: 16px;
  background: #52c41a;
  color: white;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: bold;
}

.menu-item.stats-item .menu-text {
  flex: 1;
}

.stats-count {
  font-size: 12px;
  font-weight: 600;
  color: #c7000a;
  background: rgba(199, 0, 10, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
}

.menu-item.quick-action {
  color: #1890ff;
}

.menu-item.quick-action:hover {
  background: #e6f7ff;
}

.data-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: #1890ff;
  font-size: 11px;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background: #1890ff;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.info-time {
  text-align: center;
  color: #bfbfbf;
  font-size: 11px;
  margin-top: 4px;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 60px;
  }
  
  .search-results {
    position: fixed;
    top: 128px;
    left: 16px;
    right: 16px;
    max-height: 50vh;
  }
}
</style>