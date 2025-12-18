<template>
  <div class="members-management">
    <!-- 顶部标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">👥 人员管理</h1>
        <div class="page-subtitle">管理党员、积极分子和团员信息</div>
      </div>
      <div class="header-right">
        <div class="search-box">
          <input 
            v-model="searchKeyword"
            placeholder="搜索姓名或学号"
            class="search-input"
            @input="handleSearch"
          />
        </div>
        <button class="add-button" @click="handleAddMember">
          + 添加成员
        </button>
        <button class="export-button" @click="exportData">
          📥 导出数据
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #1890ff;">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalMembers }}</div>
          <div class="stat-label">总人数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #c7000a;">⭐</div>
        <div class="stat-content">
          <div class="stat-value">{{ partyMemberCount }}</div>
          <div class="stat-label">党员数量</div>
          <div class="stat-detail">(中共党员 + 中共预备党员)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #faad14;">🚀</div>
        <div class="stat-content">
          <div class="stat-value">{{ activistCount }}</div>
          <div class="stat-label">积极分子</div>
          <div class="stat-detail">(入党积极分子 + 积极分子培训结业)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #52c41a;">🔵</div>
        <div class="stat-content">
          <div class="stat-value">{{ leagueMemberCount }}</div>
          <div class="stat-label">团员数量</div>
        </div>
      </div>
    </div>

    <!-- 重要提醒 -->
    <div class="important-reminder" v-if="hasImportantReminders">
      <div class="reminder-header">
        <span class="reminder-icon">⚠️</span>
        <span class="reminder-title">重要提醒</span>
      </div>
      <div class="reminder-content">
        <div v-for="(reminder, index) in importantReminders" :key="index" class="reminder-item">
          <span class="reminder-person">{{ reminder.姓名 }}</span>
          <span class="reminder-separator">：</span>
          <span class="reminder-text">{{ reminder.备注 }}</span>
        </div>
      </div>
    </div>
	
    <!-- 筛选条件 -->
    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-title">筛选条件</div>
        <div class="filter-controls">
          <!-- 政治面貌筛选 -->
          <select v-model="filter.politicalStatus" @change="handleFilter" class="filter-select">
            <option value="">全部政治面貌</option>
            <option value="群众">群众</option>
            <option value="共青团员">共青团员</option>
            <option value="中共预备党员">中共预备党员</option>
            <option value="中共党员">中共党员</option>
          </select>

          <!-- 入党流程阶段筛选 -->
          <select v-model="filter.processStage" @change="handleFilter" class="filter-select">
            <option v-for="option in processStageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>


          <!-- 班级筛选（下拉选择） -->
          <select v-model="filter.className" @change="handleFilter" class="filter-select">
            <option value="">全部班级</option>
            <option v-for="className in classOptions" :key="className" :value="className">
              {{ className }}
            </option>
          </select>

          <select v-model="filter.activityHours" @change="handleFilter" class="filter-select">
            <option value="">活动时数</option>
            <option value="10以下">10小时以下</option>
            <option value="10-20">10-20小时</option>
            <option value="20-50">20-50小时</option>
            <option value="50以上">50小时以上</option>
          </select>

          <button class="reset-button" @click="resetFilters">
            重置筛选
          </button>
        </div>
      </div>
    </div>



    <!-- 成员表格 -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          成员列表
          <span class="table-count">（共 {{ filteredMembers.length }} 人）</span>
        </div>
        <div class="table-actions">
          <button class="action-btn" @click="refreshData">
            🔄 刷新
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="members-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>学号</th>
              <th>姓名</th>
              <th>班级</th>
              <th>政治面貌</th>
              <th>入党流程阶段</th>
              <th>活动时数</th>
              <th>申请入党时间</th>
              <th>重要提醒</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="loading-cell">加载中...</td>
            </tr>
            <tr v-else-if="filteredMembers.length === 0">
              <td colspan="10" class="empty-cell">
                <div class="empty-state">
                  <div class="empty-icon">📭</div>
                  <div class="empty-text">暂无成员数据</div>
                  <button @click="handleAddMember" class="add-first-button">
                    + 添加第一个成员
                  </button>
                </div>
              </td>
            </tr>
            <tr 
              v-for="(member, index) in paginatedMembers" 
              :key="member.学号" 
              :class="getRowClass(member)"
            >
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ member.学号 }}</td>
              <td class="member-name-cell">
                <div class="member-avatar">{{ getAvatarText(member.姓名) }}</div>
                <div class="member-name">
                  <div class="name-text">{{ member.姓名 }}</div>
                  <div class="member-id">ID: {{ member.学号 }}</div>
                </div>
              </td>
              <td>{{ member.班级 }}</td>
              <td>
                <span class="status-tag" :class="getPoliticalStatusClass(member.政治面貌)">
                  {{ formatPoliticalStatus(member.政治面貌) }}
                </span>
              </td>
              <td>
                <span class="status-tag" :class="getProcessStageClass(getProcessStage(member))">
                  {{ getProcessStageDisplay(member) }}
                </span>
              </td>
              <td>
                <div class="activity-hours">
                  <span class="hours-value">{{ member.活动时数 || 0 }}</span>
                  <span class="hours-unit">小时</span>
                </div>
              </td>
              <td>{{ formatDate(member.申请入党时间) }}</td>
              <td class="important-notes">
                <div v-if="member.备注" class="notes-content" :title="member.备注">
                  {{ truncateText(member.备注, 20) }}
                </div>
                <span v-else class="no-notes">-</span>
              </td>
              <td class="action-buttons">
                <button class="action-btn view-btn" @click="handleViewDetail(member)" title="查看详情">
                  详情
                </button>
                <button class="action-btn delete-btn" @click="handleDelete(member)" title="删除">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredMembers.length > 0">
        <div class="pagination">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage <= 1"
            class="pagination-btn prev-btn"
          >
            ← 上一页
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              :class="{ 'active': page === currentPage }"
              class="page-number-btn"
            >
              {{ page }}
            </button>
            <span v-if="showEllipsis" class="page-ellipsis">...</span>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage >= totalPages"
            class="pagination-btn next-btn"
          >
            下一页 →
          </button>
          
          <select v-model="pageSize" @change="handleSizeChange" class="page-size-select">
            <option value="10">10条/页</option>
            <option value="20">20条/页</option>
            <option value="50">50条/页</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="detailVisible" class="modal-overlay" @click="detailVisible = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedMember.姓名 }} - 详细信息</h3>
          <button class="modal-close" @click="detailVisible = false">×</button>
        </div>
        <div class="modal-body">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">姓名：</span>
                <span class="detail-value">{{ selectedMember.姓名 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">学号：</span>
                <span class="detail-value">{{ selectedMember.学号 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">班级：</span>
                <span class="detail-value">{{ selectedMember.班级 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">政治面貌：</span>
                <span class="detail-value">{{ formatPoliticalStatus(selectedMember.政治面貌) || '群众' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">出生日期：</span>
                <span class="detail-value">{{ formatDate(selectedMember.出生年月日) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">入校时间：</span>
                <span class="detail-value">{{ formatDate(selectedMember.入校时间) }}</span>
              </div>
            </div>
          </div>

          <!-- 入党流程信息 -->
          <div class="detail-section">
            <h4 class="section-title">入党流程信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">入党流程阶段：</span>
                <span class="detail-value">{{ getProcessStageDisplay(selectedMember) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">申请入党时间：</span>
                <span class="detail-value">{{ formatDate(selectedMember.申请入党时间) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">申请时年龄：</span>
                <span class="detail-value">{{ selectedMember['递交入党申请书年龄（岁）'] || '-' }} 岁</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">活动时数：</span>
                <span class="detail-value">{{ selectedMember.活动时数 || 0 }} 小时</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">修正党时：</span>
                <span class="detail-value">{{ selectedMember.修正党时 || 0 }} 小时</span>
              </div>
            </div>
          </div>

          <!-- 团员信息 -->
          <div v-if="selectedMember.政治面貌 === '共青团员'" class="detail-section">
            <h4 class="section-title">团员信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">入团时间：</span>
                <span class="detail-value">{{ formatDate(selectedMember.入团时间) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">团员资料备注：</span>
                <span class="detail-value">{{ selectedMember.团员资料备注 || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 考试信息 -->
          <div class="detail-section">
            <h4 class="section-title">考试信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">600题考试成绩：</span>
                <span class="detail-value">{{ selectedMember['600题考试成绩'] || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">600题考试时间：</span>
                <span class="detail-value">{{ formatDate(selectedMember['600题考试时间']) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">积极分子结业成绩：</span>
                <span class="detail-value">{{ selectedMember.积极分子结业成绩 || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">党支部接收时间：</span>
                <span class="detail-value">{{ formatDate(selectedMember['党支部接收入党积极分子时间']) }}</span>
              </div>
            </div>
          </div>

          <!-- 重要提醒 -->
          <div v-if="selectedMember.备注" class="detail-section important-section">
            <h4 class="section-title">重要提醒</h4>
            <div class="important-note">
              {{ selectedMember.备注 }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="detailVisible = false" class="modal-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import membersData from '@/assets/data.json'

console.log('🎯 Members.vue 加载')

// 状态管理
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const selectedMember = ref({})

// 筛选条件
const filter = ref({
  politicalStatus: '',
  processStage: '',
  className: '',
  activityHours: ''
})

// 数据
const members = ref([])

// 格式化政治面貌数据
const formatPoliticalStatus = (status) => {
  if (!status) return '群众'
  if (status === '预备党员') return '中共预备党员'
  if (status === '党员') return '中共党员'
  return status
}

// 入党流程阶段选项
const processStageOptions = [
  { value: '', label: '全部流程阶段' },
  { value: '未申请', label: '未申请' },
  { value: '已提交申请', label: '已提交申请' },
  { value: '通过600题', label: '通过600题' },
  { value: '入党积极分子', label: '入党积极分子' },
  { value: '积极分子培训结业', label: '积极分子培训结业' },
  { value: '已入党', label: '已入党' }
]

// 获取所有班级的去重列表
const classOptions = computed(() => {
  if (!members.value.length) return []
  
  // 获取所有班级，去重，过滤空值，排序
  const classes = members.value
    .map(member => member.班级)
    .filter(className => className && className.trim()) // 过滤空值
    .filter((value, index, self) => self.indexOf(value) === index) // 去重
    .sort((a, b) => {
      // 按班级排序：先按专业，再按年级，最后按班级号
      const parseClass = (className) => {
        if (!className) return { major: '', grade: 0, classNum: 0 }
        
        // 解析类似 "大数据2201" 这样的班级名
        const match = className.match(/([^\d]+)(\d{2})(\d{2})/)
        if (match) {
          return {
            major: match[1],
            grade: parseInt(match[2]),
            classNum: parseInt(match[3])
          }
        }
        return { major: className, grade: 0, classNum: 0 }
      }
      
      const classA = parseClass(a)
      const classB = parseClass(b)
      
      // 先按专业排序
      if (classA.major !== classB.major) {
        return classA.major.localeCompare(classB.major, 'zh-CN')
      }
      
      // 再按年级排序（降序，最新年级在前面）
      if (classA.grade !== classB.grade) {
        return classB.grade - classA.grade
      }
      
      // 最后按班级号排序
      return classA.classNum - classB.classNum
    })
  
  return classes
})

// 获取入党流程阶段（智能判断）
const getProcessStage = (member) => {
  const politicalStatus = formatPoliticalStatus(member.政治面貌)
  const originalProcessStage = member.入党流程阶段 || ''
  
  // 1. 如果政治面貌是中共党员或中共预备党员，则入党流程阶段为"已入党"
  if (politicalStatus === '中共党员' || politicalStatus === '中共预备党员') {
    return '已入党'
  }
  
  // 2. 如果有积极分子培训班结业相关数据
  if (originalProcessStage === '积极分子培训结业' || 
      originalProcessStage === '积极分子培训班结业') {
    return '积极分子培训结业'
  }
  
  // 3. 如果是入党积极分子
  if (originalProcessStage === '入党积极分子') {
    return '入党积极分子'
  }
  
  // 4. 判断是否通过600题考试
  const hasPassed600Exam = member['600题考试成绩'] && member['600题考试时间']
  if (hasPassed600Exam) {
    return '通过600题'
  }
  
  // 5. 如果有申请入党时间，则为"已提交申请"
  if (member.申请入党时间) {
    return '已提交申请'
  }
  
  // 6. 剩余入党流程阶段空的，默认未申请
  return '未申请'
}

// 获取显示的入党流程阶段文本
const getProcessStageDisplay = (member) => {
  const stage = getProcessStage(member)
  
  // 如果已经是"已入党"，根据政治面貌显示具体身份
  if (stage === '已入党') {
    const politicalStatus = formatPoliticalStatus(member.政治面貌)
    return politicalStatus === '中共党员' ? '中共党员' : '中共预备党员'
  }
  
  // 如果数据中已有特定的流程阶段，优先显示
  if (member.入党流程阶段 && stage !== '通过600题') {
    return member.入党流程阶段
  }
  
  // 显示计算出的流程阶段
  return stage
}

// 统计计算
const totalMembers = computed(() => members.value.length)

// 党员数量：中共党员和中共预备党员都属于党员
const partyMemberCount = computed(() => {
  return members.value.filter(member => {
    const politicalStatus = formatPoliticalStatus(member.政治面貌)
    return politicalStatus === '中共党员' || politicalStatus === '中共预备党员'
  }).length
})

// 积极分子数量：入党积极分子和积极分子培训结业
const activistCount = computed(() => {
  return members.value.filter(member => {
    const stage = getProcessStage(member)
    return stage === '入党积极分子' || stage === '积极分子培训结业'
  }).length
})

// 团员数量
const leagueMemberCount = computed(() => {
  return members.value.filter(member => formatPoliticalStatus(member.政治面貌) === '共青团员').length
})

// 重要提醒：有备注信息的成员
const importantReminders = computed(() => {
  return members.value.filter(member => {
    const remark = member.备注 || ''
    return remark.trim().length > 0
  }).map(member => ({
    姓名: member.姓名,
    备注: member.备注
  }))
})

const hasImportantReminders = computed(() => importantReminders.value.length > 0)

// 初始化数据
const initData = () => {
  loading.value = true
  try {
    setTimeout(() => {
      members.value = Array.isArray(membersData) ? [...membersData] : []
      console.log('✅ 加载成员数据:', members.value.length, '条')
      
      // 处理数据：去除时间字段的 .0
      members.value = members.value.map(member => {
        const processedMember = { ...member }
        
        // 处理所有时间字段，去除 .0
        const dateFields = [
          '入团时间',
          '出生年月日',
          '入校时间',
          '申请入党时间',
          '600题考试时间',
          '党支部接收入党积极分子时间'
        ]
        
        dateFields.forEach(field => {
          if (processedMember[field] && typeof processedMember[field] === 'string') {
            // 去除 .0
            processedMember[field] = processedMember[field].replace(/\.0$/, '')
          }
        })
        
        // 设置默认值
        return {
          ...processedMember,
          活动时数: processedMember.活动时数 || 0,
          修正党时: processedMember.修正党时 || 0,
          政治面貌: processedMember.政治面貌 || '群众',
          入党流程阶段: processedMember.入党流程阶段 || ''
        }
      })
      
      // 调试输出班级信息
      console.log('🏫 班级列表:', classOptions.value)
      console.log('🚀 流程阶段计算示例：')
      members.value.slice(0, 3).forEach((member, index) => {
        console.log(`${index + 1}. ${member.姓名}:`, {
          班级: member.班级,
          政治面貌: member.政治面貌,
          原始流程阶段: member.入党流程阶段,
          '600题成绩': member['600题考试成绩'],
          '600题时间': member['600题考试时间'],
          申请时间: member.申请入党时间,
          计算流程阶段: getProcessStage(member),
          显示文本: getProcessStageDisplay(member)
        })
      })
      
      loading.value = false
    }, 300)
  } catch (error) {
    console.error('❌ 数据加载失败:', error)
    loading.value = false
  }
}

// 搜索和筛选
const filteredMembers = computed(() => {
  let result = members.value

  // 关键字搜索（只搜索姓名和学号，不再搜索班级）
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(member => {
      return (
        (member.姓名 || '').toLowerCase().includes(keyword) ||
        (member.学号 || '').toString().includes(keyword)
      )
    })
  }

  // 政治面貌筛选
  if (filter.value.politicalStatus) {
    result = result.filter(member => {
      const politicalStatus = formatPoliticalStatus(member.政治面貌)
      return politicalStatus === filter.value.politicalStatus
    })
  }

  // 入党流程阶段筛选
  if (filter.value.processStage) {
    result = result.filter(member => {
      const stage = getProcessStage(member)
      
      // 特殊处理"已入党"筛选
      if (filter.value.processStage === '已入党') {
        return stage === '已入党'
      }
      
      // 其他情况正常筛选
      return stage === filter.value.processStage
    })
  }

  // 班级筛选（直接匹配）
  if (filter.value.className) {
    result = result.filter(member => 
      member.班级 === filter.value.className
    )
  }

  // 活动时数筛选
  if (filter.value.activityHours) {
    const hoursRange = filter.value.activityHours
    result = result.filter(member => {
      const hours = parseFloat(member.活动时数) || 0
      switch (hoursRange) {
        case '10以下': return hours < 10
        case '10-20': return hours >= 10 && hours <= 20
        case '20-50': return hours > 20 && hours <= 50
        case '50以上': return hours > 50
        default: return true
      }
    })
  }

  return result
})

// 分页数据
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMembers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMembers.value.length / pageSize.value)
})

// 可见页码
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const showEllipsis = computed(() => totalPages.value > visiblePages.value.length)

// 辅助函数
const getAvatarText = (name) => {
  if (!name) return '?'
  return name.charAt(0)
}

const getRowClass = (member) => {
  const politicalStatus = formatPoliticalStatus(member.政治面貌)
  const processStage = getProcessStage(member)
  
  if (politicalStatus === '中共党员') return 'party-member-row'
  if (politicalStatus === '中共预备党员') return 'reserve-member-row'
  if (processStage === '入党积极分子' || processStage === '积极分子培训结业') return 'activist-row'
  return ''
}

const getPoliticalStatusClass = (status) => {
  const formattedStatus = formatPoliticalStatus(status)
  const classes = {
    '中共党员': 'tag-party-member',
    '中共预备党员': 'tag-reserve-member',
    '共青团员': 'tag-league-member',
    '群众': 'tag-masses'
  }
  return classes[formattedStatus] || 'tag-masses'
}

const getProcessStageClass = (stage) => {
  const classes = {
    '已入党': 'tag-formal-member',
    '入党积极分子': 'tag-activist',
    '积极分子培训结业': 'tag-activist-graduation',
    '通过600题': 'tag-exam-passed',
    '已提交申请': 'tag-applied',
    '未申请': 'tag-not-applied'
  }
  return classes[stage] || 'tag-not-applied'
}

const formatDate = (date) => {
  if (!date) return '-'
  
  // 如果日期是数字格式，转换为字符串
  let dateStr = date.toString()
  
  // 去除 .0
  dateStr = dateStr.replace(/\.0$/, '')
  
  // 如果日期是8位数字格式（如20251218），格式化为YYYY-MM-DD
  if (/^\d{8}$/.test(dateStr)) {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${year}-${month}-${day}`
  }
  
  // 尝试解析其他格式的日期
  try {
    // 如果已经是ISO格式或其他可解析格式
    const dateObj = new Date(dateStr)
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  } catch {
    // 解析失败，返回原始字符串
  }
  
  return dateStr
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = () => {
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handleViewDetail = (member) => {
  selectedMember.value = { ...member }
  detailVisible.value = true
}

const handleAddMember = () => {
  alert('添加新成员 - 功能待实现')
}

const handleDelete = (member) => {
  if (confirm(`确定要删除 ${member.姓名} (学号: ${member.学号}) 吗？`)) {
    const index = members.value.findIndex(m => m.学号 === member.学号)
    if (index > -1) {
      members.value.splice(index, 1)
      alert('删除成功')
      if (paginatedMembers.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
      }
    }
  }
}

const exportData = () => {
  const dataStr = JSON.stringify(members.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `党建管理系统-成员数据-${new Date().toLocaleDateString()}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  alert('数据导出成功！')
}

const resetFilters = () => {
  filter.value = {
    politicalStatus: '',
    processStage: '',
    className: '',
    activityHours: ''
  }
  searchKeyword.value = ''
  currentPage.value = 1
}

const refreshData = () => {
  initData()
  alert('数据已刷新！')
}

// 生命周期
onMounted(() => {
  initData()
})
</script>

<style scoped>
/* 基础样式 */
.members-management {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* 顶部标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left .page-title {
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
  padding: 10px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.add-button {
  padding: 10px 20px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-button:hover {
  background: #ff4d4f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.2);
}

.export-button {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.export-button:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: currentColor;
  opacity: 0.3;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 2px;
}

.stat-detail {
  font-size: 12px;
  color: #999;
}

/* 重要提醒 */
.important-reminder {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1cc 100%);
  border: 1px solid #ffd591;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.reminder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.reminder-icon {
  font-size: 20px;
}

.reminder-title {
  font-weight: 600;
  color: #d46b08;
  font-size: 16px;
}

.reminder-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px dashed #ffd591;
}

.reminder-item:last-child {
  border-bottom: none;
}

.reminder-person {
  font-weight: 600;
  color: #d46b08;
  min-width: 60px;
}

.reminder-separator {
  color: #d46b08;
}

.reminder-text {
  color: #874d00;
  flex: 1;
  line-height: 1.4;
}

/* 筛选条件 */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.filter-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a1a;
  font-size: 15px;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-select,
.filter-input {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
  background: white;
  transition: all 0.3s;
}

.filter-input {
  flex: 1;
  max-width: 200px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.reset-button {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.reset-button:hover {
  background: #e8e8e8;
  color: #333;
}

/* 表格 */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.table-count {
  font-size: 14px;
  color: #666;
  font-weight: normal;
  margin-left: 8px;
}

.table-actions .action-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.members-table th {
  background: #fafafa;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #1a1a1a;
  border-bottom: 2px solid #f0f0f0;
  white-space: nowrap;
}

.members-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.members-table tr:hover {
  background: #fafafa;
}

/* 特殊行样式 */
.party-member-row {
  background: #f6ffed !important;
}

.party-member-row:hover {
  background: #e6ffd9 !important;
}

.reserve-member-row {
  background: #fff7e6 !important;
}

.reserve-member-row:hover {
  background: #ffefcc !important;
}

.activist-row {
  background: #e6f7ff !important;
}

.activist-row:hover {
  background: #cceeff !important;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 60px 20px !important;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #999;
}

.member-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.member-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-text {
  font-weight: 600;
  color: #1a1a1a;
}

.member-id {
  font-size: 12px;
  color: #999;
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}

.tag-party-member {
  background: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.tag-reserve-member {
  background: #fff7e6;
  color: #fa8c16;
  border-color: #ffd591;
}

.tag-activist,
.tag-activist-graduation {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.tag-exam-passed {
  background: #f0f5ff;
  color: #2f54eb;
  border-color: #adc6ff;
}

.tag-league-member {
  background: #f0f5ff;
  color: #2f54eb;
  border-color: #adc6ff;
}

.tag-masses {
  background: #fafafa;
  color: #666;
  border-color: #d9d9d9;
}

.tag-formal-member {
  background: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.tag-applied {
  background: #f0f5ff;
  color: #2f54eb;
  border-color: #adc6ff;
}

.tag-not-applied {
  background: #fafafa;
  color: #999;
  border-color: #d9d9d9;
}

.activity-hours {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.hours-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
}

.hours-unit {
  font-size: 12px;
  color: #999;
}

.important-notes {
  max-width: 200px;
}

.notes-content {
  padding: 8px 12px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  color: #d46b08;
  font-size: 13px;
  line-height: 1.4;
  cursor: help;
  position: relative;
  transition: all 0.3s;
}

.notes-content:hover {
  background: #fff1cc;
  box-shadow: 0 2px 8px rgba(255, 213, 145, 0.3);
}

.no-notes {
  color: #999;
  font-style: italic;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  min-width: 140px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.view-btn {
  background: #e6f7ff;
  color: #1890ff;
}

.delete-btn {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-first-button {
  padding: 10px 24px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-first-button:hover {
  background: #ff4d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.2);
}

/* 分页 */
.pagination-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.pagination-btn:not(:disabled):hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-number-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-number-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-number-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-ellipsis {
  color: #999;
  padding: 0 8px;
}

.page-size-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

/* 模态框 */
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
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  color: #1a1a1a;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #666;
  font-size: 14px;
}

.detail-value {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 15px;
}

.important-section {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 20px;
}

.important-note {
  color: #874d00;
  line-height: 1.6;
  padding: 12px;
  background: rgba(255, 213, 145, 0.2);
  border-radius: 6px;
  border-left: 4px solid #ffa940;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 10px 24px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.modal-btn:hover {
  background: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .members-table {
    font-size: 13px;
  }
  
  .members-table th,
  .members-table td {
    padding: 12px 8px;
  }
}

@media (max-width: 992px) {
  .members-table {
    display: block;
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .members-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
  }
  
  .header-right {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls > * {
    width: 100%;
  }
  
  .table-card {
    padding: 16px;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>