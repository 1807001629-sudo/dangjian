<template>
  <div class="members-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">人员管理</h1>
        <p class="page-description">管理系统中的所有成员信息</p>
      </div>
      <div class="header-right">
        <!-- 积极分子查询按钮 -->
        <button class="btn-activist-query" @click="openActivistQuery">
          <span class="btn-icon">🔍</span>
          一键查询积极分子
        </button>
        <button class="btn-refresh" @click="refreshData">
          <span class="btn-icon">🔄</span>
          刷新
        </button>
        <button class="btn-export" @click="exportData">
          <span class="btn-icon">📥</span>
          导出
        </button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">总人数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-value">{{ activistCount }}</div>
          <div class="stat-label">积极分子</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-value">{{ partyMemberCount }}</div>
          <div class="stat-label">中共党员</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ classCount }}</div>
          <div class="stat-label">班级数量</div>
        </div>
      </div>
    </div>
    
    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="search-box">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索姓名、学号或班级..."
          class="search-input"
          @input="handleSearch"
        />
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filter-group">
        <select v-model="selectedClass" class="filter-select" @change="handleFilter">
          <option value="">全部班级</option>
          <option v-for="className in uniqueClasses" :key="className" :value="className">
            {{ className }}
          </option>
        </select>
        
        <select v-model="selectedStatus" class="filter-select" @change="handleFilter">
          <option value="">全部政治面貌</option>
          <option value="中共党员">中共党员</option>
          <option value="中共预备党员">中共预备党员</option>
          <option value="共青团员">共青团员</option>
          <option value="群众">群众</option>
        </select>
        
        <select v-model="selectedProcessStage" class="filter-select" @change="handleFilter">
          <option value="">全部入党阶段</option>
          <option value="入党申请人">入党申请人</option>
          <option value="通过600题">通过600题</option>
          <option value="入党积极分子">入党积极分子</option>
          <option value="积极分子培训结业">积极分子培训结业</option>
          <option value="未开始">未开始</option>
        </select>
      </div>
      
      <div class="action-buttons">
        <button class="btn-reset" @click="resetFilters">重置筛选</button>
      </div>
    </div>
    
    <!-- 成员表格 -->
    <div class="members-table-container">
      <div class="table-header">
        <div class="table-info">
          共 {{ filteredMembers.length }} 条记录
          <span v-if="filteredMembers.length !== members.length" class="filtered-info">
            (已筛选)
          </span>
        </div>
        <div class="table-actions">
          <button class="btn-action" @click="toggleSort('姓名')">
            按姓名 {{ sortBy === '姓名' ? (sortAsc ? '↑' : '↓') : '' }}
          </button>
          <button class="btn-action" @click="toggleSort('班级')">
            按班级 {{ sortBy === '班级' ? (sortAsc ? '↑' : '↓') : '' }}
          </button>
          <button class="btn-action" @click="toggleSort('活动时数')">
            按时数 {{ sortBy === '活动时数' ? (sortAsc ? '↑' : '↓') : '' }}
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="members-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>姓名</th>
              <th>学号</th>
              <th>班级</th>
              <th>政治面貌</th>
              <th>入党阶段</th>
              <th>活动时数</th>
              <th>600题成绩</th>
              <th>四级成绩</th>
              <th>计算机二级</th>
              <th>不及格情况</th>
              <th>综测百分比</th>
              <th>积极分子时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredMembers.length === 0">
              <td colspan="14" class="empty-table">
                <div class="empty-icon">📭</div>
                <p>暂无符合条件的成员数据</p>
              </td>
            </tr>
            <tr v-else v-for="(member, index) in sortedMembers" :key="member.id">
              <td class="center">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>
                <div class="member-name">
                  <div class="avatar-small" :style="{ background: getAvatarColor(member.姓名) }">
                    {{ getInitials(member.姓名) }}
                  </div>
                  <span>{{ member.姓名 }}</span>
                </div>
              </td>
              <td>{{ member.学号 }}</td>
              <td>{{ member.班级 }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(member.政治面貌)">
                  {{ member.政治面貌 }}
                </span>
              </td>
              <td>
                <span class="stage-badge" :class="getStageClass(member.入党流程阶段)">
                  {{ member.入党流程阶段 || '未开始' }}
                </span>
              </td>
              <td>
                <span v-if="member.活动时数 === ''" class="no-data">-</span>
                <span v-else :class="getHoursClass(member.活动时数)">
                  {{ member.活动时数 }}
                </span>
              </td>
              <td>
                <span :class="get600ScoreClass(member['600题考试成绩'], member.入党流程阶段)">
                  {{ format600Score(member['600题考试成绩'], member.入党流程阶段) }}
                </span>
              </td>
              <td>
                <span v-if="member.四级成绩 === 0" class="no-data">-</span>
                <span v-else :class="getCET4Class(member.四级成绩)">
                  {{ member.四级成绩 }}
                </span>
              </td>
              <td>
                <span v-if="member.计算机二级 === 0" class="no-data">-</span>
                <span v-else :class="getComputerClass(member.计算机二级, member.班级)">
                  {{ member.计算机二级 }}
                </span>
              </td>
              <td>
                <span :class="getFailureClass(member.不及格情况)">
                  {{ member.不及格情况 }}
                </span>
              </td>
              <td>
                <span v-if="!member.前一学年综测百分比" class="no-data">-</span>
                <span v-else :class="getPercentageClass(member.前一学年综测百分比, member.班级)">
                  {{ member.前一学年综测百分比 }}
                </span>
              </td>
              <td>
                <span v-if="!member['党支部接收入党积极分子时间']" class="no-data">-</span>
                <span v-else class="date-info">
                  {{ formatDisplayDate(member['党支部接收入党积极分子时间']) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-view" @click="viewMemberDetail(member)">
                    详情
                  </button>
                  <button 
                    v-if="member.入党流程阶段 === '积极分子培训结业'" 
                    class="btn-check" 
                    @click="checkQualification(member)"
                  >
                    检查资格
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="filteredMembers.length > pageSize">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
        <span class="page-size">
          每页显示
          <select v-model="pageSize" @change="currentPage = 1">
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          条
        </span>
      </div>
    </div>
    
    <!-- 积极分子查询模态框 -->
    <div v-if="showActivistQuery" class="modal-overlay" @click.self="closeActivistQuery">
      <div class="query-modal">
        <div class="modal-header">
          <div class="header-left">
            <h3 class="modal-title">积极分子资格查询</h3>
            <div class="modal-subtitle">可配置条件筛选符合条件的积极分子</div>
          </div>
          <div class="header-right">
            <span class="date-info">当前日期: {{ currentDate }}</span>
            <button class="modal-close" @click="closeActivistQuery">×</button>
          </div>
        </div>
        
        <div class="modal-content">
          <!-- 查询条件配置 -->
          <div class="criteria-config-section">
            <h4 class="section-title">查询条件配置</h4>
            <div class="criteria-config">
              <!-- 基本前提条件 -->
              <div class="config-row prerequisite">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.checkPrerequisite" disabled />
                  <span class="config-text">
                    <span class="prerequisite-mark">★</span>
                    基本前提条件
                  </span>
                </label>
                <div class="config-help">
                  政治面貌为共青团员且入党阶段为积极分子培训结业
                </div>
              </div>
              
              <div class="config-divider"></div>
              
              <!-- 可配置条件 -->
              <div class="config-row">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.checkFullYear" />
                  <span class="config-text">党支部接收入党积极分子时间满一年</span>
                </label>
                <div class="config-help">
                  检查党支部接收入党积极分子时间至今是否满365天
                </div>
              </div>
              
              <div class="config-row">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.checkCET4" />
                  <span class="config-text">英语四级成绩 ≥ 425分</span>
                </label>
                <div class="config-help">
                  检查英语四级成绩是否达标
                </div>
              </div>
              
              <div class="config-row">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.checkComputer" />
                  <span class="config-text">计算机二级要求</span>
                </label>
                <div class="config-help">
                  大数据专业不要求，高分子专业需 ≥ 60分
                </div>
              </div>
              
              <div class="config-row">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.checkFailures" />
                  <span class="config-text">无不及格情况</span>
                </label>
                <div class="config-help">
                  检查是否有不及格记录
                </div>
              </div>
              
              <div class="config-row">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.checkComprehensive" />
                  <span class="config-text">综测百分比要求</span>
                </label>
                <div class="config-help">
                  大二: 专业前40% | 大三: 专业前50% | 大四: 专业前60%
                </div>
              </div>
              
              <div class="config-row">
                <label class="config-label">
                  <input type="checkbox" v-model="queryOptions.strictMode" @change="handleStrictModeChange" />
                  <span class="config-text">严格模式</span>
                </label>
                <div class="config-help">
                  自动选择所有筛选条件进行严格筛选
                </div>
              </div>
              
              <div class="config-summary">
                <div class="summary-item">
                  <span class="summary-label">基本前提:</span>
                  <span class="summary-value prerequisite-value">共青团员+培训结业</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">已选择条件:</span>
                  <span class="summary-value">{{ enabledCriteriaCount }} 个</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">查询模式:</span>
                  <span class="summary-value">{{ queryOptions.strictMode ? '严格模式' : '普通模式' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 查询按钮 -->
          <div class="query-actions">
            <button class="btn-query" @click="performActivistQuery">
              <span class="btn-icon">🔍</span>
              一键查询符合条件的积极分子
            </button>
            <div class="query-info">
              基本前提：政治面貌共青团员+积极分子培训结业，并筛选已选择的 {{ enabledCriteriaCount }} 项条件
            </div>
          </div>
          
          <!-- 查询结果 -->
          <div class="results-section">
            <div class="results-header">
              <h4>查询结果</h4>
              <div class="results-summary">
                <span class="total-count">共 {{ qualifiedMembers.length }} 人符合条件</span>
                <div class="results-actions">
                  <button 
                    v-if="qualifiedMembers.length > 0" 
                    class="btn-export-results" 
                    @click="exportQualifiedMembers"
                  >
                    <span class="export-icon">📊</span>
                    导出Excel
                  </button>
                  <button 
                    class="btn-reset-criteria"
                    @click="resetQueryOptions"
                  >
                    <span class="reset-icon">🔄</span>
                    重置条件
                  </button>
                </div>
              </div>
            </div>
            
            <div class="results-container">
              <div v-if="qualifiedMembers.length === 0" class="empty-results">
                <div class="empty-icon">📭</div>
                <p>暂无符合条件的积极分子</p>
                <p class="empty-tip">{{ queryMessage || '请配置查询条件并点击查询按钮' }}</p>
              </div>
              
              <div v-else class="results-table">
                <div class="table-header">
                  <div class="table-info">
                    查询条件: 
                    <span class="conditions-display">
                      <span class="condition-tag prerequisite-tag">
                        共青团员+培训结业
                      </span>
                      <span v-for="condition in enabledCriteriaList" :key="condition" class="condition-tag">
                        {{ condition }}
                      </span>
                    </span>
                  </div>
                  <div class="table-actions">
                    <button class="btn-action" @click="toggleResultsSort('姓名')">
                      姓名 {{ sortResultsBy === '姓名' ? (sortResultsAsc ? '↑' : '↓') : '' }}
                    </button>
                    <button class="btn-action" @click="toggleResultsSort('班级')">
                      班级 {{ sortResultsBy === '班级' ? (sortResultsAsc ? '↑' : '↓') : '' }}
                    </button>
                    <button class="btn-action" @click="toggleResultsSort('四级成绩')">
                      四级 {{ sortResultsBy === '四级成绩' ? (sortResultsAsc ? '↑' : '↓') : '' }}
                    </button>
                  </div>
                </div>
                
                <div class="table-container">
                  <table class="qualified-table">
                    <thead>
                      <tr>
                        <th>姓名</th>
                        <th>学号</th>
                        <th>班级</th>
                        <th>政治面貌</th>
                        <th>入党阶段</th>
                        <th>四级成绩</th>
                        <th>计算机二级</th>
                        <th>不及格情况</th>
                        <th>综测百分比</th>
                        <th>积极分子时间</th>
                        <th>满一年天数</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="member in sortedQualifiedMembers" :key="member.学号">
                        <td class="member-name">
                          <div class="name-cell">
                            <div class="avatar-small" :style="{ background: getAvatarColor(member.姓名) }">
                              {{ getInitials(member.姓名) }}
                            </div>
                            <span>{{ member.姓名 }}</span>
                          </div>
                        </td>
                        <td>{{ member.学号 }}</td>
                        <td>{{ member.班级 }}</td>
                        <td>
                          <span class="status-badge" :class="getStatusClass(member.政治面貌)">
                            {{ member.政治面貌 }}
                          </span>
                        </td>
                        <td>
                          <span class="stage-badge" :class="getStageClass(member.入党流程阶段)">
                            {{ member.入党流程阶段 || '未开始' }}
                          </span>
                        </td>
                        <td>
                          <span :class="getCET4Class(member.四级成绩)">
                            {{ member.四级成绩 || '-' }}
                          </span>
                        </td>
                        <td>
                          <span :class="getComputerClass(member.计算机二级, member.班级)">
                            {{ member.计算机二级 || '-' }}
                          </span>
                        </td>
                        <td>
                          <span :class="getFailureClass(member.不及格情况)">
                            {{ member.不及格情况 }}
                          </span>
                        </td>
                        <td>
                          <span :class="getPercentageClass(member.前一学年综测百分比, member.班级)">
                            {{ member.前一学年综测百分比 || '-' }}
                          </span>
                        </td>
                        <td>
                          {{ formatDisplayDate(member['党支部接收入党积极分子时间']) }}
                        </td>
                        <td>
                          <span :class="getDaysClass(getDaysSinceActivist(member))">
                            {{ getDaysSinceActivist(member) }} 天
                          </span>
                        </td>
                        <td>
                          <button class="btn-view-detail" @click="viewMemberDetail(member)">
                            详情
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="footer-info">
            <div class="info-item">
              <span class="info-label">查询时间:</span>
              <span class="info-value">{{ queryTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">积极分子总数:</span>
              <span class="info-value">{{ activistCount }} 人</span>
            </div>
            <div class="info-item">
              <span class="info-label">符合条件:</span>
              <span class="info-value">{{ qualifiedMembers.length }} 人</span>
            </div>
            <div class="info-item">
              <span class="info-label">启用的条件:</span>
              <span class="info-value">{{ enabledCriteriaCount }} 个</span>
            </div>
          </div>
          <button class="btn-close-modal" @click="closeActivistQuery">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 成员详情模态框 -->
    <MemberDetailModal
      v-if="showMemberDetailModal"
      :member="selectedMember"
      @close="closeMemberDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import MemberDetailModal from '@/components/modals/MemberDetailModal.vue'
import membersData from '@/assets/data.json'
import { 
  parseExcelData, 
  oneClickActivistQuery, 
  getDaysSinceActivist,
  formatDisplayDate 
} from '@/utils/dataParser.js'

// 响应式数据
const members = ref([])
const searchText = ref('')
const selectedClass = ref('')
const selectedStatus = ref('')
const selectedProcessStage = ref('')
const sortBy = ref('id')
const sortAsc = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)

// 积极分子查询相关
const showActivistQuery = ref(false)
const qualifiedMembers = ref([])
const queryTime = ref('')
const currentDate = ref('')
const queryMessage = ref('')

// 查询选项配置
const queryOptions = ref({
  checkPrerequisite: true,   // 基本前提条件（不可关闭）
  checkFullYear: false,      // 检查满一年
  checkCET4: false,          // 检查四级
  checkComputer: false,      // 检查计算机二级
  checkFailures: false,      // 检查不及格情况
  checkComprehensive: false, // 检查综测
  strictMode: false          // 严格模式
})

// 结果排序
const sortResultsBy = ref('姓名')
const sortResultsAsc = ref(true)

// 成员详情相关
const showMemberDetailModal = ref(false)
const selectedMember = ref(null)

// 计算属性
const totalCount = computed(() => members.value.length)

const activistCount = computed(() => {
  return members.value.filter(member => 
    member.入党流程阶段 === '积极分子培训结业' || 
    member.入党流程阶段 === '入党积极分子'
  ).length
})

const partyMemberCount = computed(() => {
  return members.value.filter(member => 
    member.政治面貌 === '中共党员'
  ).length
})

const classCount = computed(() => {
  const classes = new Set()
  members.value.forEach(member => {
    if (member.班级) classes.add(member.班级)
  })
  return classes.size
})

const uniqueClasses = computed(() => {
  const classes = new Set()
  members.value.forEach(member => {
    if (member.班级) classes.add(member.班级)
  })
  return Array.from(classes).sort()
})

const filteredMembers = computed(() => {
  let result = members.value
  
  // 搜索筛选
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    result = result.filter(member => 
      (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
      (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
      (member.班级 && member.班级.toLowerCase().includes(search))
    )
  }
  
  // 班级筛选
  if (selectedClass.value) {
    result = result.filter(member => member.班级 === selectedClass.value)
  }
  
  // 政治面貌筛选
  if (selectedStatus.value) {
    result = result.filter(member => member.政治面貌 === selectedStatus.value)
  }
  
  // 入党阶段筛选（移除中共预备党员和中共党员选项）
  if (selectedProcessStage.value) {
    if (selectedProcessStage.value === '未开始') {
      result = result.filter(member => !member.入党流程阶段 || member.入党流程阶段 === '')
    } else {
      result = result.filter(member => member.入党流程阶段 === selectedProcessStage.value)
    }
  }
  
  return result
})

const sortedMembers = computed(() => {
  const sorted = [...filteredMembers.value]
  
  sorted.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    // 处理空值
    if (aVal === '' || aVal === undefined) aVal = 0
    if (bVal === '' || bVal === undefined) bVal = 0
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc.value ? 
        aVal.localeCompare(bVal) : 
        bVal.localeCompare(aVal)
    } else {
      return sortAsc.value ? 
        (aVal - bVal) : 
        (bVal - aVal)
    }
  })
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sorted.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMembers.value.length / pageSize.value)
})

// 积极分子查询相关计算属性
const enabledCriteriaCount = computed(() => {
  const options = queryOptions.value
  return [
    options.checkFullYear,
    options.checkCET4,
    options.checkComputer,
    options.checkFailures,
    options.checkComprehensive
  ].filter(v => v).length
})

const enabledCriteriaList = computed(() => {
  const list = []
  const options = queryOptions.value
  
  if (options.checkFullYear) list.push('满一年')
  if (options.checkCET4) list.push('四级达标')
  if (options.checkComputer) list.push('计算机二级')
  if (options.checkFailures) list.push('无不及格')
  if (options.checkComprehensive) list.push('综测达标')
  
  return list
})

const sortedQualifiedMembers = computed(() => {
  const sorted = [...qualifiedMembers.value]
  
  sorted.sort((a, b) => {
    let aVal = a[sortResultsBy.value]
    let bVal = b[sortResultsBy.value]
    
    // 处理空值
    if (aVal === '' || aVal === undefined) aVal = 0
    if (bVal === '' || bVal === undefined) bVal = 0
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortResultsAsc.value ? 
        aVal.localeCompare(bVal) : 
        bVal.localeCompare(aVal)
    } else {
      return sortResultsAsc.value ? 
        (aVal - bVal) : 
        (bVal - aVal)
    }
  })
  
  return sorted
})

// 初始化数据
onMounted(() => {
  console.log('Members.vue 加载')
  
  try {
    // 解析数据
    const parsedData = parseExcelData(membersData)
    members.value = parsedData.members
    console.log('加载了', members.value.length, '条成员数据')
    
    // 设置当前日期
    const now = new Date()
    currentDate.value = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
  } catch (error) {
    console.error('数据加载失败:', error)
    members.value = []
  }
})

// 监听严格模式变化
const handleStrictModeChange = () => {
  if (queryOptions.value.strictMode) {
    // 严格模式：自动选择所有条件
    queryOptions.value.checkFullYear = true
    queryOptions.value.checkCET4 = true
    queryOptions.value.checkComputer = true
    queryOptions.value.checkFailures = true
    queryOptions.value.checkComprehensive = true
  }
}

// 监听各个条件变化，如果所有条件都选中了，自动开启严格模式
watch(() => [
  queryOptions.value.checkFullYear,
  queryOptions.value.checkCET4,
  queryOptions.value.checkComputer,
  queryOptions.value.checkFailures,
  queryOptions.value.checkComprehensive
], (newValues) => {
  const allSelected = newValues.every(v => v === true)
  if (allSelected && !queryOptions.value.strictMode) {
    queryOptions.value.strictMode = true
  } else if (!allSelected && queryOptions.value.strictMode) {
    queryOptions.value.strictMode = false
  }
}, { deep: true })

// 工具函数
const getInitials = (name) => {
  if (!name || name.length < 2) return name || '??'
  return name.slice(-2)  // 修改：使用名字后两个字
}

const getAvatarColor = (name) => {
  const colors = [
    '#c7000a', '#ff4d4f', '#ff7a45', '#ffa940', '#faad14',
    '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb',
    '#722ed1', '#eb2f96'
  ]
  const index = name ? name.charCodeAt(0) % colors.length : 0
  return colors[index]
}

// 600题成绩特殊处理
const format600Score = (score, stage) => {
  const advancedStages = ['入党积极分子', '积极分子培训结业', '中共预备党员', '中共党员']
  
  // 如果是积极分子及之后的阶段，且成绩为0或空，则默认显示"通过"
  if (advancedStages.includes(stage) && (score === 0 || score === '')) {
    return '通过'
  }
  
  // 否则正常显示
  if (score === 0 || score === '') return '-'
  return score
}

const get600ScoreClass = (score, stage) => {
  const advancedStages = ['入党积极分子', '积极分子培训结业', '中共预备党员', '中共党员']
  
  // 如果是积极分子及之后的阶段，且成绩为0或空，则默认显示"通过"样式
  if (advancedStages.includes(stage) && (score === 0 || score === '')) {
    return 'score-pass'
  }
  
  // 否则根据分数判断样式
  if (score === 0 || score === '') return 'score-empty'
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

const getStatusClass = (status) => {
  const classes = {
    '中共党员': 'status-party',
    '中共预备党员': 'status-candidate',
    '共青团员': 'status-youth',
    '群众': 'status-masses'
  }
  return classes[status] || 'status-masses'
}

const getStageClass = (stage) => {
  const classes = {
    '入党申请人': 'stage-applicant',
    '通过600题': 'stage-passed600',
    '入党积极分子': 'stage-activist',
    '积极分子培训结业': 'stage-graduate',
    '未开始': 'stage-none'
  }
  return classes[stage] || 'stage-none'
}

const getHoursClass = (hours) => {
  if (hours === '') return 'hours-empty'
  const num = parseFloat(hours)
  if (num >= 100) return 'hours-excellent'
  if (num >= 50) return 'hours-good'
  if (num >= 20) return 'hours-normal'
  return 'hours-low'
}

const getCET4Class = (score) => {
  if (score === 0) return 'cet-empty'
  if (score >= 425) return 'cet-pass'
  return 'cet-fail'
}

const getComputerClass = (score, className) => {
  if (score === 0) return 'computer-empty'
  if (className && className.includes('大数据')) return 'computer-exempt'
  if (score >= 60) return 'computer-pass'
  return 'computer-fail'
}

const getFailureClass = (failure) => {
  if (failure === '无' || !failure) return 'failure-none'
  return 'failure-has'
}

const getPercentageClass = (percentage, className) => {
  if (!percentage) return 'percentage-empty'
  
  const percentNum = parseFloat(percentage.replace('%', ''))
  let gradeLevel = 0
  
  if (className && (className.includes('大二') || /22/.test(className))) {
    gradeLevel = 2
  } else if (className && (className.includes('大三') || /21/.test(className))) {
    gradeLevel = 3
  } else if (className && (className.includes('大四') || /20/.test(className))) {
    gradeLevel = 4
  }
  
  let maxPercent = 100
  switch(gradeLevel) {
    case 2: maxPercent = 40; break
    case 3: maxPercent = 50; break
    case 4: maxPercent = 60; break
  }
  
  if (percentNum <= maxPercent) return 'percentage-pass'
  return 'percentage-fail'
}

const getDaysClass = (days) => {
  if (days >= 365) return 'days-enough'
  return 'days-not-enough'
}

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchText.value = ''
  selectedClass.value = ''
  selectedStatus.value = ''
  selectedProcessStage.value = ''
  currentPage.value = 1
}

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortBy.value = field
    sortAsc.value = true
  }
  currentPage.value = 1
}

