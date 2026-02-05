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
    
    <div v-if="loading" class="loading-state">
      正在加载进度数据...
    </div>
    
    <div v-else-if="error" class="error-state">
      加载失败: {{ error }}
      <button @click="fetchMemberDetails" class="retry-btn">重试</button>
    </div>
    
    <div v-else-if="stages.length === 0" class="empty-state">
      暂无进度数据
    </div>
    
    <div v-else class="stages-list">
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

const memberData = ref(props.member)
const loading = ref(false)
const error = ref(null)

// 获取成员详情
async function fetchMemberDetails() {
  if (!props.memberId || Object.keys(props.member).length > 0) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await apiService.getMemberById(props.memberId)
    memberData.value = response.data || response
    console.log('获取成员进度详情成功:', memberData.value)
  } catch (err) {
    console.error('获取成员进度详情失败:', err)
    error.value = err.message || '获取成员进度信息失败'
  } finally {
    loading.value = false
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

// 计算阶段列表
const stages = computed(() => {
  const member = Object.keys(props.member).length > 0 ? props.member : memberData.value
  if (!member || Object.keys(member).length === 0) {
    return []
  }
  
  const currentStage = getProcessStageText(member)
  const stageNumber = getProcessStageNumber(member)
  
  // 使用统一的日期格式化
  const formatTime = (time) => {
    if (!time) return null
    return formatDateStr(time)
  }
  
  const allStages = [
    {
      id: 1,
      name: '申请入党',
      description: '提交入党申请书',
      completed: stageNumber >= 1,
      current: currentStage === '入党申请人',
      pending: stageNumber === 0,
      time: formatTime(member.递交入党申请书)
    },
    {
      id: 2,
      name: '入党积极分子',
      description: '确定为入党积极分子',
      completed: stageNumber >= 2,
      current: currentStage === '入党积极分子',
      pending: stageNumber === 1,
      time: formatTime(member.积极分子时间)
    },
    {
      id: 3,
      name: '发展对象',
      description: '确定为发展对象',
      completed: stageNumber >= 3,
      current: currentStage === '确定为发展对象',
      pending: stageNumber === 2,
      time: formatTime(member.确定为发展对象日期)
    },
    {
      id: 4,
      name: '预备党员',
      description: '支部大会通过，成为预备党员',
      completed: stageNumber >= 4,
      current: currentStage === '中共预备党员',
      pending: stageNumber === 3,
      time: formatTime(member.支部大会)
    },
    {
      id: 5,
      name: '正式党员',
      description: '预备党员转正',
      completed: stageNumber >= 5,
      current: currentStage === '中共党员',
      pending: stageNumber === 4,
      time: formatTime(member.转正时间)
    }
  ]
  
  return allStages
})

// 计算进度百分比
const progressPercentage = computed(() => {
  if (loading.value || error.value || stages.value.length === 0) {
    return 0
  }
  
  const completedStages = stages.value.filter(stage => stage.completed).length
  const totalStages = stages.value.length
  return Math.round((completedStages / totalStages) * 100)
})

// 格式化日期
const formatDate = (dateStr) => {
  const formatted = formatDateStr(dateStr)
  return formatted || dateStr || ''
}
</script>

<style scoped>
.stage-progress {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  margin-top: 16px;
  min-height: 300px;
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