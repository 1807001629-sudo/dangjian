<!-- src/views/Members.vue - 完整版 -->
<template>
  <div class="members-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>👥 成员管理</h1>
      <p class="page-description">管理系统所有成员的基本信息与政治面貌</p>
      
      <div class="header-actions">
        <div class="search-box">
          <input 
            v-model="searchText" 
            placeholder="搜索姓名、学号、班级..." 
            class="search-input"
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="action-buttons">
          <button class="btn-refresh" @click="refreshData" title="刷新数据">
            🔄 刷新
          </button>
          <button class="btn-export" @click="exportData" title="导出数据">
            📥 导出
          </button>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-title">总人数</div>
          <div class="stat-value">{{ stats.total || 0 }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎓</div>
        <div class="stat-content">
          <div class="stat-title">党员人数</div>
          <div class="stat-value">{{ stats.partyMembers || 0 }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-title">积极分子</div>
          <div class="stat-value">{{ stats.activists || 0 }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-content">
          <div class="stat-title">团员人数</div>
          <div class="stat-value">{{ stats.leagueMembers || 0 }}</div>
        </div>
      </div>
    </div>
    
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>班级筛选：</label>
        <select v-model="selectedClass" class="filter-select" @change="applyFilters">
          <option value="">全部班级</option>
          <option v-for="className in classList" :key="className" :value="className">
            {{ className }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>政治面貌：</label>
        <select v-model="selectedPoliticalStatus" class="filter-select" @change="applyFilters">
          <option value="">全部</option>
          <option value="中共党员">中共党员</option>
          <option value="中共预备党员">中共预备党员</option>
          <option value="共青团员">共青团员</option>
          <option value="群众">群众</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>学籍状态：</label>
        <select v-model="selectedStatus" class="filter-select" @change="applyFilters">
          <option value="">全部</option>
          <option value="在读">在读</option>
          <option value="休学">休学</option>
          <option value="毕业">毕业</option>
          <option value="退学">退学</option>
        </select>
      </div>
      
      <button class="btn-clear" @click="clearFilters">清除筛选</button>
    </div>
    
    <!-- 数据表格 -->
    <div class="data-table-container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载数据...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>数据加载失败</h3>
        <p>{{ error }}</p>
        <button @click="refreshData" class="btn-retry">重试</button>
      </div>
      
      <div v-else class="members-table">
        <div class="table-header">
          <h3>成员列表</h3>
          <div class="table-info">
            <span>共 {{ filteredMembers.length }} 条记录</span>
            <div class="pagination-info" v-if="filteredMembers.length > 0">
              第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
            </div>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th @click="sortBy('姓名')" class="sortable">
                  姓名 <span v-if="sortField === '姓名'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th>学号</th>
                <th>班级</th>
                <th>年级</th>
                <th>性别</th>
                <th>政治面貌</th>
                <th>学籍状态</th>
                <th>入党阶段</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(member, index) in paginatedMembers" :key="member.id">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>
                  <div class="member-cell">
                    <div class="member-avatar" :style="{ background: getAvatarColor(member.姓名) }">
                      {{ getInitials(member.姓名) }}
                    </div>
                    <span>{{ member.姓名 }}</span>
                  </div>
                </td>
                <td>{{ member.学号 }}</td>
                <td>{{ member.班级 }}</td>
                <td>{{ member.年级 }}</td>
                <td>
                  <span class="gender-badge" :class="{ 'male': member.性别 === '男', 'female': member.性别 === '女' }">
                    {{ member.性别 || '-' }}
                  </span>
                </td>
                <td>
                  <span class="status-badge political-status">
                    {{ member.政治面貌 || '未填写' }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(member.学籍状态)">
                    {{ member.学籍状态 || '未知' }}
                  </span>
                </td>
                <td>
                  <span class="stage-badge" :style="{ backgroundColor: getStageColor(member.processStage) }">
                    {{ member.processStage || '未开始' }}
                  </span>
                </td>
                <td>
                  <button class="btn-detail" @click="showMemberDetail(member)" title="查看详情">
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            上一页
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              :class="{ 'active': page === currentPage }"
              class="page-number"
            >
              {{ page }}
            </button>
            
            <span v-if="showEllipsis" class="ellipsis">...</span>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            下一页
          </button>
          
          <div class="page-size-selector">
            <span>每页显示：</span>
            <select v-model="pageSize" @change="changePageSize" class="size-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 成员详情模态框（暂时用alert代替） -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/memberUtils'

// 响应式数据
const members = ref([])
const searchText = ref('')
const selectedClass = ref('')
const selectedPoliticalStatus = ref('')
const selectedStatus = ref('')
const loading = ref(false)
const error = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref('姓名')
const sortOrder = ref('asc')

// 统计数据
const stats = ref({
  total: 0,
  partyMembers: 0,
  activists: 0,
  leagueMembers: 0
})

// 生命周期
onMounted(async () => {
  await loadMembersData()
  await loadStatistics()
})

// 加载成员数据
async function loadMembersData() {
  loading.value = true
  error.value = ''
  
  try {
    // 调用API获取成员数据
    const response = await fetch('http://localhost:3001/api/members')
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      members.value = data.data.map(member => {
        // 计算入党阶段
        const processStage = calculateProcessStage(member)
        
        return {
          ...member,
          processStage: processStage
        }
      })
    } else {
      throw new Error(data.error || 'API返回失败')
    }
  } catch (err) {
    error.value = err.message
    console.error('加载成员数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
async function loadStatistics() {
  try {
    // 这里可以调用统计接口，暂时用计算的方式
    stats.value.total = members.value.length
    stats.value.partyMembers = members.value.filter(m => 
      m.政治面貌 === '中共党员' || m.政治面貌 === '中共预备党员'
    ).length
    stats.value.leagueMembers = members.value.filter(m => 
      m.政治面貌 === '共青团员'
    ).length
    
    // 积极分子数量（可以根据积极分子时间判断）
    stats.value.activists = members.value.filter(m => 
      m.积极分子时间 || m.processStage === '入党积极分子'
    ).length
  } catch (err) {
    console.error('加载统计数据失败:', err)
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
      const className = (member.班级 || '').toLowerCase()
      
      return name.includes(searchTerm) || 
             studentId.includes(searchTerm) || 
             className.includes(searchTerm)
    })
  }
  
  // 班级筛选
  if (selectedClass.value) {
    result = result.filter(member => member.班级 === selectedClass.value)
  }
  
  // 政治面貌筛选
  if (selectedPoliticalStatus.value) {
    result = result.filter(member => member.政治面貌 === selectedPoliticalStatus.value)
  }
  
  // 学籍状态筛选
  if (selectedStatus.value) {
    result = result.filter(member => member.学籍状态 === selectedStatus.value)
  }
  
  // 排序
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      const aValue = a[sortField.value] || ''
      const bValue = b[sortField.value] || ''
      
      if (sortOrder.value === 'asc') {
        return aValue.toString().localeCompare(bValue.toString())
      } else {
        return bValue.toString().localeCompare(aValue.toString())
      }
    })
  }
  
  return result
})

// 分页相关计算属性
const totalPages = computed(() => {
  return Math.ceil(filteredMembers.value.length / pageSize.value)
})

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
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
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
    } else if (currentPage.value >= totalPages.value - 2) {
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
        pages.push(i)
      }
    }
  }
  
  return pages
})

