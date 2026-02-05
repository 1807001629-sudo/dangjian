<!-- src/components/process/ProcessTimeline.vue -->
<template>
  <div class="process-timeline">
    <div v-if="loading" class="loading-state">
      正在加载时间线数据...
    </div>
    
    <div v-else-if="error" class="error-state">
      加载失败: {{ error }}
      <button @click="fetchMemberDetails" class="retry-btn">重试</button>
    </div>
    
    <div v-else-if="timelineStages.length === 0" class="empty-state">
      暂无时间线数据
    </div>
    
    <div v-else class="timeline-container">
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
            <div class="stage-description">{{ stage.description }}</div>
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
import { computed, ref, onMounted, watch } from 'vue'
import apiService from '@/services/apiService'
import { 
  formatDateStr, 
  getProcessStageText,
  getProcessStageNumber 
} from '@/services/dataTransformer'

const props = defineProps({
  memberId: {
    type: [String, Number],
    default: null
  },
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['stage-click', 'loading', 'error'])

const memberData = ref(props.member)
const loading = ref(false)
const error = ref(null)

// 获取成员详情
async function fetchMemberDetails() {
  if (!props.memberId || Object.keys(props.member).length > 0) return
  
  loading.value = true
  error.value = null
  emit('loading', true)
  
  try {
    const response = await apiService.getMemberById(props.memberId)
    memberData.value = response.data || response
    console.log('获取成员详情成功:', memberData.value)
  } catch (err) {
    console.error('获取成员详情失败:', err)
    error.value = err.message || '获取成员信息失败'
    emit('error', error.value)
  } finally {
    loading.value = false
    emit('loading', false)
  }
}

// 监听memberId变化
watch(() => props.memberId, (newId) => {
  if (newId && Object.keys(props.member).length === 0) {
    fetchMemberDetails()
  }
})

// 监听member变化
watch(() => props.member, (newMember) => {
  if (newMember && Object.keys(newMember).length > 0) {
    memberData.value = newMember
  }
})

// 初始化
onMounted(() => {
  if (props.memberId && Object.keys(props.member).length === 0) {
    fetchMemberDetails()
  }
})

// 计算时间线阶段
const timelineStages = computed(() => {
  const member = Object.keys(props.member).length > 0 ? props.member : memberData.value
  if (!member || Object.keys(member).length === 0) {
    return []
  }
  
  // 使用新的函数获取当前阶段
  const currentStage = getProcessStageText(member)
  const stageNumber = getProcessStageNumber(member)
  
  // 使用统一的日期格式化
  const formatTime = (time) => {
    if (!time) return null
    return formatDateStr(time)
  }
  
  const stages = [
    {
      id: 1,
      number: 1,
      title: '申请入党',
      time: formatTime(member.递交入党申请书),
      isCompleted: stageNumber >= 1, // 入党申请人及以上阶段
      isActive: currentStage === '入党申请人',
      isUpcoming: stageNumber === 0, // 未开始
      key: '递交入党申请书',
      isLast: false,
      description: '提交入党申请书'
    },
    {
      id: 2,
      number: 2,
      title: '入党积极分子',
      time: formatTime(member.积极分子时间),
      isCompleted: stageNumber >= 2, // 积极分子及以上阶段
      isActive: currentStage === '入党积极分子',
      isUpcoming: stageNumber === 1, // 刚刚提交申请
      key: '积极分子时间',
      isLast: false,
      description: '确定为入党积极分子'
    },
    {
      id: 3,
      number: 3,
      title: '发展对象',
      time: formatTime(member.确定为发展对象日期),
      isCompleted: stageNumber >= 3, // 发展对象及以上阶段
      isActive: currentStage === '确定为发展对象',
      isUpcoming: stageNumber === 2, // 积极分子阶段
      key: '确定为发展对象日期',
      isLast: false,
      description: '确定为发展对象'
    },
    {
      id: 4,
      number: 4,
      title: '预备党员',
      time: formatTime(member.支部大会),
      isCompleted: stageNumber >= 4, // 预备党员及以上阶段
      isActive: currentStage === '中共预备党员',
      isUpcoming: stageNumber === 3, // 发展对象阶段
      key: '支部大会',
      isLast: false,
      description: '支部大会通过，成为预备党员'
    },
    {
      id: 5,
      number: 5,
      title: '正式党员',
      time: formatTime(member.转正时间),
      isCompleted: stageNumber >= 5, // 正式党员
      isActive: currentStage === '中共党员',
      isUpcoming: stageNumber === 4, // 预备党员阶段
      isLast: true,
      key: '转正时间',
      description: '预备党员转正'
    }
  ]
  
  return stages
})

// 获取标记图标
const getMarkerIcon = (stage) => {
  if (stage.isCompleted) return '✓'
  if (stage.isActive) return '●'
  return stage.number
}

// 获取阶段状态文本
const getStageStatus = (stage) => {
  if (stage.isCompleted) return '已完成'
  if (stage.isActive) return '进行中'
  if (stage.isUpcoming) return '待开始'
  return '未开始'
}

// 格式化日期
const formatDate = (dateStr) => {
  const formatted = formatDateStr(dateStr)
  return formatted || dateStr || ''
}
</script>

<style scoped>
.process-timeline {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  min-height: 200px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.error-state {
  color: #ff4d4f;
}

.retry-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.retry-btn:hover {
  background: #ff7875;
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
  min-height: 140px;
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
  height: 40px;
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
  min-height: 120px;
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
  margin-bottom: 8px;
  line-height: 1.4;
  min-height: 20px;
}

.stage-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80px;
}

.stage-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
  line-height: 1.4;
  min-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.stage-description {
  font-size: 11px;
  color: #bfbfbf;
  margin-bottom: 8px;
  line-height: 1.4;
  min-height: 16px;
}

.stage-placeholder {
  height: 18px;
  visibility: hidden;
  margin-bottom: 4px;
}

.stage-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  line-height: 1.4;
  min-height: 20px;
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