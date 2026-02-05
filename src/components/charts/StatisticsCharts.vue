<!-- src/components/charts/StatisticsCharts.vue -->
<template>
  <div class="statistics-charts">
    <div class="charts-header">
      <h3>党建数据统计</h3>
      <div class="charts-controls">
        <button @click="refreshAll" :disabled="refreshing" class="refresh-btn">
          <span v-if="refreshing" class="loading-spinner small"></span>
          <span v-else>🔄</span>
          {{ refreshing ? '刷新中...' : '刷新数据' }}
        </button>
        <select v-model="timeRange" class="time-select">
          <option value="all">全部时间</option>
          <option value="year">本年度</option>
          <option value="month">本月</option>
          <option value="week">本周</option>
        </select>
      </div>
    </div>
    
    <div class="charts-grid">
      <!-- 政治面貌分布 -->
      <div class="chart-card">
        <div class="chart-title">政治面貌分布</div>
        <PieChart
          :data="politicalStatusData"
          title=""
          :show-legend="true"
          :show-label="false"
          height="250px"
          @chart-click="handleChartClick"
        />
      </div>
      
      <!-- 入党阶段分布 -->
      <div class="chart-card">
        <div class="chart-title">入党阶段分布</div>
        <BarChart
          :data="processStageData"
          title=""
          :horizontal="true"
          color="#1890ff"
          height="250px"
          :show-label="true"
        />
      </div>
      
      <!-- 班级人数分布 -->
      <div class="chart-card full-width">
        <div class="chart-title">各班级人数分布</div>
        <BarChart
          :data="classDistributionData"
          title=""
          color="#52c41a"
          height="300px"
          :show-label="true"
          :data-transform="{ limit: 10 }"
        />
      </div>
      
      <!-- 活动时数统计 -->
      <div class="chart-card full-width">
        <div class="chart-title">活动时数统计</div>
        <div class="multi-charts">
          <div class="sub-chart">
            <div class="sub-title">时数分布</div>
            <PieChart
              :data="activityHoursDistribution"
              title=""
              :colors="activityColors"
              :show-legend="false"
              :show-label="true"
              height="200px"
              :radius="['50%', '70%']"
              :show-center-text="true"
              :center-text="activityCenterText"
            />
          </div>
          <div class="sub-chart">
            <div class="sub-title">各班平均时数</div>
            <BarChart
              :data="classAverageHours"
              title=""
              color="#fa8c16"
              height="200px"
              :horizontal="true"
              :show-label="true"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="charts-error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">重试加载</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import PieChart from './PieChart.vue';
import BarChart from './BarChart.vue';
import apiService from '@/services/apiService';

// 响应式数据
const politicalStatusData = ref([]);
const processStageData = ref([]);
const classDistributionData = ref([]);
const activityHoursDistribution = ref([]);
const classAverageHours = ref([]);
const timeRange = ref('all');
const refreshing = ref(false);
const error = ref(null);

