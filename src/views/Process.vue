<!-- src/views/Process.vue -->
<template>
  <div class="process-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">入党流程追踪</h1>
      <p class="page-description">实时跟踪党员的入党进度和各个阶段状态</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <StatCard
        title="总人数"
        :value="stats.total"
        icon="👥"
        color="#1890ff"
      />
      <StatCard
        title="申请人"
        :value="stageCounts['入党申请人'] || 0"
        icon="📋"
        color="#52c41a"
      />
      <StatCard
        title="积极分子"
        :value="activeMembersCount"
        icon="⭐"
        color="#faad14"
      />
      <StatCard
        title="预备党员"
        :value="prePartyMemberCount"
        icon="🔴"
        color="#f5222d"
      />
      <StatCard
        title="中共党员"
        :value="partyMemberCount"
        icon="🏆"
        color="#722ed1"
      />
      <StatCard
        title="平均活动时数"
        :value="averageHours.toFixed(1)"
        unit="h"
        icon="⏱️"
        color="#13c2c2"
      />
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：筛选和列表 -->
      <div class="left-panel">
        <ProcessFilter 
          :unique-classes="uniqueClasses"
          @filter-change="handleFilterChange" 
        />
        
        <div class="members-section">
          <div class="section-header">
            <h3>成员列表 ({{ filteredMembers.length }})</h3>
            <div class="actions">
              <button class="btn-sort" @click="toggleSort">
                {{ sortBy === 'name' ? '按姓名' : '按阶段' }}
              </button>
            </div>
          </div>
          
          <div class="members-list">
            <div 
              v-for="member in sortedMembers" 
              :key="member.id || member.学号"
              class="member-card"
              :class="{ 'active': selectedMemberId === (member.id || member.学号) }"
              @click="selectMember(member)"
            >
              <div class="member-avatar" :style="{ background: getAvatarColor(member.姓名) }">
                {{ getInitials(member.姓名) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.姓名 }}</div>
                <div class="member-class">{{ member.班级 }}</div>
                <div class="member-stage" :style="{ color: getStageColor(member.processStage) }">
                  {{ member.processStage || '未开始' }}
                </div>
              </div>
              <div class="member-stats">
                <div class="stat-item" title="活动时数">
                  <span class="stat-icon">⏱️</span>
                  <span>{{ member.活动时数 || 0 }}h</span>
                </div>
                <div class="stat-item" title="600题成绩">
                  <span class="stat-icon">📝</span>
                  <span>{{ member['600题考试成绩'] || '-' }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="filteredMembers.length === 0" class="empty-list">
              <div class="empty-icon">📭</div>
              <p>暂无符合条件的成员</p>
              <button class="btn-reset" @click="resetFilters">重置筛选条件</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：流程详情 -->
      <div class="right-panel">
        <div class="detail-section">
          <div v-if="selectedMember" class="detail-content">
            <div class="member-header">
              <div class="header-left">
                <h2>{{ selectedMember.姓名 }}</h2>
                <div class="member-meta">
                  <span class="meta-item">
                    <strong>学号:</strong> {{ selectedMember.学号 }}
                  </span>
                  <span class="meta-item">
                    <strong>班级:</strong> {{ selectedMember.班级 }}
                  </span>
                  <span class="meta-item">
                    <strong>政治面貌:</strong> {{ selectedMember.政治面貌 }}
                  </span>
                  <span class="meta-item">
                    <strong>入党阶段:</strong> {{ selectedMember.processStage || '未开始' }}
                  </span>
                </div>
              </div>
              <div class="header-right">
                <div class="stage-badge" :style="{ backgroundColor: getStageColor(selectedMember.processStage) }">
                  {{ selectedMember.processStage || '未开始' }}
                </div>
                <div class="total-hours">
                  总活动时数: <strong>{{ selectedMember.活动时数 || 0 }}h</strong>
                </div>
              </div>
            </div>
            
            <!-- 流程时间线 -->
            <div class="timeline-section">
              <h3>入党流程时间线</h3>
              <ProcessTimeline :member="selectedMember" @stage-click="handleStageClick" />
            </div>
            
            <!-- 阶段进度 -->
            <div class="progress-section">
              <StageProgress :member="selectedMember" />
            </div>
            
            <!-- 详细信息 -->
            <div class="info-grid">
              <div class="info-card">
                <h4>基本信息</h4>
                <div class="info-row">
                  <span class="label">出生日期:</span>
                  <span class="value">{{ selectedMember.出生年月日 || '未填写' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">入团时间:</span>
                  <span class="value">{{ selectedMember.入团时间 || '未填写' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">入校时间:</span>
                  <span class="value">{{ selectedMember.入校时间 || '未填写' }}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>活动记录</h4>
                <div class="info-row">
                  <span class="label">活动时数:</span>
                  <span class="value">{{ selectedMember.活动时数 || 0 }} 小时</span>
                </div>
                <div class="info-row">
                  <span class="label">修正党时:</span>
                  <span class="value">{{ selectedMember.修正党时 || 0 }} 小时</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>考试信息</h4>
                <div class="info-row">
                  <span class="label">600题成绩:</span>
                  <span class="value" :class="{
                    'pass': selectedMember['600题考试成绩'] >= 60,
                    'fail': selectedMember['600题考试成绩'] < 60 && selectedMember['600题考试成绩'] > 0
                  }">
                    {{ selectedMember['600题考试成绩'] || '未参加' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">考试时间:</span>
                  <span class="value">{{ selectedMember['600题考试时间'] || '未参加' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">积极分子结业成绩:</span>
                  <span class="value">{{ selectedMember.积极分子结业成绩 || '未参加' }}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>申请记录</h4>
                <div class="info-row">
                  <span class="label">申请入党时间:</span>
                  <span class="value">{{ selectedMember.申请入党时间 || '未申请' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">申请年龄:</span>
                  <span class="value">{{ selectedMember['递交入党申请书年龄（岁）'] || '-' }} 岁</span>
                </div>
                <div class="info-row">
                  <span class="label">支部接收时间:</span>
                  <span class="value">{{ selectedMember['党支部接收入党积极分子时间'] || '未接收' }}</span>
                </div>
              </div>
            </div>
            
            <!-- 备注信息 -->
            <div v-if="selectedMember.备注" class="remarks-section">
              <h4>备注</h4>
              <div class="remarks-content">{{ selectedMember.备注 }}</div>
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
    
    <!-- 阶段详情模态框 -->
    <StageDetailModal
      v-if="showStageModal"
      :stage="selectedStage"
      :members="stageMembers"
      @close="closeStageModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StatCard from '@/components/ui/StatCard.vue'
import ProcessFilter from '@/components/filters/ProcessFilter.vue'
import ProcessTimeline from '@/components/process/ProcessTimeline.vue'
import StageProgress from '@/components/process/StageProgress.vue'
import StageDetailModal from '@/components/modals/StageDetailModal.vue'
import membersData from '@/assets/data.json'

// 日期格式化函数
function formatDateStr(dateStr) {
  if (!dateStr) return ''
  
  // 如果是数字类型如 20251218.0
  if (typeof dateStr === 'number' && !isNaN(dateStr)) {
    const dateNum = Math.floor(dateStr) // 去掉 .0
    const dateStrClean = dateNum.toString()
    
    if (dateStrClean.length === 8) {
      // 格式化为 YYYY/MM/DD
      const year = dateStrClean.substring(0, 4)
      const month = dateStrClean.substring(4, 6)
      const day = dateStrClean.substring(6, 8)
      return `${year}/${month}/${day}`
    }
  }
  
  // 如果是字符串类型，尝试各种可能的格式
  if (typeof dateStr === 'string') {
    // 移除 .0 后缀
    const cleanStr = dateStr.replace(/\.0$/, '')
    
    // 检查是否是纯数字格式 YYYYMMDD
    if (/^\d{8}$/.test(cleanStr)) {
      const year = cleanStr.substring(0, 4)
      const month = cleanStr.substring(4, 6)
      const day = cleanStr.substring(6, 8)
      return `${year}/${month}/${day}`
    }
    
    // 检查是否是 YYYY-MM-DD 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      return cleanStr
    }
    
    // 其他格式直接返回
    return cleanStr
  }
  
  return dateStr
}

// 响应式数据
const members = ref([])
const selectedMemberId = ref(null)
const showStageModal = ref(false)
const selectedStage = ref('')
const activeFilters = ref({})
const sortBy = ref('stage') // 'name' 或 'stage'

// 初始化数据
onMounted(() => {
  console.log('Process.vue 已加载')
  // 为每个成员添加处理后的字段，并格式化日期
  members.value = membersData.map((member, index) => {
    // 格式化所有日期字段
    const formattedMember = {
      ...member,
      id: member.学号 || index,
      // 格式化日期字段
      入团时间: formatDateStr(member.入团时间),
      出生年月日: formatDateStr(member.出生年月日),
      入校时间: formatDateStr(member.入校时间),
      申请入党时间: formatDateStr(member.申请入党时间),
      '600题考试时间': formatDateStr(member['600题考试时间']),
      '党支部接收入党积极分子时间': formatDateStr(member['党支部接收入党积极分子时间']),
      // 确保数字字段都是数字类型
      活动时数: parseFloat(member.活动时数) || 0,
      修正党时: parseFloat(member.修正党时) || 0,
      '600题考试成绩': parseFloat(member['600题考试成绩']) || 0,
      积极分子结业成绩: parseFloat(member.积极分子结业成绩) || 0,
      '递交入党申请书年龄（岁）': parseFloat(member['递交入党申请书年龄（岁）']) || null
    }
    
    // 计算综合的入党阶段（结合入党流程阶段和政治面貌）
    const processStage = calculateProcessStage(formattedMember)
    
    return {
      ...formattedMember,
      // 添加处理后的字段
      processStage,
      // 判断是否为积极分子（包括入党积极分子和积极分子培训结业）
      isActiveMember: ['入党积极分子', '积极分子培训结业'].includes(member.入党流程阶段),
      // 从政治面貌判断党员身份
      isPrePartyMember: member.政治面貌 === '中共预备党员',
      isPartyMember: member.政治面貌 === '中共党员'
    }
  })
  console.log('加载了', members.value.length, '条成员数据')
  console.log('格式化后的第一条数据:', members.value[0])
})

// 计算综合的入党阶段
function calculateProcessStage(member) {
  // 首先检查政治面貌，优先级最高
  if (member.政治面貌 === '中共党员') return '中共党员'
  if (member.政治面貌 === '中共预备党员') return '中共预备党员'
  
  // 然后检查入党流程阶段
  if (member.入党流程阶段) {
    // 处理积极分子相关阶段
    if (member.入党流程阶段 === '积极分子培训结业') return '入党积极分子'
    return member.入党流程阶段
  }
  
  return '未开始'
}

// 计算属性
const uniqueClasses = computed(() => {
  const classes = new Set()
  members.value.forEach(member => {
    if (member.班级) {
      classes.add(member.班级)
    }
  })
  return Array.from(classes).sort()
})

const filteredMembers = computed(() => {
  if (Object.keys(activeFilters.value).length === 0) {
    return members.value
  }
  
  return members.value.filter(member => {
    // 班级筛选
    if (activeFilters.value.class && member.班级 !== activeFilters.value.class) {
      return false
    }
    
    // 政治面貌筛选
    if (activeFilters.value.politicalStatus && 
        member.政治面貌 !== activeFilters.value.politicalStatus) {
      return false
    }
    
    // 阶段筛选（使用处理后的processStage）
    if (activeFilters.value.stage) {
      let memberStage = member.processStage
      // 特殊处理：如果筛选积极分子，包括所有积极分子相关阶段
      if (activeFilters.value.stage === '入党积极分子') {
        if (!member.isActiveMember && memberStage !== '入党申请人') {
          return false
        }
      } else if (activeFilters.value.stage === '中共预备党员') {
        if (!member.isPrePartyMember) return false
      } else if (activeFilters.value.stage === '中共党员') {
        if (!member.isPartyMember) return false
      } else if (memberStage !== activeFilters.value.stage) {
        return false
      }
    }
    
    // 活动时数范围筛选
    if (activeFilters.value.hoursMin !== undefined) {
      const hours = member.活动时数 || 0
      if (hours < parseFloat(activeFilters.value.hoursMin)) return false
    }
    
    if (activeFilters.value.hoursMax !== undefined) {
      const hours = member.活动时数 || 0
      if (hours > parseFloat(activeFilters.value.hoursMax)) return false
    }
    
    // 搜索筛选
    if (activeFilters.value.search) {
      const searchTerm = activeFilters.value.search.toLowerCase()
      const name = (member.姓名 || '').toLowerCase()
      const studentId = (member.学号 || '').toString().toLowerCase()
      const className = (member.班级 || '').toLowerCase()
      
      if (!name.includes(searchTerm) && 
          !studentId.includes(searchTerm) && 
          !className.includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
})

const sortedMembers = computed(() => {
  const members = [...filteredMembers.value]
  
  if (sortBy.value === 'name') {
    return members.sort((a, b) => {
      const nameA = (a.姓名 || '').toLowerCase()
      const nameB = (b.姓名 || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } else {
    // 按阶段排序（自定义顺序）
    const stageOrder = {
      '中共党员': 1,
      '中共预备党员': 2,
      '入党积极分子': 3,
      '入党申请人': 4,
      '未开始': 5
    }
    
    return members.sort((a, b) => {
      const stageA = stageOrder[a.processStage] || 999
      const stageB = stageOrder[b.processStage] || 999
      return stageA - stageB
    })
  }
})

const selectedMember = computed(() => {
  return members.value.find(m => (m.id || m.学号) === selectedMemberId.value)
})

// 统计相关计算
const stageCounts = computed(() => {
  const counts = {}
  members.value.forEach(member => {
    const stage = member.processStage || '未开始'
    counts[stage] = (counts[stage] || 0) + 1
  })
  return counts
})

// 积极分子人数（包括入党积极分子和积极分子培训结业）
const activeMembersCount = computed(() => {
  return members.value.filter(member => member.isActiveMember).length
})

// 预备党员人数（从政治面貌获取）
const prePartyMemberCount = computed(() => {
  return members.value.filter(member => member.isPrePartyMember).length
})

// 党员人数（从政治面貌获取）
const partyMemberCount = computed(() => {
  return members.value.filter(member => member.isPartyMember).length
})

const averageHours = computed(() => {
  if (members.value.length === 0) return 0
  const total = members.value.reduce((sum, member) => {
    return sum + (member.活动时数 || 0)
  }, 0)
  return total / members.value.length
})

const stats = computed(() => ({
  total: members.value.length,
  byStage: stageCounts.value,
  activeMembers: activeMembersCount.value,
  prePartyMembers: prePartyMemberCount.value,
  partyMembers: partyMemberCount.value,
  averageHours: averageHours.value
}))

const stageMembers = computed(() => {
  if (!selectedStage.value) return []
  return members.value.filter(member => member.processStage === selectedStage.value)
})

// 方法
function selectMember(member) {
  selectedMemberId.value = member.id || member.学号
  console.log('选择成员:', member.姓名)
}

function handleFilterChange(filters) {
  console.log('筛选条件变化:', filters)
  activeFilters.value = filters
}

function resetFilters() {
  activeFilters.value = {}
  console.log('重置筛选条件')
}

function toggleSort() {
  sortBy.value = sortBy.value === 'name' ? 'stage' : 'name'
  console.log('切换排序方式:', sortBy.value)
}

function getInitials(name) {
  if (!name) return '??'
  return name.slice(0, 2)
}

function getAvatarColor(name) {
  const colors = [
    '#c7000a', '#ff4d4f', '#ff7a45', '#ffa940', '#faad14',
    '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb',
    '#722ed1', '#eb2f96'
  ]
  const index = name ? name.charCodeAt(0) % colors.length : 0
  return colors[index]
}

function getStageColor(stage) {
  const colors = {
    '入党申请人': '#52c41a',
    '入党积极分子': '#faad14',
    '中共预备党员': '#f5222d',
    '中共党员': '#722ed1',
    '未开始': '#bfbfbf'
  }
  return colors[stage] || '#bfbfbf'
}

function handleStageClick(stage) {
  console.log('点击阶段:', stage)
  // 可以在这里添加阶段详情查看逻辑
}

function closeStageModal() {
  showStageModal.value = false
  selectedStage.value = ''
}
</script>

<style scoped>
/* 样式保持不变 */
.process-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.main-content {
  display: flex;
  gap: 24px;
  height: calc(100vh - 240px);
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 320px;
}

.right-panel {
  flex: 2;
  min-width: 0;
}

.members-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-sort {
  padding: 4px 12px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sort:hover {
  border-color: #c7000a;
  color: #c7000a;
}

.members-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.member-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
}

.member-card:hover {
  border-color: #c7000a;
  box-shadow: 0 2px 8px rgba(199, 0, 10, 0.1);
  transform: translateY(-1px);
}

.member-card.active {
  border-color: #c7000a;
  background: #fffafa;
}

.member-card.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #c7000a;
  border-radius: 3px 0 0 3px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 600;
  color: #262626;
  margin-bottom: 2px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-class {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.member-stage {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  background: rgba(199, 0, 10, 0.05);
  border-radius: 3px;
  display: inline-block;
}

.member-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
  white-space: nowrap;
}

.stat-icon {
  font-size: 14px;
}

.empty-list {
  text-align: center;
  padding: 60px 20px;
  color: #bfbfbf;
  background: #fafafa;
  border-radius: 6px;
  border: 1px dashed #f0f0f0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.btn-reset {
  margin-top: 16px;
  padding: 6px 16px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #d9363e;
}

.detail-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 100%;
  overflow-y: auto;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 16px;
}

.member-header h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #262626;
}

.member-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  font-size: 13px;
  color: #595959;
  background: #fafafa;
  padding: 4px 8px;
  border-radius: 4px;
}

.meta-item strong {
  color: #262626;
  margin-right: 4px;
}

.header-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.stage-badge {
  padding: 6px 16px;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.total-hours {
  font-size: 14px;
  color: #595959;
}

.total-hours strong {
  color: #c7000a;
  font-size: 18px;
}

.timeline-section {
  margin-bottom: 24px;
}

.timeline-section h3,
.progress-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.progress-section {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.info-card h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #8c8c8c;
}

.value {
  color: #262626;
  font-weight: 500;
  text-align: right;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value.pass {
  color: #52c41a;
}

.value.fail {
  color: #f5222d;
}

.remarks-section {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 16px;
}

.remarks-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #262626;
}

.remarks-content {
  font-size: 13px;
  color: #595959;
  line-height: 1.5;
  white-space: pre-wrap;
}

.empty-detail {
  text-align: center;
  padding: 60px 20px;
  color: #bfbfbf;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-detail .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-detail h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #595959;
}

.empty-detail p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
  max-width: 300px;
}

/* 滚动条样式 */
.members-list::-webkit-scrollbar,
.detail-section::-webkit-scrollbar {
  width: 6px;
}

.members-list::-webkit-scrollbar-track,
.detail-section::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.members-list::-webkit-scrollbar-thumb,
.detail-section::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.members-list::-webkit-scrollbar-thumb:hover,
.detail-section::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }
  
  .left-panel,
  .right-panel {
    width: 100%;
  }
  
  .left-panel {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .member-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    align-items: stretch;
  }
  
  .member-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .member-card {
    flex-wrap: wrap;
  }
  
  .member-stats {
    width: 100%;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
    justify-content: flex-start;
  }
}
</style>