const refreshData = () => {
  window.location.reload()
}

const exportData = () => {
  exportToExcel(members.value, '全体成员数据')
}

const viewMemberDetail = (member) => {
  selectedMember.value = member
  showMemberDetailModal.value = true
}

const closeMemberDetailModal = () => {
  showMemberDetailModal.value = false
  selectedMember.value = null
}

const checkQualification = (member) => {
  openActivistQuery()
  // 可以在这里预填充查询
}

// 积极分子查询相关函数
const openActivistQuery = () => {
  showActivistQuery.value = true
  qualifiedMembers.value = []
  queryMessage.value = ''
  queryTime.value = ''
}

const closeActivistQuery = () => {
  showActivistQuery.value = false
}

const resetQueryOptions = () => {
  queryOptions.value = {
    checkPrerequisite: true,
    checkFullYear: false,
    checkCET4: false,
    checkComputer: false,
    checkFailures: false,
    checkComprehensive: false,
    strictMode: false
  }
}

const performActivistQuery = () => {
  const now = new Date()
  queryTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  console.log('开始查询符合条件的积极分子...')
  console.log('查询选项:', queryOptions.value)
  
  try {
    // 首先筛选出政治面貌为共青团员且入党阶段为积极分子培训结业的成员
    const prerequisiteMembers = members.value.filter(member => 
      member.政治面貌 === '共青团员' && 
      member.入党流程阶段 === '积极分子培训结业'
    )
    
    console.log('符合基本前提条件的积极分子:', prerequisiteMembers.length)
    
    // 如果没有符合基本前提条件的成员，直接返回
    if (prerequisiteMembers.length === 0) {
      qualifiedMembers.value = []
      queryMessage.value = '没有找到政治面貌为共青团员且入党阶段为积极分子培训结业的成员'
      return
    }
    
    // 如果有额外的筛选条件，进行进一步筛选
    if (enabledCriteriaCount.value > 0) {
      const result = oneClickActivistQuery(prerequisiteMembers, queryOptions.value)
      qualifiedMembers.value = result.符合条件成员
      
      console.log('进一步筛选完成:', result.统计信息)
      
      if (qualifiedMembers.value.length === 0) {
        queryMessage.value = `找到${prerequisiteMembers.length}位政治面貌为共青团员且培训结业的积极分子，但根据当前条件未找到符合进一步筛选条件的成员`
      } else {
        queryMessage.value = `从${prerequisiteMembers.length}位政治面貌为共青团员且培训结业的积极分子中，根据${enabledCriteriaCount.value}个条件找到${qualifiedMembers.value.length}位符合条件的成员`
      }
    } else {
      // 没有额外的筛选条件，只显示基本前提条件的结果
      qualifiedMembers.value = prerequisiteMembers
      queryMessage.value = `找到${prerequisiteMembers.length}位政治面貌为共青团员且入党阶段为积极分子培训结业的成员`
    }
    
  } catch (error) {
    console.error('查询失败:', error)
    queryMessage.value = '查询过程中发生错误'
  }
}

