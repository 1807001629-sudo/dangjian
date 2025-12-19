<template>
  <div class="activities-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">活动管理</h1>
      <p class="page-description">管理党员的活动时数和修正党时记录</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <StatCard
        title="总活动时数"
        :value="totalActivityHours"
        unit="h"
        icon="⏱️"
        color="#1890ff"
      />
      <StatCard
        title="平均活动时数"
        :value="averageActivityHours"
        unit="h"
        icon="📊"
        color="#52c41a"
      />
      <StatCard
        title="需修正人数"
        :value="needCorrectionCount"
        icon="⚠️"
        color="#faad14"
      />
      <StatCard
        title="严重缺时人数"
        :value="seriousLackCount"
        icon="🔴"
        color="#f5222d"
      />
      <StatCard
        title="中共党员/已完成"
        :value="completedCorrectionCount"
        icon="✅"
        color="#13c2c2"
      />
      <StatCard
        title="总修正时数"
        :value="totalCorrectionHours"
        unit="h"
        icon="🔄"
        color="#722ed1"
      />
    </div>
    
    <!-- 筛选区域 -->
    <ActivitiesFilter 
      :unique-classes="uniqueClasses"
      @filter-change="handleFilterChange"
    />
    
    <!-- 主要表格区域 -->
    <div class="main-content">
      <BaseCard class="table-card">
        <template #header>
          <div class="table-header">
            <div class="header-left">
              <h3>活动记录列表</h3>
              <span class="record-count">共 {{ filteredMembers.length }} 条记录</span>
            </div>
            <div class="header-right">
              <button class="btn-export" @click="exportData">
                <span class="export-icon">📥</span>
                导出数据
              </button>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #722ed1;"></span>
                  <span class="legend-text">中共党员</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #52c41a;"></span>
                  <span class="legend-text">已完成</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #faad14;"></span>
                  <span class="legend-text">需修正 (-50h以内)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #ff7a45;"></span>
                  <span class="legend-text">缺时较多 (-100h以内)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #f5222d;"></span>
                  <span class="legend-text">严重缺时 (-100h以上)</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <div class="table-container">
          <table class="activities-table">
            <thead>
              <tr>
                <th width="60">序号</th>
                <th width="100">姓名</th>
                <th width="120">学号</th>
                <th width="120">班级</th>
                <th width="100">政治面貌</th>
                <th width="120">入党阶段</th>
                <th width="120" class="sortable" @click="sortByColumn('活动时数')">
                  活动时数
                  <span class="sort-icon" v-if="sortColumn === '活动时数'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th width="140" class="sortable" @click="sortByColumn('修正党时')">
                  修正党时
                  <span class="sort-icon" v-if="sortColumn === '修正党时'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th width="120">总时数</th>
                <th width="100">状态</th>
                <th width="120">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(member, index) in paginatedMembers" 
                :key="member.id || member.学号"
                :class="getRowClass(member)"
              >
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td class="member-name">
                  <div class="name-avatar">
                    <div class="avatar" :style="{ background: getAvatarColor(member.姓名) }">
                      {{ getInitials(member.姓名) }}
                    </div>
                    {{ member.姓名 }}
                  </div>
                </td>
                <td>{{ member.学号 }}</td>
                <td>{{ member.班级 }}</td>
                <td>
                  <span class="political-status" :class="{ 'party-member': member.isPartyMember }">
                    {{ member.政治面貌 }}
                  </span>
                </td>
                <td>
                  <span class="stage-badge" :style="{ backgroundColor: getStageColor(member.processStage) }">
                    {{ member.processStage || '未开始' }}
                  </span>
                </td>
                <td>
                  <div class="hours-cell">
                    <span class="hours-value">{{ member.活动时数 || 0 }}</span>
                    <span class="hours-unit">h</span>
                  </div>
                </td>
                <td>
                  <div class="correction-cell" :class="getCorrectionClass(member)">
                    <span class="correction-value">{{ member.修正党时 || 0 }}</span>
                    <span class="correction-unit">h</span>
                    <div class="correction-bar" v-if="!member.isPartyMember && member.修正党时 < 0">
                      <div 
                        class="bar-fill"
                        :style="{ width: getCorrectionPercentage(member) + '%' }"
                      ></div>
                    </div>
                    <div class="party-member-tag" v-if="member.isPartyMember">
                      中共党员
                    </div>
                  </div>
                </td>
                <td>
                  <div class="total-hours">
                    <span class="total-value">{{ getTotalHours(member) }}</span>
                    <span class="total-unit">h</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(member)">
                    {{ getStatusText(member) }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button class="btn-action" @click="viewMemberDetail(member)" title="查看详情">
                      <span class="action-icon">👁️</span>
                    </button>
                    <button 
                      class="btn-action" 
                      @click="editCorrection(member)" 
                      title="修正时数"
                      :disabled="member.isPartyMember"
                      :class="{ 'disabled': member.isPartyMember }"
                    >
                      <span class="action-icon">✏️</span>
                    </button>
                    <button class="btn-action" @click="addActivity(member)" title="添加活动">
                      <span class="action-icon">➕</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- 空状态 -->
          <div v-if="filteredMembers.length === 0" class="empty-table">
            <div class="empty-icon">📋</div>
            <h3>暂无活动记录</h3>
            <p>尝试调整筛选条件或添加新的活动记录</p>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="table-footer" v-if="filteredMembers.length > 0">
          <div class="pagination-info">
            显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredMembers.length) }} 条，
            共 {{ filteredMembers.length }} 条记录
          </div>
          <div class="pagination-controls">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              上一页
            </button>
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <span v-if="hasMorePages" class="page-ellipsis">...</span>
            </div>
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              下一页
            </button>
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- 修正时数模态框 -->
    <CorrectionModal
      v-if="showCorrectionModal"
      :member="selectedMember"
      @save="handleSaveCorrection"
      @close="showCorrectionModal = false"
    />
    
    <!-- 成员详情模态框 -->
    <MemberDetailModal
      v-if="showMemberDetailModal"
      :member="selectedMember"
      @close="showMemberDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import StatCard from '@/components/ui/StatCard.vue'
