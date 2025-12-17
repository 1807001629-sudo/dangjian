<template>
  <div ref="chartRef" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '300px'
  },
  title: String,
  xAxis: {
    type: Array,
    default: () => []
  },
  color: {
    type: String,
    default: '#c7000a'
  },
  horizontal: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
let chartInstance = null;

const initChart = () => {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;
  
  // 准备数据
  let xAxisData, seriesData;
  
  if (props.horizontal) {
    // 横向柱状图：x轴是数值，y轴是标签
    xAxisData = props.xAxis || [];
    seriesData = props.data || [];
  } else {
    // 纵向柱状图：x轴是标签，y轴是数值
    xAxisData = props.xAxis || [];
    seriesData = props.data || [];
  }
  
  // 如果数据为空，显示空状态
  if (seriesData.length === 0) {
    seriesData = [0, 0, 0, 0, 0];
    xAxisData = ['无数据', '无数据', '无数据', '无数据', '无数据'];
  }
  
  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        color: '#262626',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0];
        const label = props.horizontal ? param.axisValue : param.name;
        return `${label}<br/>${param.seriesName}: ${param.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: props.title ? '20%' : '10%',
      containLabel: true
    },
    xAxis: {
      type: props.horizontal ? 'value' : 'category',
      data: props.horizontal ? undefined : xAxisData,
      axisLine: {
        lineStyle: {
          color: '#d9d9d9'
        }
      },
      axisLabel: {
        color: '#595959',
        rotate: props.horizontal ? 0 : 45
      }
    },
    yAxis: {
      type: props.horizontal ? 'category' : 'value',
      data: props.horizontal ? xAxisData : undefined,
      axisLine: {
        lineStyle: {
          color: '#d9d9d9'
        }
      },
      axisLabel: {
        color: '#595959'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: props.title || '数据',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: props.color,
          borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  };
  
  chartInstance.setOption(option);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

watch(() => props.data, updateChart, { deep: true });
</script>