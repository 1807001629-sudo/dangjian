<template>
  <div class="activities-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">活动管理</h1>
      <p class="page-description">管理党员的活动时数和修正党时记录</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in statsList" :key="stat.title" :style="{ '--stat-color': stat.color }">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}{{ stat.unit }}</div>
          <div class="stat-title">{{ stat.title }}</div>
        </div>
      </div>
    </div>
    
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">班级筛选:</label>
          <select v-model="activeFilters.class" class="filter-select" @change="handleFilterChange">
            <option value="">全部班级</option>
            <option v-for="className in uniqueClasses" :key="className" :value="className">
              {{ className }}
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label class="filter-label">政治面貌:</label>
          <select v-model="activeFilters.politicalStatus" class="filter-select" @change="handleFilterChange">
            <option value="">全部</option>
            <option value="中共党员">中共党员</option>
            <option value="中共预备党员">中共预备党员</option>
            <option value="共青团员">共青团员</option>
            <option value="群众">群众</option>
          </select>
        </div>
        
        <div class="filter-item">
          <label class="filter-label">入党阶段:</label>
          <select v-model="activeFilters.stage" class="filter-select" @change="handleFilterChange">
            <option value="">全部阶段</option>
            <option value="入党申请人">入党申请人</option>
            <option value="入党积极分子">入党积极分子</option>
            <option value="中共预备党员">中共预备党员</option>
            <option value="中共党员">中共党员</option>
            <option value="未开始">未开始</option>
          </select>
        </div>
        
        <div class="filter-item">
          <label class="filter-label">修正状态:</label>
          <select v-model="activeFilters.correctionStatus" class="filter-select" @change="handleFilterChange">
            <option value="">全部状态</option>
            <option value="not-started">未开始</option>
            <option value="need">需修正 (-50h以内)</option>
            <option value="serious">缺时较多 (-100h以内)</option>
            <option value="critical">严重缺时 (-100h以上)</option>
            <option value="completed">中共党员/已完成</option>
          </select>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-item search-item">
          <label class="filter-label">搜索:</label>
          <div class="search-box">
            <input
              v-model="activeFilters.search"
              type="text"
              placeholder="输入姓名或学号搜索..."
              class="search-input"
              @input="handleFilterChange"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="btn-reset" @click="resetFilters">重置筛选</button>
          <button class="btn-export" @click="exportData">
            <span class="export-icon">📥</span>
            导出数据
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要表格区域 -->
    <div class="main-content">
      <div class="table-card">
        <div class="table-header">
          <div class="header-left">
            <h3>活动记录列表</h3>
            <span class="record-count">共 {{ filteredMembers.length }} 条记录</span>
          </div>
          <div class="header-right">
            <div class="legend">
              <div class="legend-item">
                <span class="legend-color" style="background-color: #722ed1;"></span>
                <span class="legend-text">中共党员</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #13c2c2;"></span>
                <span class="legend-text">已完成</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background-color: #bfbfbf;"></span>
                <span class="legend-text">未开始</span>
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
                    {{ member.政治面貌 || '未知' }}
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
                    <div class="correction-bar" v-if="!member.isPartyMember && member.修正党时 < 0 && !shouldShowNotStarted(member)">
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
                      :disabled="member.isPartyMember || shouldShowNotStarted(member)"
                      :class="{ 'disabled': member.isPartyMember || shouldShowNotStarted(member) }"
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
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载数据中...</div>
    </div>
    
    <!-- 修正时数模态框 -->
    <div v-if="showCorrectionModal" class="modal-overlay">
      <div class="simple-modal">
        <div class="modal-header">
          <h3>修正党时 - {{ selectedMember?.姓名 }}</h3>
          <button class="modal-close" @click="showCorrectionModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>当前修正时数: {{ selectedMember?.修正党时 || 0 }}h</p>
          <div class="modal-actions">
            <button @click="showCorrectionModal = false" class="btn-cancel">取消</button>
            <button @click="handleSaveCorrection" class="btn-save">保存</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 成员详情模态框 -->
    <div v-if="showMemberDetailModal" class="modal-overlay">
      <div class="detail-modal">
        <div class="modal-header">
          <h3>成员详情 - {{ selectedMember?.姓名 }}</h3>
          <button class="modal-close" @click="showMemberDetailModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="member-detail-grid">
            <div class="detail-item">
              <span class="detail-label">学号:</span>
              <span class="detail-value">{{ selectedMember?.学号 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">班级:</span>
              <span class="detail-value">{{ selectedMember?.班级 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">政治面貌:</span>
              <span class="detail-value">{{ selectedMember?.政治面貌 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">入党阶段:</span>
              <span class="detail-value">{{ selectedMember?.processStage || '未开始' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">活动时数:</span>
              <span class="detail-value">{{ selectedMember?.活动时数 || 0 }}h</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">修正党时:</span>
              <span class="detail-value">{{ selectedMember?.修正党时 || 0 }}h</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">总时数:</span>
              <span class="detail-value">{{ getTotalHours(selectedMember) }}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '../stores/dataStore'
import { formatDate } from '../utils/dateFormatter'
import { calculateProcessStage } from '../services/dataTransformer'

// 使用 Pinia 数据存储
const dataStore = useDataStore()

// 响应式数据
const members = ref([])
const activeFilters = ref({
  class: '',
  politicalStatus: '',
  stage: '',
  correctionStatus: '',
  search: ''
})
const sortColumn = ref('活动时数')
const sortDirection = ref('desc')
const currentPage = ref(1)
const pageSize = 20
const showCorrectionModal = ref(false)
const showMemberDetailModal = ref(false)
const selectedMember = ref(null)
const loading = ref(false)

// 统计卡片数据
const statsList = computed(() => [
  {
    title: '总活动时数',
    value: totalActivityHours.value,
    unit: 'h',
    icon: '⏱️',
    color: '#1890ff'
  },
  {
    title: '平均活动时数',
    value: averageActivityHours.value,
    unit: 'h',
    icon: '📊',
    color: '#52c41a'
  },
  {
    title: '需修正人数',
    value: needCorrectionCount.value,
    icon: '⚠️',
    color: '#faad14'
  },
  {
    title: '严重缺时人数',
    value: seriousLackCount.value,
    icon: '🔴',
    color: '#f5222d'
  },
  {
    title: '中共党员/已完成',
    value: completedCorrectionCount.value,
    icon: '✅',
    color: '#13c2c2'
  },
  {
    title: '总修正时数',
    value: totalCorrectionHours.value,
    unit: 'h',
    icon: '🔄',
    color: '#722ed1'
  }
])

// 初始化数据
onMounted(async () => {
  console.log('Activities.vue 已加载，从API获取数据')
  loading.value = true
  
  try {
    // 从数据存储获取成员数据
    await dataStore.fetchMembers()
    
    // 格式化数据
    members.value = dataStore.members.map((member, index) => {
      const formattedMember = {
        ...member,
        id: member.学号 || index,
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
  } catch (error) {
    console.error('加载数据失败:', error)
    members.value = []
  } finally {
    loading.value = false
  }
})

// 新增方法：判断是否需要显示未开始状态
function shouldShowNotStarted(member) {
  if (!member) return false
  const stage = member.processStage || member.入党流程阶段 || ''
  const isPassed600Questions = member['600题考试成绩'] && parseFloat(member['600题考试成绩']) >= 60
  
  // 条件：入党阶段为"未开始"、"入党申请人"或"通过600题"的
  return stage === '未开始' || 
         stage === '入党申请人' || 
         isPassed600Questions ||
         member.入党流程阶段 === '通过600题'
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
      
      // 如果成员应该显示"未开始"状态，则根据筛选条件判断
      if (shouldShowNotStarted(member)) {
        return activeFilters.value.correctionStatus === 'not-started'
      }
      
      const correction = member.修正党时 || 0
      switch (activeFilters.value.correctionStatus) {
        case 'need': return correction < 0 && correction > -50
        case 'serious': return correction <= -50 && correction > -100
        case 'critical': return correction <= -100
        case 'completed': return correction >= 0
        case 'not-started': return false // 这里不会执行到，因为上面已经处理了
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
    // "未开始"状态不计入需修正人数
    if (shouldShowNotStarted(member)) return false
    const correction = member.修正党时 || 0
    return correction < 0 && correction > -50
  }).length
})

const seriousLackCount = computed(() => {
  return members.value.filter(member => {
    // 中共党员不计入缺时人数
    if (member.isPartyMember) return false
    // "未开始"状态不计入缺时人数
    if (shouldShowNotStarted(member)) return false
    const correction = member.修正党时 || 0
    return correction <= -50 && correction > -100
  }).length
})

const completedCorrectionCount = computed(() => {
  return members.value.filter(member => {
    // 中共党员自动计入已完成
    if (member.isPartyMember) return true
    // "未开始"状态不计入已完成
    if (shouldShowNotStarted(member)) return false
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
function handleFilterChange() {
  currentPage.value = 1
}

function resetFilters() {
  activeFilters.value = {
    class: '',
    politicalStatus: '',
    stage: '',
    correctionStatus: '',
    search: ''
  }
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
  if (!member) return '0.0'
  const activity = member.活动时数 || 0
  const correction = member.修正党时 || 0
  return (activity + correction).toFixed(1)
}

function getCorrectionClass(member) {
  if (!member) return ''
  
  // 中共党员直接显示中共党员样式
  if (member.isPartyMember) return 'party-member'
  
  // "未开始"状态显示灰色
  if (shouldShowNotStarted(member)) return 'not-started'
  
  const value = member.修正党时 || 0
  if (value >= 0) return 'completed'
  if (value > -50) return 'need'
  if (value > -100) return 'serious'
  return 'critical'
}

function getCorrectionPercentage(member) {
  if (!member) return 0
  
  // 中共党员和未开始状态不需要显示进度条
  if (member.isPartyMember || shouldShowNotStarted(member)) return 0
  
  const value = Math.abs(member.修正党时 || 0)
  // 最大显示为-100，超过100按100算
  return Math.min(value, 100)
}

function getStatusClass(member) {
  if (!member) return ''
  
  // 中共党员直接显示中共党员样式
  if (member.isPartyMember) return 'party-member'
  
  // 检查是否需要显示未开始状态
  if (shouldShowNotStarted(member)) {
    return 'not-started'
  }
  
  const correction = member.修正党时 || 0
  if (correction >= 0) return 'completed'
  if (correction > -50) return 'warning'
  if (correction > -100) return 'serious'
  return 'critical'
}

function getStatusText(member) {
  if (!member) return ''
  
  // 中共党员直接显示中共党员
  if (member.isPartyMember) return '中共党员'
  
  // 检查是否需要显示未开始状态
  if (shouldShowNotStarted(member)) {
    return '未开始'
  }
  
  const correction = member.修正党时 || 0
  if (correction >= 0) return '已完成'
  if (correction > -50) return '需修正'
  if (correction > -100) return '缺时较多'
  return '严重缺时'
}

function getRowClass(member) {
  if (!member) return ''
  
  // 中共党员显示特殊行样式
  if (member.isPartyMember) return 'row-party-member'
  
  // 未开始状态显示灰色背景
  if (shouldShowNotStarted(member)) return 'row-not-started'
  
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
    '未开始': '#bfbfbf',
    '通过600题': '#1890ff'
  }
  return colors[stage] || '#bfbfbf'
}

function viewMemberDetail(member) {
  selectedMember.value = member
  showMemberDetailModal.value = true
}

function editCorrection(member) {
  // 中共党员和未开始状态不允许修改修正党时
  if (member.isPartyMember) {
    alert('中共党员无需修正党时')
    return
  }
  if (shouldShowNotStarted(member)) {
    alert('未开始入党流程的成员无需修正党时')
    return
  }
  selectedMember.value = member
  showCorrectionModal.value = true
}

function addActivity(member) {
  selectedMember.value = member
  alert(`为 ${member.姓名} 添加活动记录`)
}

function handleSaveCorrection() {
  // TODO: 这里可以添加API调用更新数据库
  console.log('更新修正党时:', selectedMember.value)
  showCorrectionModal.value = false
}

// 导出数据为CSV
function exportData() {
  if (filteredMembers.value.length === 0) {
    alert('没有数据可以导出')
    return
  }
  
  try {
    // 准备数据
    const exportData = filteredMembers.value.map((member, index) => ({
      '序号': index + 1,
      '姓名': member.姓名 || '',
      '学号': member.学号 || '',
      '班级': member.班级 || '',
      '政治面貌': member.政治面貌 || '',
      '入党阶段': member.processStage || '未开始',
      '活动时数': member.活动时数 || 0,
      '修正党时': member.修正党时 || 0,
      '总时数': getTotalHours(member),
      '状态': getStatusText(member),
      '四级成绩': member.四级成绩 || '',
      '计算机二级': member.计算机二级 || '',
      '不及格情况': member.不及格情况 || '无',
      '前一学年综测百分比': member.前一学年综测百分比 || ''
    }))
    
    // 转换为CSV格式
    const headers = Object.keys(exportData[0])
    const csvRows = []
    
    // 添加标题行
    csvRows.push(headers.join(','))
    
    // 添加数据行
    for (const row of exportData) {
      const values = headers.map(header => {
        const escaped = String(row[header]).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `活动管理数据_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`已导出${exportData.length}条记录到CSV`)
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出失败，请重试')
  }
}
</script>

<style scoped>
/* 样式保持不变，仅修复导入路径问题，这里展示完整的样式以确保一致 */
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

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--stat-color);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: var(--stat-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
}

/* 筛选区域样式 */
.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  flex: 1;
  min-width: 180px;
}

.search-item {
  flex: 2;
  min-width: 300px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
  font-size: 16px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.btn-reset {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #262626;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #e8e8e8;
  border-color: #bfbfbf;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover {
  background: #d9363e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.2);
}

.export-icon {
  font-size: 16px;
}

/* 表格区域样式 - 保持原有样式 */
.main-content {
  margin-top: 20px;
}

.table-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
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

.activities-table tbody tr.row-not-started {
  background: #fafafa !important;
}

.activities-table tbody tr.row-not-started:hover {
  background: #f0f0f0 !important;
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

/* 未开始样式 */
.correction-cell.not-started {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
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

.correction-cell.not-started .correction-value {
  color: #8c8c8c;
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

.status-badge.not-started {
  background: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
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

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #c7000a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #262626;
  font-size: 16px;
  font-weight: 500;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(2px);
}

.simple-modal, .detail-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease;
}

.detail-modal {
  max-width: 500px;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fffafa 0%, #fff 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8c8c8c;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #262626;
}

.modal-body {
  padding: 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #f5f5f5;
  border-color: #bfbfbf;
}

.btn-save {
  padding: 10px 20px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #d9363e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.2);
}

.member-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #262626;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-item, .search-item {
    min-width: 100%;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: space-between;
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
  
  .member-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>