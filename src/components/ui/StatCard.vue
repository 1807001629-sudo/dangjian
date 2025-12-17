<template>
  <BaseCard class="stat-card" :hoverable="false">
    <template #header>
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <div v-if="trend !== undefined" class="stat-trend" :class="trendClass">
          <span class="trend-icon">{{ trendIcon }}</span>
          <span class="trend-value">{{ trend }}%</span>
        </div>
      </div>
    </template>
    <div class="stat-content">
      <div class="stat-value">{{ formattedValue }}</div>
      <div v-if="description" class="stat-description">{{ description }}</div>
      <div v-if="$slots.default" class="stat-chart">
        <slot></slot>
      </div>
    </div>
  </BaseCard>
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

const emit = defineEmits(['toggle']); // 添加事件发射

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
  emit('toggle', collapsed.value); // 发射状态变化
};
</script>

<style scoped>
.stat-card {
  height: 100%;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stat-title {
  font-size: 14px;
  color: #595959;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-up {
  color: #52c41a;
}

.trend-down {
  color: #ff4d4f;
}

.trend-neutral {
  color: #8c8c8c;
}

.trend-icon {
  font-weight: bold;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #c7000a;
  margin: 8px 0;
  line-height: 1.2;
}

.stat-description {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}

.stat-chart {
  margin-top: 16px;
}
</style>