// 计算属性
const activityColors = computed(() => ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be']);
const activityCenterText = computed(() => {
  const total = activityHoursDistribution.value.reduce((sum, item) => sum + (item.value || 0), 0);
  return `总计\n${total}人`;
});

// 加载数据
const loadData = async () => {
  refreshing.value = true;
  error.value = null;
  
  try {
    // 获取统计数据
    const statsResponse = await apiService.getStatistics();
    const stats = statsResponse.data || statsResponse;
    
    // 处理政治面貌数据
    if (stats.byPoliticalStatus) {
      politicalStatusData.value = Object.entries(stats.byPoliticalStatus).map(([name, value]) => ({
        name,
        value
      }));
    }
    
    // 处理入党阶段数据
    if (stats.byProcessStage) {
      processStageData.value = Object.entries(stats.byProcessStage).map(([name, value]) => ({
        name,
        value
      }));
    }
    
    // 获取成员数据用于更多统计
    const membersResponse = await apiService.getMembers({ 
      timeRange: timeRange.value 
    });
    const members = membersResponse.data || membersResponse;
    
    // 处理班级分布
    const classDistribution = {};
    const classHours = {};
    
    members.forEach(member => {
      // 班级统计
      const className = member.班级 || '未知班级';
      classDistribution[className] = (classDistribution[className] || 0) + 1;
      
      // 班级活动时数统计
      if (!classHours[className]) {
        classHours[className] = { total: 0, count: 0 };
      }
      const hours = parseFloat(member.活动时数) || 0;
      classHours[className].total += hours;
      classHours[className].count++;
    });
    
    // 班级人数分布
    classDistributionData.value = Object.entries(classDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15) // 只显示前15个班级
      .map(([name, value]) => ({ name, value }));
    
    // 各班平均时数
    classAverageHours.value = Object.entries(classHours)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        value: Math.round((data.total / data.count) * 10) / 10 // 保留一位小数
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    
    // 活动时数分布
    const hourRanges = [
      { range: '0小时', min: 0, max: 0 },
      { range: '1-10小时', min: 1, max: 10 },
      { range: '11-50小时', min: 11, max: 50 },
      { range: '51-100小时', min: 51, max: 100 },
      { range: '100+小时', min: 101, max: Infinity }
    ];
    
    const hourDistribution = hourRanges.map(range => ({
      name: range.range,
      value: 0
    }));
    
    members.forEach(member => {
      const hours = parseFloat(member.活动时数) || 0;
      const rangeIndex = hourRanges.findIndex(range => 
        hours >= range.min && hours <= range.max
      );
      if (rangeIndex >= 0) {
        hourDistribution[rangeIndex].value++;
      }
    });
    
    activityHoursDistribution.value = hourDistribution.filter(item => item.value > 0);
    
  } catch (err) {
    console.error('加载统计数据失败:', err);
    error.value = '加载统计数据失败，请重试';
    
    // 使用模拟数据作为回退
    loadMockData();
  } finally {
    refreshing.value = false;
  }
};

// 加载模拟数据（API失败时使用）
const loadMockData = () => {
  politicalStatusData.value = [
    { name: '中共党员', value: 45 },
    { name: '中共预备党员', value: 23 },
    { name: '共青团员', value: 186 },
    { name: '群众', value: 45 }
  ];
  
  processStageData.value = [
    { name: '入党申请人', value: 126 },
    { name: '入党积极分子', value: 109 },
    { name: '中共预备党员', value: 12 },
    { name: '中共党员', value: 45 }
  ];
  
  classDistributionData.value = [
    { name: '大数据221班', value: 32 },
    { name: '大数据222班', value: 30 },
    { name: '高分子221班', value: 28 },
    { name: '高分子222班', value: 26 },
    { name: '计科221班', value: 25 }
  ];
  
  activityHoursDistribution.value = [
    { name: '0小时', value: 45 },
    { name: '1-10小时', value: 86 },
    { name: '11-50小时', value: 123 },
    { name: '51-100小时', value: 67 },
    { name: '100+小时', value: 23 }
  ];
  
  classAverageHours.value = [
    { name: '大数据221班', value: 45.5 },
    { name: '高分子222班', value: 38.2 },
    { name: '计科221班', value: 32.7 },
    { name: '大数据222班', value: 29.8 },
    { name: '高分子221班', value: 26.4 }
  ];
};

// 刷新所有图表
const refreshAll = async () => {
  await loadData();
};

// 处理图表点击事件
const handleChartClick = (params) => {
  console.log('图表被点击:', params);
  // 这里可以添加点击后的处理逻辑，比如跳转到详情页
};

// 初始化
onMounted(() => {
  loadData();
});

// 监听时间范围变化
watch(timeRange, () => {
  loadData();
});
</script>

<style scoped>
.statistics-charts {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.charts-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.charts-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner.small {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
  border-top-color: #1890ff;
}

.time-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #262626;
  background: white;
  cursor: pointer;
  min-width: 100px;
}

.time-select:focus {
  outline: none;
  border-color: #1890ff;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  text-align: center;
}

.multi-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 12px;
}

.sub-chart {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #f0f0f0;
}

.sub-title {
  font-size: 13px;
  font-weight: 500;
  color: #595959;
  margin-bottom: 8px;
  text-align: center;
}

.charts-error {
  text-align: center;
  padding: 40px 20px;
  color: #ff4d4f;
}

.charts-error .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.charts-error p {
  margin-bottom: 16px;
  font-size: 14px;
}

.charts-error .retry-btn {
  padding: 8px 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.charts-error .retry-btn:hover {
  background: #ff7875;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .multi-charts {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .charts-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .charts-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .refresh-btn,
  .time-select {
    width: 100%;
  }
}
</style>