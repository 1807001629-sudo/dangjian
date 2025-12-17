<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <h3 v-if="!collapsed" class="sidebar-title">导航菜单</h3>
      <button class="collapse-btn" @click="toggleCollapse">
        {{ collapsed ? '→' : '←' }}
      </button>
    </div>
    <div class="sidebar-menu">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        active-class="active"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span v-if="!collapsed" class="menu-text">{{ item.name }}</span>
      </router-link>
    </div>
    <div class="sidebar-footer">
      <div class="system-info">
        <div v-if="!collapsed" class="info-item">
          <span class="info-label">数据总数:</span>
          <span class="info-value">{{ totalCount }}</span>
        </div>
        <div class="info-date">{{ currentDate }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  }
});

const router = useRouter();
const collapsed = ref(false);

// 只显示已创建页面的菜单项
// 只显示已创建页面的菜单项
const menuItems = [
  { name: '数据看板', path: '/', icon: '📊' },
  { name: '人员管理', path: '/members', icon: '👥' },
  { name: '流程跟踪', path: '/process', icon: '📈' },
  { name: '活动管理', path: '/activities', icon: '🎯' },
  { name: '数据分析', path: '/analytics', icon: '📊' }
];

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
});

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};
</script>

<style scoped>
/* 样式保持不变 */
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  position: fixed;
  top: 64px;
  left: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 999;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  white-space: nowrap;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #f0f0f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #595959;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  border-color: #ffa39e;
  color: #c7000a;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #595959;
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 4px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

.menu-item:hover {
  background: #fffafa;
  color: #c7000a;
}

.menu-item.active {
  background: #fff1f0;
  color: #c7000a;
  font-weight: 500;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.system-info {
  font-size: 12px;
  color: #8c8c8c;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-label {
  color: #595959;
}

.info-value {
  font-weight: 600;
  color: #c7000a;
}

.info-date {
  text-align: center;
  color: #bfbfbf;
  margin-top: 12px;
  font-size: 11px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 60px;
  }
}
</style>