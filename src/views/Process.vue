<!-- src/views/Process.vue - 入党流程页面 -->
<template>
  <div class="process-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📋 入党流程追踪</h1>
      <p class="page-description">实时跟踪党员的入党进度和各个阶段状态</p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载入党流程数据...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>数据加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadData" class="btn-retry">重试</button>
    </div>
    
    <!-- 正常状态 -->
    <div v-else class="content-wrapper">
      <!-- 阶段统计卡片 -->
      <div class="stage-stats">
        <div 
          v-for="stage in stageStats" 
          :key="stage.name" 
          class="stage-card"
          :style="{ borderLeftColor: stage.color }"
          @click="filterByStage(stage.name)"
        >
          <div class="stage-icon">{{ stage.icon }}</div>
          <div class="stage-content">
            <div class="stage-name">{{ stage.name }}</div>
            <div class="stage-count">{{ stage.count }}人</div>
          </div>
          <div class="stage-percentage">{{ stage.percentage }}%</div>
        </div>
      </div>
      
      <!-- 主要区域 -->
      <div class="main-area">
        <!-- 左侧：筛选和列表 -->
        <div class="left-panel">
          <div class="filter-section">
            <div class="search-box">
              <input 
                v-model="searchText" 
                placeholder="搜索姓名、学号..." 
                class="search-input"
                @input="handleSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
            
            <div class="filter-options">
              <div class="filter-group">
                <label>班级：</label>
                <select v-model="selectedClass" class="filter-select">
                  <option value="">全部班级</option>
                  <option v-for="className in classList" :key="className" :value="className">
                    {{ className }}
                  </option>
                </select>
              </div>
              
              <div class="filter-group">
                <label>时间范围：</label>
                <select v-model="selectedTimeRange" class="filter-select">
                  <option value="all">全部时间</option>
                  <option value="year">今年</option>
                  <option value="month">本月</option>
                  <option value="week">本周</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="members-section">
            <div class="section-header">
              <h3>成员列表</h3>
              <span class="member-count">{{ filteredMembers.length }}人</span>
            </div>
            
            <div class="members-list">
              <div 
                v-for="member in filteredMembers" 
                :key="member.学号"
                class="member-card"
                :class="{ 'selected': selectedMemberId === member.学号 }"
                @click="selectMember(member)"
              >
                <div class="member-avatar" :style="{ background: getAvatarColor(member.姓名) }">
                  {{ getInitials(member.姓名) }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ member.姓名 }}</div>
                  <div class="member-class">{{ member.班级 || '无班级' }}</div>
                  <div class="member-stage" :style="{ color: getStageColor(member.processStage) }">
                    {{ member.processStage || '未开始' }}
                  </div>
                </div>
                <div class="member-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ 
                        width: `${getMemberProgress(member)}%`,
                        backgroundColor: getStageColor(member.processStage)
                      }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ getMemberProgress(member) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：详情 -->
        <div class="right-panel">
          <div class="detail-section">
            <div v-if="selectedMember" class="detail-content">
              <!-- 成员头部 -->
              <div class="member-header">
                <div class="member-basic">
                  <div class="member-avatar-large" :style="{ background: getAvatarColor(selectedMember.姓名) }">
                    {{ getInitials(selectedMember.姓名) }}
                  </div>
                  <div class="member-info">
                    <h2>{{ selectedMember.姓名 }}</h2>
                    <div class="member-meta">
                      <span class="meta-item">学号：{{ selectedMember.学号 }}</span>
                      <span class="meta-item">班级：{{ selectedMember.班级 }}</span>
                      <span class="meta-item">政治面貌：{{ selectedMember.政治面貌 }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="member-status">
                  <div class="stage-badge-large" :style="{ backgroundColor: getStageColor(selectedMember.processStage) }">
                    {{ selectedMember.processStage || '未开始' }}
                  </div>
                  <div class="status-info">
                    <div class="status-item">
                      <span class="label">当前阶段：</span>
                      <span class="value">{{ selectedMember.processStage || '未开始' }}</span>
                    </div>
                    <div class="status-item">
                      <span class="label">开始时间：</span>
                      <span class="value">{{ getStageStartTime(selectedMember) || '未开始' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 时间线 -->
              <div class="timeline-section">
                <h3>入党流程时间线</h3>
                <div class="timeline">
                  <div 
                    v-for="stage in timelineStages" 
                    :key="stage.name"
                    class="timeline-item"
                    :class="{ 
                      'active': isStageActive(selectedMember, stage),
                      'completed': isStageCompleted(selectedMember, stage)
                    }"
                    @click="showStageDetail(stage)"
                  >
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">{{ stage.name }}</div>
                      <div class="timeline-date">
                        {{ getStageDate(selectedMember, stage) || '未完成' }}
                      </div>
                      <div v-if="stage.description" class="timeline-desc">
                        {{ stage.description }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 详细信息 -->
              <div class="details-section">
                <div class="detail-grid">
                  <div class="detail-card">
                    <h4>基础信息</h4>
                    <div class="detail-row">
                      <span class="label">性别：</span>
                      <span class="value">{{ selectedMember.性别 || '未填写' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">年级：</span>
                      <span class="value">{{ selectedMember.年级 || '未填写' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">学籍状态：</span>
                      <span class="value">{{ selectedMember.学籍状态 || '未填写' }}</span>
                    </div>
                  </div>
                  
                  <div class="detail-card">
                    <h4>入党信息</h4>
                    <div class="detail-row">
                      <span class="label">递交申请书：</span>
                      <span class="value">{{ formatDate(selectedMember.递交入党申请书) || '未递交' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">积极分子时间：</span>
                      <span class="value">{{ formatDate(selectedMember.积极分子时间) || '未成为' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">确定为发展对象：</span>
                      <span class="value">{{ formatDate(selectedMember.确定为发展对象日期) || '未确定' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">支部大会：</span>
                      <span class="value">{{ formatDate(selectedMember.支部大会) || '未通过' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">转正时间：</span>
                      <span class="value">{{ formatDate(selectedMember.转正时间) || '未转正' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-detail">
              <div class="empty-icon">👈</div>
              <h3>请选择一位成员</h3>
              <p>从左侧列表中选择一位成员查看其详细的入党流程信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/memberUtils'
import { formatDate } from '@/utils/dateFormatter'

// 响应式数据
const members = ref([])
const selectedMemberId = ref(null)
const searchText = ref('')
const selectedClass = ref('')
const selectedTimeRange = ref('all')
const loading = ref(false)
const error = ref('')

// 入党阶段定义
const timelineStages = [
  { 
    name: '递交入党申请书', 
    key: '递交入党申请书',
    description: '向党组织正式递交入党申请书',
    order: 1
  },
  { 
    name: '成为入党积极分子', 
    key: '积极分子时间',
    description: '确定为入党积极分子并参加培训',
    order: 2
  },
  { 
    name: '确定为发展对象', 
    key: '确定为发展对象日期',
    description: '经支部委员会讨论确定为发展对象',
    order: 3
  },
  { 
    name: '支部大会通过', 
    key: '支部大会',
    description: '支部大会讨论通过成为预备党员',
    order: 4
  },
  { 
    name: '转为正式党员', 
    key: '转正时间',
    description: '预备期满转为正式中共党员',
    order: 5
  }
]

// 阶段统计数据
const stageStats = computed(() => {
  const stages = [
    { name: '入党申请人', icon: '📝', color: '#52c41a' },
    { name: '入党积极分子', icon: '⭐', color: '#faad14' },
    { name: '确定为发展对象', icon: '🎯', color: '#ff7a45' },
    { name: '中共预备党员', icon: '🔴', color: '#f5222d' },
    { name: '中共党员', icon: '🏆', color: '#722ed1' },
    { name: '未开始', icon: '⏳', color: '#bfbfbf' }
  ]
  
  const total = members.value.length
  
  return stages.map(stage => {
    const count = members.value.filter(m => 
      calculateProcessStage(m) === stage.name
    ).length
    
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
    
    return {
      ...stage,
      count,
      percentage
    }
  })
})

// 生命周期
onMounted(async () => {
  await loadData()
})

// 加载数据
async function loadData() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('http://localhost:3001/api/members')
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      members.value = data.data.map(member => ({
        ...member,
        processStage: calculateProcessStage(member)
      }))
      
      // 默认选择第一个成员
      if (members.value.length > 0) {
        selectedMemberId.value = members.value[0].学号
      }
    } else {
      throw new Error(data.error || 'API返回失败')
    }
  } catch (err) {
    error.value = err.message
    console.error('加载数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 计算入党阶段
function calculateProcessStage(member) {
  if (!member) return '未开始'
  
  if (member.转正时间) return '中共党员'
  if (member.支部大会) return '中共预备党员'
  if (member.确定为发展对象日期) return '确定为发展对象'
  if (member.积极分子时间) return '入党积极分子'
  if (member.递交入党申请书) return '入党申请人'
  
  return '未开始'
}

// 计算属性
const classList = computed(() => {
  const classes = new Set()
  members.value.forEach(member => {
    if (member.班级) {
      classes.add(member.班级)
    }
  })
  return Array.from(classes).sort()
})

const filteredMembers = computed(() => {
  let result = members.value
  
  // 搜索筛选
  if (searchText.value) {
    const searchTerm = searchText.value.toLowerCase()
    result = result.filter(member => {
      const name = (member.姓名 || '').toLowerCase()
      const studentId = (member.学号 || '').toString().toLowerCase()
      return name.includes(searchTerm) || studentId.includes(searchTerm)
    })
  }
  
  // 班级筛选
  if (selectedClass.value) {
    result = result.filter(member => member.班级 === selectedClass.value)
  }
  
  // 时间范围筛选（如果有时间字段）
  if (selectedTimeRange.value !== 'all') {
    const currentDate = new Date()
    
    result = result.filter(member => {
      // 这里可以根据实际的时间字段进行筛选
      // 暂时返回全部，后面可以根据需求实现
      return true
    })
  }
  
  return result
})

const selectedMember = computed(() => {
  return members.value.find(m => m.学号 === selectedMemberId.value)
})

// 方法
function handleSearch() {
  // 搜索逻辑
}

function filterByStage(stageName) {
  selectedClass.value = ''
  searchText.value = ''
  
  // 这里可以添加阶段筛选逻辑
  // 暂时通过搜索实现
  searchText.value = stageName === '未开始' ? '' : stageName
}

function selectMember(member) {
  selectedMemberId.value = member.学号
}

function getStageColor(stage) {
  const colors = {
    '入党申请人': '#52c41a',
    '入党积极分子': '#faad14',
    '确定为发展对象': '#ff7a45',
    '中共预备党员': '#f5222d',
    '中共党员': '#722ed1',
    '未开始': '#bfbfbf'
  }
  return colors[stage] || '#bfbfbf'
}

function getMemberProgress(member) {
  const stage = member.processStage
  
  if (stage === '中共党员') return 100
  if (stage === '中共预备党员') return 80
  if (stage === '确定为发展对象') return 60
  if (stage === '入党积极分子') return 40
  if (stage === '入党申请人') return 20
  
  return 0
}

function getStageStartTime(member) {
  const stage = member.processStage
  
  if (stage === '中共党员') return formatDate(member.转正时间)
  if (stage === '中共预备党员') return formatDate(member.支部大会)
  if (stage === '确定为发展对象') return formatDate(member.确定为发展对象日期)
  if (stage === '入党积极分子') return formatDate(member.积极分子时间)
  if (stage === '入党申请人') return formatDate(member.递交入党申请书)
  
  return null
}

function isStageActive(member, timelineStage) {
  const currentStage = member.processStage
  const stageOrder = {
    '未开始': 0,
    '入党申请人': 1,
    '入党积极分子': 2,
    '确定为发展对象': 3,
    '中共预备党员': 4,
    '中共党员': 5
  }
  
  const currentOrder = stageOrder[currentStage] || 0
  return timelineStage.order === currentOrder
}

function isStageCompleted(member, timelineStage) {
  const stageOrder = {
    '未开始': 0,
    '入党申请人': 1,
    '入党积极分子': 2,
    '确定为发展对象': 3,
    '中共预备党员': 4,
    '中共党员': 5
  }
  
  const currentStage = member.processStage
  const currentOrder = stageOrder[currentStage] || 0
  return timelineStage.order < currentOrder
}

function getStageDate(member, timelineStage) {
  return formatDate(member[timelineStage.key])
}

function showStageDetail(stage) {
  // 显示阶段详情
  alert(`阶段详情：${stage.name}\n${stage.description}`)
}
</script>

<style scoped>
/* 样式与Members.vue类似，我提供关键部分的样式 */
.process-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

/* 阶段统计卡片 */
.stage-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stage-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #52c41a;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stage-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stage-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.stage-content {
  flex: 1;
}

.stage-name {
  font-size: 14px;
  color: #595959;
  margin-bottom: 4px;
}

.stage-count {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.stage-percentage {
  font-size: 12px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 主要区域 */
.main-area {
  display: flex;
  gap: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.left-panel {
  flex: 1;
  max-width: 400px;
  min-width: 300px;
  border-right: 1px solid #f0f0f0;
  padding-right: 24px;
}

.right-panel {
  flex: 2;
  min-width: 0;
}

/* 时间线样式 */
.timeline {
  position: relative;
  padding-left: 30px;
  margin-top: 16px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #f0f0f0;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-item:hover {
  background: #fafafa;
}

.timeline-item.completed {
  opacity: 1;
}

.timeline-item.active {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.timeline-dot {
  position: absolute;
  left: -34px;
  top: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f0f0f0;
  border: 2px solid white;
  z-index: 1;
}

.timeline-item.completed .timeline-dot {
  background: #52c41a;
}

.timeline-item.active .timeline-dot {
  background: #1890ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
}

.timeline-content {
  padding-left: 12px;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
  font-size: 15px;
}

.timeline-date {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 12px;
  color: #bfbfbf;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .main-area {
    flex-direction: column;
  }
  
  .left-panel {
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-right: 0;
    padding-bottom: 24px;
  }
  
  .members-list {
    max-height: 300px;
    overflow-y: auto;
  }
}

/* 其他样式（加载、错误、列表等）与Members.vue类似，省略以节省空间 */
</style>