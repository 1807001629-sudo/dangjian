<!-- src/components/process/StageProgress.vue -->
<template>
  <div class="stage-progress">
    <div class="progress-header">
      <h4>入党阶段进度</h4>
      <div class="progress-percentage">{{ progressPercentage }}%</div>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill"
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>
    
    <div class="stages-list">
      <div 
        v-for="stage in stages" 
        :key="stage.id"
        class="stage-item"
        :class="{ 
          'completed': stage.completed, 
          'current': stage.current,
          'pending': stage.pending
        }"
      >
        <div class="stage-check">
          {{ stage.completed ? '✓' : '○' }}
        </div>
        <div class="stage-info">
          <div class="stage-name">{{ stage.name }}</div>
          <div class="stage-desc">{{ stage.description }}</div>
          <div v-if="stage.time" class="stage-time">{{ formatDate(stage.time) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- src/components/process/StageProgress.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    default: () => ({})
  }
})

const stages = computed(() => {
  const member = props.member || {}
  const currentStage = member.processStage || '未开始'
  
  const allStages = [
    {
      id: 1,
      name: '入团',
      description: '加入共青团',
      completed: !!member.入团时间,
      current: false,
      pending: !member.入团时间 && currentStage !== '未开始',
      time: member.入团时间
    },
    {
      id: 2,
      name: '申请入党',
      description: '提交入党申请书',
      completed: ['入党申请人', '入党积极分子', '中共预备党员', '中共党员'].includes(currentStage),
      current: currentStage === '入党申请人',
      pending: currentStage === '未开始',
      time: member.申请入党时间
    },
    {
      id: 3,
      name: '600题考试',
      description: '完成党的知识考试',
      completed: member['600题考试成绩'] > 0 || ['入党积极分子', '中共预备党员', '中共党员'].includes(currentStage),
      current: false,
      pending: currentStage === '入党申请人',
      time: member['600题考试时间']
    },
    {
      id: 4,
      name: '入党积极分子',
      description: '党支部确定积极分子',
      completed: !!member['党支部接收入党积极分子时间'] || ['中共预备党员', '中共党员'].includes(currentStage),
      current: currentStage === '入党积极分子',
      pending: ['未开始', '入党申请人'].includes(currentStage),
      time: member['党支部接收入党积极分子时间']
    },
    {
      id: 5,
      name: '预备党员',
      description: '预备党员考察期',
      completed: currentStage === '中共党员',
      current: currentStage === '中共预备党员',
      pending: ['未开始', '入党申请人', '入党积极分子'].includes(currentStage),
      time: null
    },
    {
      id: 6,
      name: '中共党员',
      description: '转为正式党员',
      completed: currentStage === '中共党员',
      current: currentStage === '中共党员',
      pending: !(currentStage === '中共党员'),
      time: null
    }
  ]
  
  return allStages
})

const progressPercentage = computed(() => {
  const completedStages = stages.value.filter(stage => stage.completed).length
  const totalStages = stages.value.length
  return Math.round((completedStages / totalStages) * 100)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  
  // 如果已经是格式化好的 YYYY/MM/DD 格式，直接返回
  if (typeof dateStr === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  try {
    // 尝试解析日期
    let date
    if (typeof dateStr === 'string') {
      // 尝试解析 YYYY/MM/DD
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('/')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } 
      // 尝试解析 YYYY-MM-DD
      else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr)
      }
      // 尝试解析数字格式 YYYYMMDD
      else if (/^\d{8}$/.test(dateStr)) {
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
    }
    
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/')
    }
    
    return dateStr
  } catch (e) {
    return dateStr
  }
}
</script>

<style scoped>
.stage-progress {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  margin-top: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
  color: #52c41a;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 24px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stage-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.stage-item:hover {
  background: #fafafa;
}

.stage-item.completed {
  opacity: 0.9;
}

.stage-item.current {
  background: #fff7e6;
  border: 1px solid #ffe7ba;
}

.stage-item.pending {
  opacity: 0.5;
}

.stage-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  background: #f0f0f0;
  color: #8c8c8c;
}

.stage-item.completed .stage-check {
  background: #52c41a;
  color: white;
}

.stage-item.current .stage-check {
  background: #faad14;
  color: white;
  animation: pulse 2s infinite;
}

.stage-item.pending .stage-check {
  background: #f0f0f0;
  color: #8c8c8c;
}

.stage-info {
  flex: 1;
}

.stage-name {
  font-weight: 600;
  font-size: 14px;
  color: #262626;
  margin-bottom: 2px;
}

.stage-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.stage-time {
  font-size: 11px;
  color: #bfbfbf;
  font-style: italic;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .stage-item {
    flex-direction: column;
    gap: 8px;
  }
}
</style>