import ActivitiesFilter from '@/components/filters/ActivitiesFilter.vue'
import CorrectionModal from '@/components/modals/CorrectionModal.vue'
import MemberDetailModal from '@/components/modals/MemberDetailModal.vue'
import membersData from '@/assets/data.json'
import { formatDate } from '@/utils/dateFormatter'

// 响应式数据
const members = ref([])
const activeFilters = ref({})
const sortColumn = ref('活动时数')
const sortDirection = ref('desc')
const currentPage = ref(1)
const pageSize = 20
const showCorrectionModal = ref(false)
const showMemberDetailModal = ref(false)
const selectedMember = ref(null)

// 初始化数据
onMounted(() => {
  console.log('Activities.vue 已加载')
  // 格式化数据
  members.value = membersData.map((member, index) => {
    const formattedMember = {
      ...member,
      id: member.学号 || index,
      // 格式化日期字段
      入团时间: formatDate(member.入团时间),
      出生年月日: formatDate(member.出生年月日),
      入校时间: formatDate(member.入校时间),
      申请入党时间: formatDate(member.申请入党时间),
      '600题考试时间': formatDate(member['600题考试时间']),
      '党支部接收入党积极分子时间': formatDate(member['党支部接收入党积极分子时间']),
      // 确保数字字段都是数字类型
      活动时数: parseFloat(member.活动时数) || 0,
      修正党时: parseFloat(member.修正党时) || 0,
      '600题考试成绩': parseFloat(member['600题考试成绩']) || 0,
      积极分子结业成绩: parseFloat(member.积极分子结业成绩) || 0
    }
    
    // 计算综合的入党阶段
    const processStage = calculateProcessStage(formattedMember)
    
    // 中共党员自动标记为已完成修正
    const isPartyMember = formattedMember.政治面貌 === '中共党员'
    
    return {
      ...formattedMember,
      processStage,
      // 中共党员不需要修正党时
      isPartyMember
    }
  })
  console.log('加载了', members.value.length, '条活动记录')
})

