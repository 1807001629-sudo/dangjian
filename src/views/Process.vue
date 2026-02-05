<!-- src/views/Process.vue - 简化版 -->
<template>
  <div class="process-simple">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📋 入党流程追踪</h1>
      <p class="subtitle">查看和管理党员的入党进度</p>
    </div>
    
    <!-- 状态显示 -->
    <div class="status-bar">
      <div class="status-item" :class="{ 'online': apiOnline }">
        <span class="status-dot"></span>
        <span>API: {{ apiOnline ? '已连接' : '未连接' }}</span>
      </div>
      <div class="status-item">
        <span>数据: {{ members.length }} 条记录</span>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>正在加载数据...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-box">
      <h3>⚠️ 数据加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">重试</button>
      <button @click="useSampleData" class="sample-btn">使用示例数据</button>
    </div>
    
    <!-- 正常显示 -->
    <div v-else class="main-content">
      <!-- 快速筛选 -->
      <div class="quick-filters">
        <input 
          v-model="searchText" 
          placeholder="搜索姓名或学号..." 
          class="search-input"
          @input="handleSearch"
        />
        <select v-model="selectedStage" class="stage-select" @change="applyFilter">
          <option value="">所有阶段</option>
          <option value="入党申请人">入党申请人</option>
          <option value="入党积极分子">入党积极分子</option>
          <option value="中共预备党员">中共预备党员</option>
          <option value="中共党员">中共党员</option>
        </select>
      </div>
      
      <!-- 阶段统计 -->
      <div class="stage-summary">
        <div class="summary-card">
          <div class="summary-title">入党申请人</div>
          <div class="summary-count">{{ stageCounts['入党申请人'] || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">积极分子</div>
          <div class="summary-count">{{ stageCounts['入党积极分子'] || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">预备党员</div>
          <div class="summary-count">{{ stageCounts['中共预备党员'] || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">正式党员</div>
          <div class="summary-count">{{ stageCounts['中共党员'] || 0 }}</div>
        </div>
      </div>
      
      <!-- 成员列表 -->
      <div class="members-list">
        <h3>成员列表</h3>
        
        <div v-if="filteredMembers.length === 0" class="empty-list">
          <p>暂无符合条件的成员</p>
          <button @click="clearFilters" class="clear-btn">清除筛选</button>
        </div>
        
        <div v-else class="members-grid">
          <div 
            v-for="member in filteredMembers.slice(0, 20)" 
            :key="member.学号 || member.id"
            class="member-card"
            @click="showMemberDetail(member)"
          >
            <div class="member-header">
              <div class="avatar" :style="{ backgroundColor: getAvatarColor(member.姓名) }">
                {{ getInitials(member.姓名) }}
              </div>
              <div class="member-info">
                <div class="name">{{ member.姓名 }}</div>
                <div class="details">
                  <span class="class">{{ member.班级 }}</span>
                  <span class="id">{{ member.学号 }}</span>
                </div>
              </div>
            </div>
            
            <div class="member-status">
              <span class="stage-badge" :style="{ backgroundColor: getStageColor(member.processStage) }">
                {{ member.processStage || '未开始' }}
              </span>
              <span class="progress">{{ getProgress(member) }}%</span>
            </div>
            
            <div class="member-timeline">
              <div v-if="member.递交入党申请书" class="timeline-item">
                <span class="timeline-label">申请: </span>
                <span class="timeline-date">{{ formatDate(member.递交入党申请书) }}</span>
              </div>
              <div v-if="member.积极分子时间" class="timeline-item">
                <span class="timeline-label">积极分子: </span>
                <span class="timeline-date">{{ formatDate(member.积极分子时间) }}</span>
              </div>
              <div v-if="member.转正时间" class="timeline-item">
                <span class="timeline-label">转正: </span>
                <span class="timeline-date">{{ formatDate(member.转正时间) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 成员详情 -->
      <div v-if="selectedMember" class="member-detail">
        <h3>成员详情</h3>
        <div class="detail-content">
          <div class="detail-row">
            <span class="label">姓名:</span>
            <span class="value">{{ selectedMember.姓名 }}</span>
          </div>
          <div class="detail-row">
            <span class="label">学号:</span>
            <span class="value">{{ selectedMember.学号 }}</span>
          </div>
          <div class="detail-row">
            <span class="label">班级:</span>
            <span class="value">{{ selectedMember.班级 }}</span>
          </div>
          <div class="detail-row">
            <span class="label">当前阶段:</span>
            <span class="value stage" :style="{ color: getStageColor(selectedMember.processStage) }">
              {{ selectedMember.processStage }}
            </span>
          </div>
          
          <div class="detail-section">
            <h4>入党时间线</h4>
            <div class="timeline">
              <div class="timeline-step" :class="{ 'completed': selectedMember.递交入党申请书 }">
                <div class="step-number">1</div>
                <div class="step-info">
                  <div class="step-title">递交入党申请书</div>
                  <div class="step-date">{{ formatDate(selectedMember.递交入党申请书) || '未完成' }}</div>
                </div>
              </div>
              <div class="timeline-step" :class="{ 'completed': selectedMember.积极分子时间 }">
                <div class="step-number">2</div>
                <div class="step-info">
                  <div class="step-title">成为积极分子</div>
                  <div class="step-date">{{ formatDate(selectedMember.积极分子时间) || '未完成' }}</div>
                </div>
              </div>
              <div class="timeline-step" :class="{ 'completed': selectedMember.确定为发展对象日期 }">
                <div class="step-number">3</div>
                <div class="step-info">
                  <div class="step-title">确定为发展对象</div>
                  <div class="step-date">{{ formatDate(selectedMember.确定为发展对象日期) || '未完成' }}</div>
                </div>
              </div>
              <div class="timeline-step" :class="{ 'completed': selectedMember.支部大会 }">
                <div class="step-number">4</div>
                <div class="step-info">
                  <div class="step-title">支部大会通过</div>
                  <div class="step-date">{{ formatDate(selectedMember.支部大会) || '未完成' }}</div>
                </div>
              </div>
              <div class="timeline-step" :class="{ 'completed': selectedMember.转正时间 }">
                <div class="step-number">5</div>
                <div class="step-info">
                  <div class="step-title">转为正式党员</div>
                  <div class="step-date">{{ formatDate(selectedMember.转正时间) || '未完成' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const members = ref([])
const selectedMember = ref(null)
const searchText = ref('')
const selectedStage = ref('')
const loading = ref(true)
const error = ref('')
const apiOnline = ref(false)

// 生命周期
onMounted(() => {
  loadData()
})

// 加载数据
async function loadData() {
  loading.value = true
  error.value = ''
  
  try {
    // 测试API连接
    const testResponse = await fetch('http://localhost:3001/api/health')
    apiOnline.value = testResponse.ok
    
    // 获取成员数据
    const response = await fetch('http://localhost:3001/api/members')
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      // 处理数据
      members.value = data.data.map(member => {
        const processStage = calculateProcessStage(member)
        
        return {
          ...member,
          姓名: member.姓名 || '未知',
          学号: member.学号 || '',
          班级: member.班级 || '',
          processStage: processStage
        }
      })
      
      console.log(`成功加载 ${members.value.length} 条数据`)
      
      // 默认选择第一个成员
      if (members.value.length > 0) {
        selectedMember.value = members.value[0]
      }
    } else {
      // 如果没有真实数据，使用示例数据
      console.log('API返回空数据，使用示例数据')
      useSampleData()
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = err.message
    
    // 使用示例数据作为降级方案
    useSampleData()
  } finally {
    loading.value = false
  }
}

// 使用示例数据
function useSampleData() {
  members.value = [
    {
      id: 1,
      姓名: '张浩楠',
      学号: '202008310133',
      班级: '高分子2201',
      年级: '2022',
      性别: '男',
      学籍状态: '在读',
      政治面貌: '共青团员',
      递交入党申请书: '2023-09-15',
      积极分子时间: '2024-03-20',
      确定为发展对象日期: null,
      支部大会: null,
      转正时间: null,
      积极分子所在支部: '理学院学生党支部',
      活动时数: 8.5,
      修正党时: 0,
      '600题考试成绩': 85,
      processStage: '入党积极分子'
    },
    {
      id: 2,
      姓名: '李雪',
      学号: '202108030105',
      班级: '大数据2201',
      年级: '2022',
      性别: '女',
      学籍状态: '在读',
      政治面貌: '中共预备党员',
      递交入党申请书: '2022-10-10',
      积极分子时间: '2023-04-15',
      确定为发展对象日期: '2023-12-20',
      支部大会: '2024-06-30',
      转正时间: null,
      积极分子所在支部: '理学院学生党支部',
      活动时数: 12.5,
      修正党时: 0,
      '600题考试成绩': 92,
      processStage: '中共预备党员'
    },
    {
      id: 3,
      姓名: '王明',
      学号: '202102030425',
      班级: '高分子2302',
      年级: '2023',
      性别: '男',
      学籍状态: '在读',
      政治面貌: '中共党员',
      递交入党申请书: '2021-09-01',
      积极分子时间: '2022-03-15',
      确定为发展对象日期: '2022-12-10',
      支部大会: '2023-06-20',
      转正时间: '2024-06-20',
      积极分子所在支部: '理学院学生党支部',
      活动时数: 15.5,
      修正党时: 0,
      '600题考试成绩': 88,
      processStage: '中共党员'
    },
    {
      id: 4,
      姓名: '赵晓',
      学号: '202208310201',
      班级: '高分子2201',
      年级: '2022',
      性别: '女',
      学籍状态: '在读',
      政治面貌: '共青团员',
      递交入党申请书: '2024-01-10',
      积极分子时间: null,
      确定为发展对象日期: null,
      支部大会: null,
      转正时间: null,
      活动时数: 5.0,
      修正党时: 0,
      processStage: '入党申请人'
    },
    {
      id: 5,
      姓名: '刘伟',
      学号: '202308030301',
      班级: '大数据2301',
      年级: '2023',
      性别: '男',
      学籍状态: '在读',
      政治面貌: '共青团员',
      递交入党申请书: null,
      积极分子时间: null,
      确定为发展对象日期: null,
      支部大会: null,
      转正时间: null,
      活动时数: 0,
      修正党时: 0,
      processStage: '未开始'
    }
  ]
  
  if (members.value.length > 0) {
    selectedMember.value = members.value[0]
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
const stageCounts = computed(() => {
  const counts = {
    '入党申请人': 0,
    '入党积极分子': 0,
    '中共预备党员': 0,
    '中共党员': 0,
    '未开始': 0
  }
  
  members.value.forEach(member => {
    const stage = member.processStage
    counts[stage] = (counts[stage] || 0) + 1
  })
  
  return counts
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
  
  // 阶段筛选
  if (selectedStage.value) {
    result = result.filter(member => member.processStage === selectedStage.value)
  }
  
  return result
})

// 工具函数
function getInitials(name) {
  if (!name || name === '未知') return '??'
  return name.slice(0, 2)
}

function getAvatarColor(name) {
  const colors = ['#c7000a', '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2']
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

function getProgress(member) {
  const stage = member.processStage
  
  if (stage === '中共党员') return 100
  if (stage === '中共预备党员') return 80
  if (stage === '确定为发展对象') return 60
  if (stage === '入党积极分子') return 40
  if (stage === '入党申请人') return 20
  
  return 0
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'nan' || dateStr === 'null') return ''
  
  // 简单格式化
  if (typeof dateStr === 'string') {
    const cleanStr = dateStr.replace(/\.0$/, '')
    
    // YYYYMMDD格式
    if (/^\d{8}$/.test(cleanStr)) {
      const year = cleanStr.substring(0, 4)
      const month = cleanStr.substring(4, 6)
      const day = cleanStr.substring(6, 8)
      return `${year}-${month}-${day}`
    }
    
    // YYYY/MM/DD格式
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(cleanStr)) {
      return cleanStr
    }
  }
  
  return dateStr
}

// 交互函数
function handleSearch() {
  // 搜索逻辑已在计算属性中实现
}

function applyFilter() {
  // 筛选逻辑已在计算属性中实现
}

function clearFilters() {
  searchText.value = ''
  selectedStage.value = ''
}

function showMemberDetail(member) {
  selectedMember.value = member
}
</script>

<style scoped>
.process-simple {
  padding: 20px;
  background: #f8f9fa;
  min-height: calc(100vh - 64px);
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #262626;
}

.subtitle {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #595959;
}

.status-item.online .status-dot {
  background: #52c41a;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f5222d;
}

/* 加载状态 */
.loading-box {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-radius: 50%;
  border-top-color: #c7000a;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-box p {
  color: #8c8c8c;
  margin: 0;
}

/* 错误状态 */
.error-box {
  padding: 40px 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
}

.error-box h3 {
  margin: 0 0 12px 0;
  color: #f5222d;
}

.error-box p {
  margin: 0 0 20px 0;
  color: #595959;
}

.retry-btn,
.sample-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin: 0 8px;
  transition: all 0.3s ease;
}

.retry-btn {
  background: #ff4d4f;
  color: white;
}

.retry-btn:hover {
  background: #ff7875;
}

.sample-btn {
  background: #f5f5f5;
  color: #595959;
  border: 1px solid #d9d9d9;
}

.sample-btn:hover {
  background: #f0f0f0;
}

/* 快速筛选 */
.quick-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
}

.stage-select {
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
  background: white;
}

/* 阶段统计 */
.stage-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.summary-count {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

/* 成员列表 */
.members-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.members-list h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #262626;
  font-weight: 600;
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #bfbfbf;
  border: 1px dashed #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.clear-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.member-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.member-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
  transform: translateY(-2px);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.member-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.stage-badge {
  padding: 4px 10px;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.progress {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
}

.member-timeline {
  font-size: 12px;
  color: #8c8c8c;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.timeline-label {
  color: #595959;
}

.timeline-date {
  color: #8c8c8c;
  font-weight: 500;
}

/* 成员详情 */
.member-detail {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.member-detail h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #262626;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-content {
  padding: 8px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-row .label {
  color: #8c8c8c;
  min-width: 80px;
}

.detail-row .value {
  color: #262626;
  font-weight: 500;
  text-align: right;
}

.detail-row .stage {
  font-weight: 600;
}

.detail-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #595959;
  font-weight: 600;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  background: #fafafa;
}

.timeline-step.completed {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.timeline-step.completed .step-number {
  background: #52c41a;
  color: white;
}

.step-info {
  flex: 1;
}

.step-title {
  font-size: 13px;
  color: #262626;
  margin-bottom: 2px;
  font-weight: 500;
}

.step-date {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-filters {
    flex-direction: column;
  }
  
  .members-grid {
    grid-template-columns: 1fr;
  }
  
  .stage-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stage-summary {
    grid-template-columns: 1fr;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>