const toggleResultsSort = (field) => {
  if (sortResultsBy.value === field) {
    sortResultsAsc.value = !sortResultsAsc.value
  } else {
    sortResultsBy.value = field
    sortResultsAsc.value = true
  }
}

const exportQualifiedMembers = () => {
  if (qualifiedMembers.value.length === 0) {
    alert('没有数据可以导出')
    return
  }
  
  try {
    const exportData = qualifiedMembers.value.map((member, index) => {
      const qualification = oneClickActivistQuery([member], queryOptions.value)
      return {
        '序号': index + 1,
        '姓名': member.姓名 || '',
        '学号': member.学号 || '',
        '班级': member.班级 || '',
        '政治面貌': member.政治面貌 || '',
        '入党阶段': member.入党流程阶段 || '',
        '600题成绩': format600Score(member['600题考试成绩'], member.入党流程阶段),
        '四级成绩': member.四级成绩 || '',
        '计算机二级': member.计算机二级 || '',
        '不及格情况': member.不及格情况 || '无',
        '前一学年综测百分比': member.前一学年综测百分比 || '',
        '积极分子时间': formatDisplayDate(member['党支部接收入党积极分子时间']),
        '成为积极分子天数': getDaysSinceActivist(member),
        '是否满一年': getDaysSinceActivist(member) >= 365 ? '是' : '否',
        '四级是否达标': (member.四级成绩 || 0) >= 425 ? '是' : '否',
        '计算机二级是否达标': getComputerClass(member.计算机二级, member.班级).includes('pass') || 
                              getComputerClass(member.计算机二级, member.班级).includes('exempt') ? '是' : '否',
        '是否有不及格': member.不及格情况 === '无' ? '否' : '是',
        '综测是否达标': getPercentageClass(member.前一学年综测百分比, member.班级).includes('pass') ? '是' : '否',
        '查询条件': ['共青团员+培训结业', ...enabledCriteriaList.value].join(', '),
        '备注': member.备注 || ''
      }
    })
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    const wscols = [
      { wch: 8 },   // 序号
      { wch: 10 },  // 姓名
      { wch: 15 },  // 学号
      { wch: 12 },  // 班级
      { wch: 10 },  // 政治面貌
      { wch: 12 },  // 入党阶段
      { wch: 10 },  // 600题成绩
      { wch: 10 },  // 四级成绩
      { wch: 12 },  // 计算机二级
      { wch: 15 },  // 不及格情况
      { wch: 15 },  // 综测百分比
      { wch: 15 },  // 积极分子时间
      { wch: 12 },  // 成为积极分子天数
      { wch: 10 },  // 是否满一年
      { wch: 12 },  // 四级是否达标
      { wch: 15 },  // 计算机二级是否达标
      { wch: 12 },  // 是否有不及格
      { wch: 12 },  // 综测是否达标
      { wch: 25 },  // 查询条件
      { wch: 20 }   // 备注
    ]
    ws['!cols'] = wscols
    
    XLSX.utils.book_append_sheet(wb, ws, '符合条件的积极分子')
    
    // 添加条件说明工作表
    const criteriaData = [
      ['查询条件说明', ''],
      ['基本前提条件', ''],
      ['政治面貌', '共青团员'],
      ['入党阶段', '积极分子培训结业'],
      ['', ''],
      ['启用的筛选条件', ''],
      ...enabledCriteriaList.value.map(condition => [condition, '✓']),
      ['', ''],
      ['查询选项', '值'],
      ['检查满一年', queryOptions.value.checkFullYear ? '是' : '否'],
      ['检查四级', queryOptions.value.checkCET4 ? '是' : '否'],
      ['检查计算机二级', queryOptions.value.checkComputer ? '是' : '否'],
      ['检查不及格', queryOptions.value.checkFailures ? '是' : '否'],
      ['检查综测', queryOptions.value.checkComprehensive ? '是' : '否'],
      ['严格模式', queryOptions.value.strictMode ? '是' : '否'],
      ['', ''],
      ['统计信息', ''],
      ['查询时间', queryTime.value],
      ['积极分子总数', activistCount.value],
      ['基本前提条件人数', qualifiedMembers.value.length],
      ['启用的筛选条件数', enabledCriteriaCount.value]
    ]
    
    const wsCriteria = XLSX.utils.aoa_to_sheet(criteriaData)
    XLSX.utils.book_append_sheet(wb, wsCriteria, '条件说明')
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `积极分子查询_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`已导出${exportData.length}条记录到Excel`)
    
  } catch (error) {
    console.error('导出Excel失败:', error)
    alert('导出失败，请重试')
  }
}

// 导出到Excel函数
const exportToExcel = (data, filename) => {
  try {
    const exportData = data.map((member, index) => {
      return {
        '序号': index + 1,
        '姓名': member.姓名 || '',
        '学号': member.学号 || '',
        '班级': member.班级 || '',
        '政治面貌': member.政治面貌 || '',
        '入党流程阶段': member.入党流程阶段 || '',
        '活动时数': member.活动时数 || '',
        '修正党时': member.修正党时 || '',
        '600题成绩': format600Score(member['600题考试成绩'], member.入党流程阶段),
        '四级成绩': member.四级成绩 || '',
        '计算机二级': member.计算机二级 || '',
        '不及格情况': member.不及格情况 || '',
        '前一学年综测百分比': member.前一学年综测百分比 || '',
        '积极分子时间': formatDisplayDate(member['党支部接收入党积极分子时间']),
        '申请时间': formatDisplayDate(member.申请入党时间),
        '备注': member.备注 || ''
      }
    })
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    const wscols = [
      { wch: 8 },   // 序号
      { wch: 10 },  // 姓名
      { wch: 15 },  // 学号
      { wch: 12 },  // 班级
      { wch: 10 },  // 政治面貌
      { wch: 15 },  // 入党流程阶段
      { wch: 10 },  // 活动时数
      { wch: 10 },  // 修正党时
      { wch: 10 },  // 600题成绩
      { wch: 10 },  // 四级成绩
      { wch: 12 },  // 计算机二级
      { wch: 15 },  // 不及格情况
      { wch: 15 },  // 综测百分比
      { wch: 15 },  // 积极分子时间
      { wch: 15 },  // 申请时间
      { wch: 20 }   // 备注
    ]
    ws['!cols'] = wscols
    
    XLSX.utils.book_append_sheet(wb, ws, '成员数据')
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`已导出${exportData.length}条记录到Excel`)
    
  } catch (error) {
    console.error('导出Excel失败:', error)
    alert('导出失败，请重试')
  }
}
</script>

<style scoped>
/* 前提条件特殊样式 */
.prerequisite {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(82, 196, 26, 0.1)) !important;
  border: 1px solid rgba(24, 144, 255, 0.3) !important;
}

.prerequisite-mark {
  color: #ff4d4f;
  margin-right: 6px;
  font-size: 16px;
}

.prerequisite-value {
  color: #1890ff;
  font-weight: 600;
}

.config-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0;
}

/* 条件标签特殊样式 */
.prerequisite-tag {
  background: rgba(24, 144, 255, 0.1) !important;
  color: #1890ff !important;
  border: 1px solid rgba(24, 144, 255, 0.3) !important;
}

/* 查询信息样式 */
.query-info {
  font-size: 14px;
  color: #595959;
  margin-top: 8px;
}

/* 之前的其他样式保持不变 */
.members-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left .page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #262626;
}

.header-left .page-description {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-activist-query {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-activist-query:hover {
  background: linear-gradient(135deg, #73d13d, #95de64);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.btn-refresh,
.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover,
.btn-export:hover {
  border-color: #c7000a;
  color: #c7000a;
}

.btn-icon {
  font-size: 16px;
}

/* 统计卡片 */
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
}

.stat-content .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 4px;
}

.stat-content .stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

/* 筛选工具栏 */
.filter-toolbar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
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

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #c7000a;
}

.action-buttons .btn-reset {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-buttons .btn-reset:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

/* 成员表格 */
.members-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.table-info {
  font-size: 14px;
  color: #595959;
}

.filtered-info {
  color: #ff4d4f;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.table-wrapper {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.members-table th {
  background: #fafafa;
  padding: 14px 12px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  border-bottom: 2px solid #f0f0f0;
  position: sticky;
  top: 0;
  white-space: nowrap;
}

.members-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #595959;
  white-space: nowrap;
}

.members-table tbody tr:hover {
  background: #fffafa;
}

.members-table .center {
  text-align: center;
}

/* 表格内特殊样式 */
.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #262626;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* 状态标签样式 */
.status-badge,
.stage-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-party {
  background: rgba(199, 0, 10, 0.1);
  color: #c7000a;
}

.status-candidate {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
}

.status-youth {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-masses {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.stage-applicant {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.stage-passed600 {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.stage-activist {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.stage-graduate {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.stage-none {
  background: rgba(191, 191, 191, 0.1);
  color: #bfbfbf;
}

/* 分数样式 */
.no-data {
  color: #bfbfbf;
  font-style: italic;
}

.date-info {
  color: #1890ff;
  font-size: 12px;
}

.hours-excellent {
  color: #52c41a;
  font-weight: 600;
}

.hours-good {
  color: #1890ff;
  font-weight: 600;
}

.hours-normal {
  color: #fa8c16;
  font-weight: 500;
}

.hours-low {
  color: #ff4d4f;
  font-weight: 500;
}

.hours-empty {
  color: #bfbfbf;
}

.score-excellent {
  color: #52c41a;
  font-weight: 700;
}

.score-good {
  color: #1890ff;
  font-weight: 600;
}

.score-pass {
  color: #fa8c16;
  font-weight: 600;
}

.score-fail {
  color: #ff4d4f;
  font-weight: 600;
}

.score-empty {
  color: #bfbfbf;
}

.cet-pass {
  color: #52c41a;
  font-weight: 600;
}

.cet-fail {
  color: #ff4d4f;
  font-weight: 600;
}

.cet-empty {
  color: #bfbfbf;
}

.computer-pass {
  color: #52c41a;
  font-weight: 600;
}

.computer-fail {
  color: #ff4d4f;
  font-weight: 600;
}

.computer-exempt {
  color: #1890ff;
  font-weight: 500;
}

.computer-empty {
  color: #bfbfbf;
}

.failure-none {
  color: #52c41a;
  font-weight: 600;
}

.failure-has {
  color: #ff4d4f;
  font-weight: 600;
}

.percentage-pass {
  color: #52c41a;
  font-weight: 600;
}

.percentage-fail {
  color: #ff4d4f;
  font-weight: 600;
}

.percentage-empty {
  color: #bfbfbf;
}

.days-enough {
  color: #52c41a;
  font-weight: 600;
}

.days-not-enough {
  color: #ff4d4f;
  font-weight: 600;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-view,
.btn-check {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view {
  background: #1890ff;
  color: white;
}

.btn-view:hover {
  background: #40a9ff;
}

.btn-check {
  background: #52c41a;
  color: white;
}

.btn-check:hover {
  background: #73d13d;
}

/* 空表格样式 */
.empty-table {
  text-align: center;
  padding: 60px 20px;
  color: #bfbfbf;
}

.empty-table .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

/* 分页 */
.pagination {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: #fafafa;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #c7000a;
  color: #c7000a;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #595959;
  min-width: 100px;
  text-align: center;
}

.page-size {
  font-size: 14px;
  color: #595959;
  margin-left: 20px;
}

.page-size select {
  margin: 0 8px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
}

/* 积极分子查询模态框样式 */
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
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.query-modal {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fffafa 0%, #fff 100%);
}

.header-left {
  flex: 1;
}

.modal-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #c7000a;
}

.modal-subtitle {
  font-size: 14px;
  color: #595959;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-info {
  font-size: 14px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 16px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8c8c8c;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #ffccc7;
  color: #c7000a;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 查询条件配置样式 */
.criteria-config-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.criteria-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.config-row:hover {
  background: #fffafa;
}

.config-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.config-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.config-text {
  font-size: 15px;
  font-weight: 500;
  color: #262626;
  flex: 1;
}

.config-help {
  font-size: 13px;
  color: #8c8c8c;
  max-width: 300px;
}

.config-summary {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
  display: flex;
  gap: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-label {
  font-size: 14px;
  color: #595959;
}

.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: #c7000a;
}

/* 查询按钮 */
.query-actions {
  text-align: center;
  padding: 24px;
  margin-bottom: 24px;
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #f0f0f0;
}

.btn-query {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #c7000a, #ff4d4f);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto 16px auto;
  min-width: 300px;
}

.btn-query:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(199, 0, 10, 0.3);
}

.btn-query:active {
  transform: translateY(0);
}

/* 结果表格头部的条件显示 */
.conditions-display {
  display: flex;
  gap: 8px;
  margin-left: 12px;
  flex-wrap: wrap;
}

.condition-tag {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

/* 查询结果表格头部 */
.results-table .table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.results-table .table-info {
  font-size: 14px;
  color: #262626;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.results-table .table-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.results-table .btn-action {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.results-table .btn-action:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.results-table {
  max-height: 400px;
  overflow-y: auto;
}

.results-table .table-container {
  min-width: 100%;
}

.qualified-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.qualified-table th {
  background: #fafafa;
  padding: 14px 12px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  border-bottom: 2px solid #f0f0f0;
  position: sticky;
  top: 0;
  white-space: nowrap;
}

.qualified-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #595959;
  white-space: nowrap;
}

.qualified-table tbody tr:hover {
  background: #fffafa;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-view-detail {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view-detail:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

.results-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.empty-results {
  text-align: center;
  padding: 60px 20px;
  color: #bfbfbf;
}

.empty-results .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-tip {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 8px;
}

.results-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.total-count {
  font-size: 15px;
  font-weight: 600;
  color: #c7000a;
  white-space: nowrap;
}

.results-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-export-results {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-export-results:hover {
  background: #73d13d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.btn-reset-criteria {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f0f0;
  color: #595959;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-reset-criteria:hover {
  background: #e6e6e6;
  color: #262626;
}

.reset-icon {
  font-size: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.footer-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  flex-wrap: wrap;
}

.footer-info .info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.info-label {
  color: #8c8c8c;
}

.info-value {
  color: #262626;
  font-weight: 500;
}

.btn-close-modal {
  padding: 8px 24px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-close-modal:hover {
  background: #e6e6e6;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .filter-select {
    flex: 1;
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-right {
    flex-wrap: wrap;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .table-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .query-modal {
    width: 98%;
    max-height: 95vh;
  }
  
  .modal-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-right {
    justify-content: space-between;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .results-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .results-actions {
    flex-direction: column;
  }
  
  .results-table .table-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .results-table .table-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .conditions-display {
    margin-left: 0;
    margin-top: 8px;
  }
  
  .footer-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .btn-close-modal {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .config-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .config-help {
    max-width: 100%;
  }
  
  .config-summary {
    flex-direction: column;
    gap: 12px;
  }
}
</style>