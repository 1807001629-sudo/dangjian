// src/utils/chartUtils.js
/**
 * 图表工具函数 - 统一管理图表配置和样式
 */

// ECharts基础配置
export const chartBaseConfig = {
  // 文字样式
  textStyle: {
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif',
    fontSize: 12
  },
  
  // 颜色主题
  colorPalette: [
    '#c7000a', '#8a0000', '#ff4d4f', '#ffa39e', '#ffccc7',
    '#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff',
    '#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be',
    '#fa8c16', '#ffa940', '#ffc069', '#ffd591', '#ffe7ba',
    '#722ed1', '#9254de', '#b37feb', '#d3adf7', '#f9f0ff',
    '#eb2f96', '#f759ab', '#ff85c0', '#ffadd2', '#ffd6e7'
  ],
  
  // 网格配置
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '15%',
    containLabel: true
  },
  
  // 坐标轴配置
  axisLine: {
    lineStyle: {
      color: '#d9d9d9'
    }
  },
  
  // 分割线配置
  splitLine: {
    lineStyle: {
      color: '#f0f0f0',
      type: 'dashed'
    }
  },
  
  // 标签配置
  axisLabel: {
    color: '#595959',
    fontSize: 11
  },
  
  // 提示框配置
  tooltip: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: '#333',
    textStyle: {
      color: '#fff',
      fontSize: 12
    },
    extraCssText: 'box-shadow: 0 0 8px rgba(0,0,0,0.3);'
  }
};

// 获取颜色
export function getChartColor(index) {
  return chartBaseConfig.colorPalette[index % chartBaseConfig.colorPalette.length];
}

// 处理空数据
export function handleEmptyData(data, placeholder = '无数据') {
  if (!data || data.length === 0) {
    return {
      hasData: false,
      xAxisData: [placeholder, placeholder, placeholder, placeholder, placeholder],
      seriesData: [0, 0, 0, 0, 0]
    };
  }
  
  return {
    hasData: true,
    xAxisData: data.map(item => item.name || item.label || ''),
    seriesData: data.map(item => item.value || 0)
  };
}

// 格式化工具提示
export function formatTooltip(params, isHorizontal = false) {
  if (!params || params.length === 0) return '';
  
  const param = params[0];
  const label = isHorizontal ? param.axisValue : param.name;
  const value = param.value;
  const seriesName = param.seriesName || '数据';
  
  // 处理百分比数据
  if (param.data && param.data.percent) {
    return `${label}<br/>${seriesName}: ${value} (${param.data.percent})`;
  }
  
  return `${label}<br/>${seriesName}: ${value}`;
}

// 创建柱状图配置
export function createBarChartOption(options = {}) {
  const {
    title = '',
    xAxisData = [],
    seriesData = [],
    color = '#c7000a',
    horizontal = false,
    showGrid = true,
    showLabel = true
  } = options;
  
  const { hasData, xAxisData: processedXAxisData, seriesData: processedSeriesData } = 
    handleEmptyData(seriesData.length ? { data: seriesData } : null);
  
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: '#262626',
        fontSize: 14,
        fontWeight: '600'
      },
      padding: [10, 0, 20, 0]
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => formatTooltip(params, horizontal)
    },
    grid: showGrid ? {
      ...chartBaseConfig.grid,
      top: title ? '22%' : '12%'
    } : { left: '1%', right: '1%', top: '10%', bottom: '10%', containLabel: true },
    xAxis: {
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : (xAxisData.length ? xAxisData : processedXAxisData),
      axisLine: chartBaseConfig.axisLine,
      axisLabel: {
        ...chartBaseConfig.axisLabel,
        rotate: horizontal ? 0 : 45,
        interval: 0
      },
      splitLine: horizontal ? chartBaseConfig.splitLine : undefined
    },
    yAxis: {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? (xAxisData.length ? xAxisData : processedXAxisData) : undefined,
      axisLine: chartBaseConfig.axisLine,
      axisLabel: chartBaseConfig.axisLabel,
      splitLine: horizontal ? undefined : chartBaseConfig.splitLine
    },
    series: [
      {
        name: title || '数据',
        type: 'bar',
        data: xAxisData.length ? seriesData : processedSeriesData,
        itemStyle: {
          color: color,
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          opacity: hasData ? 1 : 0.3
        },
        barWidth: '60%',
        label: showLabel ? {
          show: true,
          position: horizontal ? 'right' : 'top',
          color: '#262626',
          fontSize: 11,
          formatter: '{c}'
        } : undefined,
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 10
          }
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
}

// 创建饼图配置
export function createPieChartOption(options = {}) {
  const {
    title = '',
    data = [],
    colors = chartBaseConfig.colorPalette,
    showLegend = true,
    showLabel = false,
    radius = ['40%', '70%']
  } = options;
  
  const { hasData, seriesData } = handleEmptyData(data);
  
  const processedData = hasData ? data.map((item, index) => ({
    ...item,
    name: item.name || item.label || `数据${index + 1}`,
    value: item.value || 0,
    itemStyle: {
      color: colors[index % colors.length],
      borderColor: '#fff',
      borderWidth: 2,
      borderRadius: 10
    }
  })) : [{ 
    name: '无数据', 
    value: 1,
    itemStyle: { 
      color: '#f0f0f0',
      borderColor: '#fff',
      borderWidth: 2
    }
  }];
  
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: '#262626',
        fontSize: 14,
        fontWeight: '600'
      },
      padding: [10, 0, 20, 0]
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: showLegend ? {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        color: '#595959',
        fontSize: 11
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 8
    } : undefined,
    series: [
      {
        name: title || '数据',
        type: 'pie',
        radius: radius,
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: showLabel,
          position: 'outside',
          formatter: '{b}: {d}%',
          fontSize: 11,
          color: '#595959'
        },
        labelLine: {
          show: showLabel,
          length: 10,
          length2: 15,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 10
          }
        },
        data: processedData
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
}

// 从API数据转换为图表数据
export function convertApiDataToChart(apiData, options = {}) {
  const {
    nameField = 'name',
    valueField = 'value',
    labelField = 'label',
    sort = false,
    limit = 0
  } = options;
  
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }
  
  let processedData = apiData.map(item => ({
    name: item[nameField] || item[labelField] || '',
    value: Number(item[valueField]) || 0,
    rawData: item
  }));
  
  // 排序
  if (sort) {
    processedData.sort((a, b) => b.value - a.value);
  }
  
  // 限制数量
  if (limit > 0 && processedData.length > limit) {
    const others = processedData.slice(limit);
    const othersSum = others.reduce((sum, item) => sum + item.value, 0);
    
    processedData = processedData.slice(0, limit);
    if (othersSum > 0) {
      processedData.push({
        name: '其他',
        value: othersSum,
        rawData: { isOthers: true, items: others }
      });
    }
  }
  
  return processedData;
}