// 计算综合的入党阶段
function calculateProcessStage(member) {
  if (member.政治面貌 === '中共党员') return '中共党员'
  if (member.政治面貌 === '中共预备党员') return '中共预备党员'
  if (member.入党流程阶段) {
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
  let result = [...members.value]
  
  // 应用筛选
  if (activeFilters.value.class) {
    result = result.filter(member => member.班级 === activeFilters.value.class)
  }
  
  if (activeFilters.value.politicalStatus) {
    result = result.filter(member => member.政治面貌 === activeFilters.value.politicalStatus)
  }
  
  if (activeFilters.value.stage) {
    result = result.filter(member => {
      if (activeFilters.value.stage === '入党积极分子') {
        return ['入党积极分子', '积极分子培训结业'].includes(member.入党流程阶段)
      }
      return member.processStage === activeFilters.value.stage
    })
  }
  
  if (activeFilters.value.correctionStatus) {
    result = result.filter(member => {
      // 中共党员直接通过筛选（如果筛选的是"中共党员/已完成"状态）
      if (member.isPartyMember) {
        return activeFilters.value.correctionStatus === 'completed'
      }
      
      const correction = member.修正党时 || 0
      switch (activeFilters.value.correctionStatus) {
        case 'need': return correction < 0 && correction > -50
        case 'serious': return correction <= -50 && correction > -100
        case 'critical': return correction <= -100
        case 'completed': return correction >= 0
        default: return true
      }
    })
  }
  
  if (activeFilters.value.search) {
    const searchTerm = activeFilters.value.search.toLowerCase()
    result = result.filter(member => {
      const name = (member.姓名 || '').toLowerCase()
      const studentId = (member.学号 || '').toString().toLowerCase()
      return name.includes(searchTerm) || studentId.includes(searchTerm)
    })
  }
  
  // 应用排序
  result.sort((a, b) => {
    let valueA, valueB
    
    if (sortColumn.value === '活动时数') {
      valueA = a.活动时数 || 0
      valueB = b.活动时数 || 0
    } else if (sortColumn.value === '修正党时') {
      valueA = a.修正党时 || 0
      valueB = b.修正党时 || 0
    } else {
      return 0
    }
    
    if (sortDirection.value === 'asc') {
      return valueA - valueB
    } else {
      return valueB - valueA
    }
  })
  
  return result
})

// 统计相关计算
const totalActivityHours = computed(() => {
  return members.value.reduce((sum, member) => sum + (member.活动时数 || 0), 0).toFixed(1)
})

const averageActivityHours = computed(() => {
  if (members.value.length === 0) return '0.0'
  return (members.value.reduce((sum, member) => sum + (member.活动时数 || 0), 0) / members.value.length).toFixed(1)
})

const needCorrectionCount = computed(() => {
  return members.value.filter(member => {
    // 中共党员不计入需修正人数
    if (member.isPartyMember) return false
    const correction = member.修正党时 || 0
    return correction < 0 && correction > -50
  }).length
})

const seriousLackCount = computed(() => {
  return members.value.filter(member => {
    // 中共党员不计入缺时人数
    if (member.isPartyMember) return false
    const correction = member.修正党时 || 0
    return correction <= -50 && correction > -100
  }).length
})

const completedCorrectionCount = computed(() => {
  return members.value.filter(member => {
    // 中共党员自动计入已完成
    if (member.isPartyMember) return true
    const correction = member.修正党时 || 0
    return correction >= 0
  }).length
})

const totalCorrectionHours = computed(() => {
  return members.value.reduce((sum, member) => sum + (member.修正党时 || 0), 0).toFixed(1)
})

