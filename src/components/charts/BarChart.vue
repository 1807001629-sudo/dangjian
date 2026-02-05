<!-- src/components/charts/BarChart.vue -->
<template>
  <div class="bar-chart-container" :class="{ 'loading': loading, 'error': error }">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <p>加载图表中...</p>
    </div>
    
    <div v-else-if="error" class="chart-error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button v-if="retryable" @click="handleRetry" class="retry-btn">重试</button>
    </div>
    
    <div v-else class="chart-wrapper">
      <div ref="chartRef" :style="{ width, height }"></div>
      
      <div v-if="!hasData" class="no-data-tip">
        <div class="no-data-icon">📊</div>
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { createBarChartOption, convertApiDataToChart, handleEmptyData } from '@/utils/chartUtils';

const props = defineProps({
  // 数据源：可以是原始数据数组或API数据
  data: {
    type: [Array, Object],
    default: () => []
  },
  // 图表宽度
  width: {
    type: String,
    default: '100%'
  },
  // 图表高度
  height: {
    type: String,
    default: '300px'
  },
  // 图表标题
  title: String,
  // X轴数据（可选，如果不提供则从data提取）
  xAxis: {
    type: Array,
    default: () => []
  },
  // 颜色
  color: {
    type: String,
    default: '#c7000a'
  },
  // 是否为横向柱状图
  horizontal: {
    type: Boolean,
    default: false
  },
  // 是否显示网格
  showGrid: {
    type: Boolean,
    default: true
  },
  // 是否显示数据标签
  showLabel: {
    type: Boolean,
    default: true
  },
  // 是否显示图例
  showLegend: {
    type: Boolean,
    default: false
  },
  // 数据转换选项
  dataTransform: {
    type: Object,
    default: () => ({})
  },
  // 自动刷新间隔（毫秒），0表示不刷新
  refreshInterval: {
    type: Number,
    default: 0
  },
  // 是否可重试
  retryable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['chart-ready', 'chart-error', 'chart-click', 'retry']);

// 响应式数据
const chartRef = ref(null);
let chartInstance = null;
let refreshTimer = null;
const loading = ref(false);
const error = ref(null);

// 计算属性
const processedData = computed(() => {
  if (!props.data) return [];
  
  // 如果是API响应格式
  if (props.data.data && Array.isArray(props.data.data)) {
    return convertApiDataToChart(props.data.data, props.dataTransform);
  }
  
  // 如果是简单数组
  if (Array.isArray(props.data)) {
    return props.data;
  }
  
  return [];
});

const hasData = computed(() => {
  return processedData.value.length > 0 && 
         processedData.value.some(item => (item.value || 0) > 0);
});

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  try {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
    setupChartEvents();
    emit('chart-ready', chartInstance);
  } catch (err) {
    console.error('初始化图表失败:', err);
    error.value = '图表初始化失败';
    emit('chart-error', err);
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance) return;
  
  try {
    const chartData = processedData.value;
    const xAxisData = props.xAxis.length > 0 ? props.xAxis : 
                     chartData.map(item => item.name || item.label || '');
    const seriesData = chartData.map(item => item.value || 0);
    
    const option = createBarChartOption({
      title: props.title,
      xAxisData: xAxisData,
      seriesData: seriesData,
      color: props.color,
      horizontal: props.horizontal,
      showGrid: props.showGrid,
      showLabel: props.showLabel
    });
    
    // 添加图例
    if (props.showLegend) {
      option.legend = {
        show: true,
        top: 'bottom',
        textStyle: {
          color: '#595959',
          fontSize: 11
        }
      };
    }
    
    chartInstance.setOption(option, true);
    error.value = null;
  } catch (err) {
    console.error('更新图表失败:', err);
    error.value = '图表数据错误';
    emit('chart-error', err);
  }
};

// 设置图表事件
const setupChartEvents = () => {
  if (!chartInstance) return;
  
  chartInstance.off('click');
  chartInstance.on('click', (params) => {
    emit('chart-click', params);
  });
};

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    try {
      chartInstance.resize();
    } catch (err) {
      console.warn('图表重绘失败:', err);
    }
  }
};

// 处理重试
const handleRetry = () => {
  error.value = null;
  emit('retry');
  initChart();
};

// 设置自动刷新
const setupAutoRefresh = () => {
  clearAutoRefresh();
  
  if (props.refreshInterval > 0) {
    refreshTimer = setInterval(() => {
      updateChart();
    }, props.refreshInterval);
  }
};

// 清除自动刷新
const clearAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 生命周期
onMounted(() => {
  loading.value = true;
  
  // 延迟初始化，确保DOM已渲染
  setTimeout(() => {
    initChart();
    loading.value = false;
    setupAutoRefresh();
  }, 100);
  
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  clearAutoRefresh();
  window.removeEventListener('resize', handleResize);
  
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 监听数据变化
watch(() => props.data, () => {
  updateChart();
}, { deep: true });

// 监听属性变化
watch(() => [props.title, props.color, props.horizontal, props.showGrid, props.showLabel], () => {
  updateChart();
});

// 监听刷新间隔变化
watch(() => props.refreshInterval, () => {
  setupAutoRefresh();
});
</script>

<style scoped>
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c8c8c;
  font-size: 14px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #c7000a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #ff7875;
  transform: translateY(-1px);
}

.no-data-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #bfbfbf;
  font-size: 14px;
  pointer-events: none;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>