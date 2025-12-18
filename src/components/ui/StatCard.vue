<!-- src/components/ui/StatCard.vue -->
<template>
  <BaseCard class="stat-card" :hoverable="true">
    <div class="stat-content">
      <div class="stat-icon" :style="{ backgroundColor: color }">
        <span>{{ icon }}</span>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ formattedValue }}</div>
        <div class="stat-title">{{ title }}</div>
        <div v-if="description" class="stat-description">{{ description }}</div>
      </div>
      <div v-if="trend !== undefined" class="stat-trend" :class="trendClass">
        <span class="trend-icon">{{ trendIcon }}</span>
        <span class="trend-value">{{ trend }}%</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📊'
  },
  color: {
    type: String,
    default: '#1890ff'
  },
  description: String,
  trend: Number, // 趋势百分比，如 10.5 表示增长10.5%
  trendDirection: {
    type: String,
    default: 'neutral', // 'up' | 'down' | 'neutral'
    validator: (value) => ['up', 'down', 'neutral'].includes(value)
  }
})

const formattedValue = computed(() => {
  const numValue = Number(props.value)
  if (!isNaN(numValue) && numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'k' + (props.unit ? ' ' + props.unit : '')
  }
  return props.value + (props.unit ? ' ' + props.unit : '')
})

const trendClass = computed(() => {
  return {
    up: 'trend-up',
    down: 'trend-down',
    neutral: 'trend-neutral'
  }[props.trendDirection]
})

const trendIcon = computed(() => {
  return {
    up: '↗',
    down: '↘',
    neutral: '→'
  }[props.trendDirection]
})
</script>

<style scoped>
.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-title {
  font-size: 14px;
  color: #595959;
  margin-bottom: 4px;
}

.stat-description {
  font-size: 12px;
  color: #8c8c8c;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(139, 195, 74, 0.1);
  flex-shrink: 0;
}

.trend-up {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.trend-down {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.trend-neutral {
  color: #8c8c8c;
  background: rgba(140, 140, 140, 0.1);
}

.trend-icon {
  font-weight: bold;
}
</style>