// 分页相关
const totalPages = computed(() => {
  return Math.ceil(filteredMembers.value.length / pageSize)
})

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMembers.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(maxVisible / 2)
    let start = currentPage.value - half
    let end = currentPage.value + half
    
    if (start < 1) {
      start = 1
      end = maxVisible
    }
    
    if (end > totalPages.value) {
      end = totalPages.value
      start = end - maxVisible + 1
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

const hasMorePages = computed(() => {
  return totalPages.value > visiblePages.value[visiblePages.value.length - 1]
})

// 方法
function handleFilterChange(filters) {
  activeFilters.value = filters
  currentPage.value = 1
}

function sortByColumn(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
}

function getTotalHours(member) {
  const activity = member.活动时数 || 0
  const correction = member.修正党时 || 0
  return (activity + correction).toFixed(1)
}

function getCorrectionClass(member) {
  // 中共党员直接显示中共党员样式
  if (member.isPartyMember) return 'party-member'
  
  const value = member.修正党时 || 0
  if (value >= 0) return 'completed'
  if (value > -50) return 'need'
  if (value > -100) return 'serious'
  return 'critical'
}

function getCorrectionPercentage(member) {
  // 中共党员不需要显示进度条
  if (member.isPartyMember) return 0
  
  const value = Math.abs(member.修正党时 || 0)
  // 最大显示为-100，超过100按100算
  return Math.min(value, 100)
}

function getStatusClass(member) {
  // 中共党员直接显示中共党员样式
  if (member.isPartyMember) return 'party-member'
  
  const correction = member.修正党时 || 0
  if (correction >= 0) return 'completed'
  if (correction > -50) return 'warning'
  if (correction > -100) return 'serious'
  return 'critical'
}

function getStatusText(member) {
  // 中共党员直接显示中共党员
  if (member.isPartyMember) return '中共党员'
  
  const correction = member.修正党时 || 0
  if (correction >= 0) return '已完成'
  if (correction > -50) return '需修正'
  if (correction > -100) return '缺时较多'
  return '严重缺时'
}

function getRowClass(member) {
  // 中共党员显示特殊行样式
  if (member.isPartyMember) return 'row-party-member'
  
  const correction = member.修正党时 || 0
  if (correction < -100) return 'row-critical'
  if (correction < -50) return 'row-serious'
  if (correction < 0) return 'row-warning'
  return 'row-completed'
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

function viewMemberDetail(member) {
  selectedMember.value = member
  showMemberDetailModal.value = true
}

function editCorrection(member) {
  // 中共党员不允许修改修正党时
  if (member.isPartyMember) {
    alert('中共党员无需修正党时')
    return
  }
  selectedMember.value = member
  showCorrectionModal.value = true
}

function addActivity(member) {
  selectedMember.value = member
  // 这里可以打开添加活动的模态框
  alert(`为 ${member.姓名} 添加活动记录`)
}

function handleSaveCorrection(updatedMember) {
  // 更新成员数据
  const index = members.value.findIndex(m => m.id === updatedMember.id)
  if (index !== -1) {
    members.value[index] = {
      ...members.value[index],
      修正党时: parseFloat(updatedMember.修正党时) || 0
    }
  }
  showCorrectionModal.value = false
}

function exportData() {
  const dataStr = JSON.stringify(filteredMembers.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `活动管理数据_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  console.log(`已导出数据，共${filteredMembers.value.length}条记录`)
}
</script>

<style scoped>
.activities-page {
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
  margin-top: 20px;
}

.table-card {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.record-count {
  font-size: 14px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.export-icon {
  font-size: 16px;
}

.legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-text {
  color: #595959;
  white-space: nowrap;
}

.table-container {
  overflow-x: auto;
  min-height: 400px;
}

.activities-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.activities-table th {
  background: #fafafa;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  font-size: 14px;
  border-bottom: 2px solid #f0f0f0;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.activities-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.activities-table th.sortable:hover {
  background: #f0f0f0;
}

.sort-icon {
  margin-left: 4px;
  font-weight: bold;
  color: #1890ff;
}

.activities-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #595959;
  vertical-align: middle;
}

/* 行状态样式 */
.activities-table tbody tr.row-party-member {
  background: #f9f0ff !important;
}

.activities-table tbody tr.row-party-member:hover {
  background: #f2e6ff !important;
}

.activities-table tbody tr.row-warning:hover {
  background: #fff7e6 !important;
}

.activities-table tbody tr.row-serious:hover {
  background: #fff2e8 !important;
}

.activities-table tbody tr.row-critical:hover {
  background: #fff1f0 !important;
}

.activities-table tbody tr.row-completed:hover {
  background: #f6ffed !important;
}

.activities-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.activities-table tbody tr:hover {
  background: #f5f5f5;
}

.activities-table tbody tr.row-warning {
  background: #fffbe6;
}

.activities-table tbody tr.row-serious {
  background: #fff7e6;
}

.activities-table tbody tr.row-critical {
  background: #fff1f0;
}

.activities-table tbody tr.row-completed {
  background: #f6ffed;
}

/* 单元格样式 */
.member-name {
  font-weight: 500;
  color: #262626;
}

.name-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

/* 中共党员政治面貌特殊样式 */
.political-status.party-member {
  color: #722ed1;
  font-weight: 600;
  background: rgba(114, 46, 209, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(114, 46, 209, 0.2);
  display: inline-block;
}

.stage-badge {
  padding: 4px 8px;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.hours-cell {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.hours-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.hours-unit {
  font-size: 12px;
  color: #8c8c8c;
}

.correction-cell {
  padding: 8px;
  border-radius: 6px;
  background: #fafafa;
  position: relative;
}

/* 中共党员样式 */
.correction-cell.party-member {
  background: rgba(114, 46, 209, 0.1);
  border: 1px solid rgba(114, 46, 209, 0.2);
}

.correction-cell.need {
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.correction-cell.serious {
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.correction-cell.critical {
  background: #fff1f0;
  border: 1px solid #ffa39e;
}

.correction-cell.completed {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.correction-value {
  font-size: 16px;
  font-weight: 600;
  margin-right: 2px;
}

.correction-cell.party-member .correction-value {
  color: #722ed1;
}

.correction-cell.need .correction-value {
  color: #faad14;
}

.correction-cell.serious .correction-value {
  color: #ff7a45;
}

.correction-cell.critical .correction-value {
  color: #f5222d;
}

.correction-cell.completed .correction-value {
  color: #52c41a;
}

.correction-unit {
  font-size: 12px;
  color: #8c8c8c;
}

.party-member-tag {
  font-size: 10px;
  color: #722ed1;
  background: rgba(114, 46, 209, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  display: inline-block;
}

.correction-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.correction-cell.need .bar-fill {
  background: linear-gradient(90deg, #faad14, #ffc53d);
}

.correction-cell.serious .bar-fill {
  background: linear-gradient(90deg, #ff7a45, #ff9c6e);
}

.correction-cell.critical .bar-fill {
  background: linear-gradient(90deg, #f5222d, #ff4d4f);
}

.total-hours {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.total-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.total-unit {
  font-size: 12px;
  color: #8c8c8c;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  min-width: 70px;
  text-align: center;
}

.status-badge.party-member {
  background: rgba(114, 46, 209, 0.1);
  color: #722ed1;
  border: 1px solid rgba(114, 46, 209, 0.2);
}

.status-badge.completed {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.status-badge.warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid rgba(250, 173, 20, 0.2);
}

.status-badge.serious {
  background: rgba(255, 122, 69, 0.1);
  color: #ff7a45;
  border: 1px solid rgba(255, 122, 69, 0.2);
}

.status-badge.critical {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
  border: 1px solid rgba(245, 34, 45, 0.2);
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #595959;
}

.btn-action:hover:not(.disabled) {
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-1px);
}

.btn-action.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #d9d9d9 !important;
  color: #8c8c8c !important;
  transform: none !important;
}

.btn-action.disabled:hover {
  border-color: #d9d9d9 !important;
  color: #8c8c8c !important;
  transform: none !important;
}

.action-icon {
  font-size: 14px;
}

.empty-table {
  text-align: center;
  padding: 60px 20px;
  color: #bfbfbf;
  background: #fafafa;
  border-radius: 8px;
  margin: 20px;
  border: 1px dashed #f0f0f0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-table h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #595959;
}

.empty-table p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.table-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #595959;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-number.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.page-ellipsis {
  padding: 0 8px;
  color: #8c8c8c;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .legend {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .table-footer {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}
</style>