const showEllipsis = computed(() => {
  return totalPages.value > 5 && 
         (currentPage.value > 3 || currentPage.value < totalPages.value - 2)
})

// 方法
function handleSearch() {
  currentPage.value = 1 // 搜索时回到第一页
}

function applyFilters() {
  currentPage.value = 1
}

function clearFilters() {
  searchText.value = ''
  selectedClass.value = ''
  selectedPoliticalStatus.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

function refreshData() {
  loadMembersData()
  loadStatistics()
  currentPage.value = 1
}

function exportData() {
  // 导出功能 - 暂时用alert提示
  alert(`准备导出 ${filteredMembers.value.length} 条记录\n导出功能开发中...`)
}

function sortBy(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

function showMemberDetail(member) {
  alert(`成员详情：\n姓名：${member.姓名}\n学号：${member.学号}\n班级：${member.班级}\n政治面貌：${member.政治面貌}\n入党阶段：${member.processStage}`)
}

// 分页方法
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function goToPage(page) {
  currentPage.value = page
}

function changePageSize() {
  currentPage.value = 1
}

// 工具方法
function getStatusClass(status) {
  const classMap = {
    '在读': 'in-school',
    '毕业': 'graduated',
    '休学': 'suspended',
    '退学': 'dropped'
  }
  return classMap[status] || 'unknown'
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
</script>

<style scoped>
.members-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

/* 页面头部 */
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
  margin: 0 0 20px 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #bfbfbf;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-refresh,
.btn-export {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-refresh {
  background: #1890ff;
  color: white;
}

.btn-refresh:hover {
  background: #40a9ff;
}

.btn-export {
  background: #52c41a;
  color: white;
}

.btn-export:hover {
  background: #73d13d;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 28px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #595959;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1890ff;
}

.btn-clear {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #595959;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;
}

.btn-clear:hover {
  background: #f0f0f0;
}

/* 数据表格 */
.data-table-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-radius: 50%;
  border-top-color: #c7000a;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.error-container h3 {
  margin: 0 0 12px 0;
  color: #f5222d;
  font-size: 18px;
}

.btn-retry {
  padding: 8px 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #262626;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  color: #8c8c8c;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

th {
  background: #fafafa;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  border-bottom: 2px solid #f0f0f0;
  font-size: 14px;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
}

td {
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #595959;
  font-size: 14px;
}

tr:hover {
  background: #fafafa;
}

/* 单元格样式 */
.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar {
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

.gender-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.gender-badge.male {
  background: #e6f7ff;
  color: #1890ff;
}

.gender-badge.female {
  background: #fff0f6;
  color: #eb2f96;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.in-school {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.graduated {
  background: #f0f5ff;
  color: #2f54eb;
}

.status-badge.suspended {
  background: #fff7e6;
  color: #fa8c16;
}

.status-badge.dropped {
  background: #fff1f0;
  color: #f5222d;
}

.status-badge.unknown {
  background: #f5f5f5;
  color: #8c8c8c;
}

.status-badge.political-status {
  background: #f0f5ff;
  color: #2f54eb;
}

.stage-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  display: inline-block;
}

.btn-detail {
  padding: 4px 12px;
  background: #f5f5f5;
  color: #595959;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-detail:hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.page-btn:disabled {
  color: #bfbfbf;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-number {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background: #f5f5f5;
}

.page-number.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.ellipsis {
  color: #bfbfbf;
  padding: 0 4px;
}

.page-size-selector {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #595959;
}

.size-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .btn-clear {
    width: 100%;
    margin-left: 0;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-size-selector {
    margin-left: 0;
  }
}
</style>