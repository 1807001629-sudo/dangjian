<!-- src/components/process/ProcessTimeline.vue -->
<template>
  <div class="process-timeline">
    <div class="timeline-container">
      <div 
        v-for="stage in timelineStages" 
        :key="stage.id"
        class="timeline-stage"
        :class="{ 
          'active': stage.isActive, 
          'completed': stage.isCompleted,
          'upcoming': stage.isUpcoming,
          'has-time': stage.time
        }"
        @click="$emit('stage-click', stage)"
      >
        <div class="stage-marker">
          <div class="marker-icon">
            {{ getMarkerIcon(stage) }}
          </div>
          <div class="marker-line" v-if="!stage.isLast"></div>
        </div>
        <div class="stage-content-wrapper">
          <div class="stage-title">{{ stage.title }}</div>
          <div class="stage-content">
            <div class="stage-time" v-if="stage.time">{{ formatDate(stage.time) }}</div>
            <div class="stage-placeholder" v-else></div>
            <div class="stage-score" v-if="stage.score !== undefined && stage.score > 0">
              成绩: {{ stage.score }}
            </div>
            <div class="stage-status">
              {{ getStageStatus(stage) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['stage-click'])

const timelineStages = computed(() => {
  const member = props.member || {}
  const currentStage = member.processStage || '未开始'
  
  const stages = [
    {
      id: 1,
      number: 1,
      title: '入团',
      time: member.入团时间 || null,
      // 仅在有入团时间时才显示完成
      isCompleted: !!member.入团时间,
      isActive: false,
      isUpcoming: !member.入团时间 && currentStage !== '未开始',
      key: '入团时间',
      isLast: false
    },
    {
      id: 2,
      number: 2,
      title: '申请入党',
      time: member.申请入党时间 || null,
      // 如果已经是积极分子及以上阶段，默认申请入党已完成
      isCompleted: ['入党申请人', '入党积极分子', '中共预备党员', '中共党员'].includes(currentStage),
      isActive: currentStage === '入党申请人',
      isUpcoming: currentStage === '未开始',
      key: '申请入党时间',
      isLast: false
    },
    {
      id: 3,
      number: 3,
      title: '600题考试',
      time: member['600题考试时间'] || null,
      score: member['600题考试成绩'] || null,
      // 如果已经是积极分子及以上阶段，默认600题考试已完成
      isCompleted: member['600题考试成绩'] > 0 || ['入党积极分子', '中共预备党员', '中共党员'].includes(currentStage),
      isActive: false,
      isUpcoming: currentStage === '入党申请人',
      key: '600题考试',
      isLast: false
    },
    {
      id: 4,
      number: 4,
      title: '入党积极分子',
      time: member['党支部接收入党积极分子时间'] || null,
      // 如果已经是预备党员或党员，默认积极分子阶段已完成
      isCompleted: !!member['党支部接收入党积极分子时间'] || ['中共预备党员', '中共党员'].includes(currentStage),
      isActive: currentStage === '入党积极分子',
      isUpcoming: ['入党申请人', '未开始'].includes(currentStage),
      key: '入党积极分子',
      isLast: false
    },
    {
      id: 5,
      number: 5,
      title: '预备党员',
      time: null,
      // 如果是党员，默认预备党员已完成
      isCompleted: currentStage === '中共党员',
      isActive: currentStage === '中共预备党员',
      isUpcoming: ['未开始', '入党申请人', '入党积极分子'].includes(currentStage),
      key: '中共预备党员',
      isLast: false
    },
    {
      id: 6,
      number: 6,
      title: '正式党员',
      time: null,
      isCompleted: currentStage === '中共党员',
      isActive: currentStage === '中共党员',
      isUpcoming: !(currentStage === '中共党员'),
      isLast: true,
      key: '中共党员'
    }
  ]
  
  return stages
})

const getMarkerIcon = (stage) => {
  if (stage.isCompleted) return '✓'
  if (stage.isActive) return '●'
  return stage.number
}

const getStageStatus = (stage) => {
  if (stage.isCompleted) return '已完成'
  if (stage.isActive) return '进行中'
  if (stage.isUpcoming) return '待开始'
  return '未开始'
}

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
.process-timeline {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.timeline-container {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
  position: relative;
  cursor: pointer;
  min-height: 140px; /* 固定最小高度 */
}

.timeline-stage:hover .stage-content-wrapper {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stage-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  width: 100%;
  height: 40px; /* 固定标记区域高度 */
}

.marker-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
  z-index: 2;
  position: relative;
  background: #bfbfbf;
  flex-shrink: 0;
}

.marker-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #f0f0f0;
  z-index: 1;
}

.timeline-stage.completed .marker-icon {
  background: #52c41a;
}

.timeline-stage.active .marker-icon {
  background: #faad14;
  animation: pulse 2s infinite;
}

.timeline-stage.completed .marker-line {
  background: #52c41a;
}

.timeline-stage:last-child .marker-line {
  display: none;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.stage-content-wrapper {
  text-align: center;
  padding: 16px 12px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  width: 100%;
  min-height: 100px; /* 固定内容区域最小高度 */
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
}

.timeline-stage.active .stage-content-wrapper {
  border-color: #faad14;
  background: #fff7e6;
}

.timeline-stage.completed .stage-content-wrapper {
  border-color: #b7eb8f;
  background: #f6ffed;
}

.stage-title {
  font-weight: 600;
  font-size: 14px;
  color: #262626;
  margin-bottom: 12px;
  line-height: 1.4;
  min-height: 20px; /* 固定标题高度 */
}

.stage-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 60px; /* 固定内容区域高度 */
}

.stage-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 6px;
  line-height: 1.4;
  min-height: 18px; /* 固定时间区域高度 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.stage-placeholder {
  height: 18px; /* 占位符，保持与有时间时相同的高度 */
  visibility: hidden; /* 隐藏但占据空间 */
  margin-bottom: 6px;
}

.stage-score {
  font-size: 12px;
  font-weight: 500;
  color: #1890ff;
  margin-bottom: 6px;
  line-height: 1.4;
  min-height: 18px; /* 固定成绩区域高度 */
}

.stage-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  line-height: 1.4;
  min-height: 20px; /* 固定状态区域高度 */
  align-self: center;
  margin-top: auto;
}

.timeline-stage.active .stage-status {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.timeline-stage.upcoming .stage-status {
  background: rgba(191, 191, 191, 0.1);
  color: #8c8c8c;
}

/* 确保所有阶段对齐 */
.timeline-stage:first-child {
  align-items: flex-start;
}

.timeline-stage:last-child {
  align-items: flex-end;
}

.timeline-stage:first-child .stage-content-wrapper,
.timeline-stage:last-child .stage-content-wrapper {
  text-align: center;
}

@media (max-width: 768px) {
  .timeline-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .timeline-stage {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    min-height: auto;
    padding: 0;
  }
  
  .stage-marker {
    flex-direction: row;
    margin-right: 16px;
    margin-bottom: 0;
    width: auto;
    height: auto;
  }
  
  .marker-line {
    top: 50%;
    left: 16px;
    width: 2px;
    height: 100%;
  }
  
  .stage-content-wrapper {
    text-align: left;
    flex: 1;
    min-height: auto;
    padding: 12px;
  }
  
  .stage-title {
    margin-bottom: 8px;
  }
  
  .stage-content {
    min-height: auto;
  }
}
</style>