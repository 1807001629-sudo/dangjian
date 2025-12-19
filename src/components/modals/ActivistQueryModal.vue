<!-- src/components/modals/ActivistQueryModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="query-modal">
      <div class="modal-header">
        <div class="header-left">
          <h3 class="modal-title">积极分子资格查询</h3>
          <div class="modal-subtitle">自动筛选符合条件的积极分子（培训结业）</div>
        </div>
        <div class="header-right">
          <span class="date-info">当前日期: {{ currentDate }}</span>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
      </div>
      
      <div class="modal-content">
        <!-- 查询条件说明 -->
        <div class="criteria-section">
          <h4 class="section-title">查询条件说明</h4>
          <div class="criteria-list">
            <div class="criteria-item">
              <span class="criteria-icon">✅</span>
              <span class="criteria-text">1. 积极分子培训结业满一年</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-icon">✅</span>
              <span class="criteria-text">2. 英语四级成绩 ≥ 425分</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-icon">✅</span>
              <div class="criteria-text">
                3. 计算机二级要求：
                <span class="criteria-subtext">
                  大数据专业不要求，高分子专业需 ≥ 60分
                </span>
              </div>
            </div>
            <div class="criteria-item">
              <span class="criteria-icon">✅</span>
              <span class="criteria-text">4. 无不及格情况</span>
            </div>
            <div class="criteria-item">
              <span class="criteria-icon">✅</span>
              <div class="criteria-text">
                5. 综测百分比要求：
                <span class="criteria-subtext">
                  大二: 专业前40% | 大三: 专业前50% | 大四: 专业前60%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 查询按钮 -->
        <div class="query-actions">
          <button class="btn-query" @click="queryQualifiedActivists">
            <span class="btn-icon">🔍</span>
            一键查询符合条件的积极分子
          </button>
          <div class="query-info">
            将自动筛选符合全部 {{ criteriaCount }} 项条件的积极分子
          </div>
        </div>
        
        <!-- 查询结果 -->
        <div class="results-section">
          <div class="results-header">
            <h4>查询结果</h4>
            <div class="results-summary">
              <span class="total-count">共 {{ qualifiedMembers.length }} 人符合条件</span>
              <button 
                v-if="qualifiedMembers.length > 0" 
                class="btn-export" 
                @click="exportResults"
              >
                <span class="export-icon">📊</span>
                导出Excel
              </button>
            </div>
          </div>
          
          <div class="results-container">
            <div v-if="qualifiedMembers.length === 0" class="empty-results">
              <div class="empty-icon">📭</div>
              <p>暂无符合条件的积极分子</p>
              <p class="empty-tip">请点击上方按钮进行查询</p>
            </div>
            
            <div v-else class="results-table">
              <div class="table-container">
                <table class="member-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>学号</th>
                      <th>班级</th>
                      <th>四级成绩</th>
                      <th>计算机二级</th>
                      <th>不及格情况</th>
                      <th>综测百分比</th>
                      <th>积极分子时间</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in qualifiedMembers" :key="member.学号">
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
                        <span :class="{
                          'score-pass': parseFloat(member.四级成绩 || 0) >= 425,
                          'score-fail': parseFloat(member.四级成绩 || 0) < 425
                        }">
                          {{ formatScore(member.四级成绩) }}
                        </span>
                      </td>
                      <td>
                        <span :class="{
                          'score-pass': checkComputerScore(member),
                          'score-fail': !checkComputerScore(member) && member.班级.includes('高分子'),
                          'score-exempt': !member.班级.includes('高分子')
                        }">
                          {{ formatScore(member.计算机二级) }}
                        </span>
                      </td>
                      <td>
                        <span :class="{
                          'no-failures': !member.不及格情况 || member.不及格情况 === 'null' || member.不及格情况 === 'nan',
                          'has-failures': member.不及格情况 && member.不及格情况 !== 'null' && member.不及格情况 !== 'nan'
                        }">
                          {{ formatFailure(member.不及格情况) }}
                        </span>
                      </td>
                      <td>
                        <span :class="{
                          'percentage-pass': checkComprehensive(member),
                          'percentage-fail': !checkComprehensive(member)
                        }">
                          {{ formatPercentage(member.前一学年综测百分比) }}
                        </span>
                      </td>
                      <td>
                        {{ formatDate(member.党支部接收入党积极分子时间) }}
                        <div class="days-count" :class="{
                          'over-year': getDaysSinceActivist(member) >= 365,
                          'under-year': getDaysSinceActivist(member) < 365
                        }">
                          ({{ getDaysSinceActivist(member) }}天)
                        </div>
                      </td>
                      <td>
                        <span :class="{
                          'status-qualified': checkAllCriteria(member),
                          'status-disqualified': !checkAllCriteria(member)
                        }">
                          {{ checkAllCriteria(member) ? '符合条件' : '不符合' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn-detail" @click="viewMemberDetail(member)">详情</button>
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
            <span class="info-label">数据总数:</span>
            <span class="info-value">{{ membersData.length }} 人</span>
          </div>
        </div>
        <button class="btn-close" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

const props = defineProps({
  membersData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'view-detail'])

// 响应式数据
const qualifiedMembers = ref([])
const queryTime = ref('')
const currentDate = ref('')

// 计算属性
const criteriaCount = computed(() => 5) // 总共5个条件

// 初始化
onMounted(() => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// 工具函数
const getInitials = (name) => {
  if (!name) return '??'
  return name.slice(0, 2)
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

// 格式化函数
const formatScore = (score) => {
  if (!score || score === 'nan' || score === 'null') return '-'
  return parseFloat(score).toFixed(0)
}

const formatPercentage = (percentage) => {
  if (!percentage || percentage === 'nan' || percentage === 'null') return '-'
  return percentage
}

const formatFailure = (failure) => {
  if (!failure || failure === 'nan' || failure === 'null') return '无'
  return failure
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'nan' || dateStr === 'null') return '-'
  
  // 处理各种日期格式
  try {
    // 如果是数字格式如 20251218.0
    if (typeof dateStr === 'number' || /^\d+\.?\d*$/.test(dateStr)) {
      const dateNum = Math.floor(parseFloat(dateStr)).toString()
      if (dateNum.length === 8) {
        const year = dateNum.substring(0, 4)
        const month = dateNum.substring(4, 6)
        const day = dateNum.substring(6, 8)
        return `${year}-${month}-${day}`
      }
    }
    
    // 如果是字符串格式
    return dateStr
  } catch (e) {
    return dateStr
  }
}

// 计算成为积极分子至今的天数
const getDaysSinceActivist = (member) => {
  const activistTime = member.党支部接收入党积极分子时间
  if (!activistTime || activistTime === 'nan' || activistTime === 'null') return 0
  
  try {
    const now = new Date()
    let activistDate
    
    // 处理数字格式日期
    if (typeof activistTime === 'number' || /^\d+\.?\d*$/.test(activistTime)) {
      const dateNum = Math.floor(parseFloat(activistTime)).toString()
      if (dateNum.length === 8) {
        const year = parseInt(dateNum.substring(0, 4))
        const month = parseInt(dateNum.substring(4, 6)) - 1
        const day = parseInt(dateNum.substring(6, 8))
        activistDate = new Date(year, month, day)
      } else {
        return 0
      }
    } else {
      activistDate = new Date(activistTime)
    }
    
    if (isNaN(activistDate.getTime())) return 0
    
    const diffTime = Math.abs(now - activistDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch (e) {
    return 0
  }
}

// 检查条件函数
const checkCET4 = (member) => {
  const score = parseFloat(member.四级成绩 || 0)
  return score >= 425
}

const checkComputerScore = (member) => {
  const className = member.班级 || ''
  
  // 大数据专业不要求计算机二级
  if (className.includes('大数据')) {
    return true
  }
  
  // 高分子专业需要大于等于60分
  if (className.includes('高分子')) {
    const score = parseFloat(member.计算机二级 || 0)
    return score >= 60
  }
  
  // 其他专业暂时不检查
  return true
}

const checkFailures = (member) => {
  const failure = member.不及格情况
  return !failure || failure === 'null' || failure === 'nan' || failure === ''
}

const checkComprehensive = (member) => {
  const percentage = member.前一学年综测百分比
  if (!percentage || percentage === 'nan' || percentage === 'null') return false
  
  // 提取数字部分
  const percentNum = parseFloat(percentage.replace('%', ''))
  if (isNaN(percentNum)) return false
  
  const className = member.班级 || ''
  let gradeLevel = 0
  
  // 根据班级判断年级
  if (className.includes('大二') || /22/.test(className)) {
    gradeLevel = 2
  } else if (className.includes('大三') || /21/.test(className)) {
    gradeLevel = 3
  } else if (className.includes('大四') || /20/.test(className)) {
    gradeLevel = 4
  }
  
  // 根据年级设置要求
  switch(gradeLevel) {
    case 2: // 大二：专业前40%
      return percentNum <= 40
    case 3: // 大三：专业前50%
      return percentNum <= 50
    case 4: // 大四：专业前60%
      return percentNum <= 60
    default:
      return false
  }
}

const checkActivistYear = (member) => {
  return getDaysSinceActivist(member) >= 365
}

const checkAllCriteria = (member) => {
  return (
    member.入党流程阶段 === '积极分子培训结业' &&
    checkActivistYear(member) &&
    checkCET4(member) &&
    checkComputerScore(member) &&
    checkFailures(member) &&
    checkComprehensive(member)
  )
}

// 查询符合条件的积极分子
const queryQualifiedActivists = () => {
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
  console.log('数据总数:', props.membersData.length)
  
  // 过滤出积极分子培训结业的成员
  const activists = props.membersData.filter(member => 
    member.入党流程阶段 === '积极分子培训结业'
  )
  
  console.log('积极分子培训结业人数:', activists.length)
  
  // 应用所有筛选条件
  qualifiedMembers.value = activists.filter(member => checkAllCriteria(member))
  
  console.log('符合条件的积极分子人数:', qualifiedMembers.value.length)
  
  // 详细检查每个条件
  if (qualifiedMembers.value.length === 0) {
    const reasons = {
      totalActivists: activists.length,
      notFullYear: activists.filter(m => !checkActivistYear(m)).length,
      noCET4: activists.filter(m => !checkCET4(m)).length,
      noComputer: activists.filter(m => !checkComputerScore(m)).length,
      hasFailures: activists.filter(m => !checkFailures(m)).length,
      noComprehensive: activists.filter(m => !checkComprehensive(m)).length
    }
    console.log('筛选详情:', reasons)
  }
}

// 导出结果到Excel
const exportResults = () => {
  if (qualifiedMembers.value.length === 0) {
    alert('没有数据可以导出')
    return
  }
  
  try {
    const exportData = qualifiedMembers.value.map((member, index) => {
      return {
        '序号': index + 1,
        '姓名': member.姓名 || '',
        '学号': member.学号 || '',
        '班级': member.班级 || '',
        '政治面貌': member.政治面貌 || '',
        '四级成绩': member.四级成绩 || '',
        '计算机二级': member.计算机二级 || '',
        '不及格情况': member.不及格情况 || '无',
        '前一学年综测百分比': member.前一学年综测百分比 || '',
        '积极分子时间': formatDate(member.党支部接收入党积极分子时间),
        '成为积极分子天数': getDaysSinceActivist(member),
        '积极分子培训结业时间': member.积极分子培训结业时间 || '',
        '是否满一年': checkActivistYear(member) ? '是' : '否',
        '四级是否达标': checkCET4(member) ? '是' : '否',
        '计算机二级是否达标': checkComputerScore(member) ? '是' : '否',
        '是否有不及格': checkFailures(member) ? '否' : '是',
        '综测是否达标': checkComprehensive(member) ? '是' : '否',
        '总体是否符合': checkAllCriteria(member) ? '是' : '否',
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
      { wch: 10 },  // 四级成绩
      { wch: 12 },  // 计算机二级
      { wch: 15 },  // 不及格情况
      { wch: 15 },  // 综测百分比
      { wch: 15 },  // 积极分子时间
      { wch: 12 },  // 成为积极分子天数
      { wch: 15 },  // 培训结业时间
      { wch: 10 },  // 是否满一年
      { wch: 12 },  // 四级是否达标
      { wch: 15 },  // 计算机二级是否达标
      { wch: 12 },  // 是否有不及格
      { wch: 12 },  // 综测是否达标
      { wch: 12 },  // 总体是否符合
      { wch: 20 }   // 备注
    ]
    ws['!cols'] = wscols
    
    XLSX.utils.book_append_sheet(wb, ws, '符合条件的积极分子')
    
    // 添加条件说明工作表
    const criteriaData = [
      ['查询条件说明', ''],
      ['条件', '要求'],
      ['积极分子培训结业满一年', '成为积极分子（培训结业）至今满365天'],
      ['英语四级成绩', '≥ 425分'],
      ['计算机二级', '大数据专业不要求，高分子专业需 ≥ 60分'],
      ['不及格情况', '无不及格记录'],
      ['综测百分比', '大二: 专业前40% | 大三: 专业前50% | 大四: 专业前60%'],
      ['查询时间', queryTime.value],
      ['总人数', props.membersData.length],
      ['积极分子人数', activistsCount()],
      ['符合条件人数', qualifiedMembers.value.length]
    ]
    
    const wsCriteria = XLSX.utils.aoa_to_sheet(criteriaData)
    XLSX.utils.book_append_sheet(wb, wsCriteria, '条件说明')
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `符合条件的积极分子_${new Date().toISOString().slice(0, 10)}.xlsx`
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

const activistsCount = () => {
  return props.membersData.filter(member => 
    member.入党流程阶段 === '积极分子培训结业'
  ).length
}

// 查看成员详情
const viewMemberDetail = (member) => {
  emit('view-detail', member)
}

// 关闭弹窗
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
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

.criteria-section {
  background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #b7eb8f;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.criteria-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.criteria-icon {
  font-size: 20px;
  color: #52c41a;
  flex-shrink: 0;
  margin-top: 2px;
}

.criteria-text {
  font-size: 15px;
  font-weight: 500;
  color: #262626;
  flex: 1;
}

.criteria-subtext {
  display: block;
  font-size: 13px;
  color: #595959;
  margin-top: 2px;
  font-weight: normal;
}

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

.btn-icon {
  font-size: 18px;
}

.query-info {
  font-size: 14px;
  color: #8c8c8c;
}

.results-section {
  margin-top: 24px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.results-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.results-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-count {
  font-size: 15px;
  font-weight: 600;
  color: #c7000a;
}

.btn-export {
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
}

.btn-export:hover {
  background: #73d13d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.export-icon {
  font-size: 16px;
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

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-tip {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 8px;
}

.results-table {
  max-height: 400px;
  overflow-y: auto;
}

.table-container {
  min-width: 100%;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.member-table th {
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

.member-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #595959;
  white-space: nowrap;
}

.member-table tbody tr:hover {
  background: #fffafa;
}

/* 特殊列样式 */
.member-name {
  font-weight: 600;
  color: #262626;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 分数样式 */
.score-pass {
  color: #52c41a;
  font-weight: 600;
  background: rgba(82, 196, 26, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.score-fail {
  color: #ff4d4f;
  font-weight: 600;
  background: rgba(255, 77, 79, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.score-exempt {
  color: #1890ff;
  font-weight: 500;
  background: rgba(24, 144, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

/* 不及格情况样式 */
.no-failures {
  color: #52c41a;
  font-weight: 600;
}

.has-failures {
  color: #ff4d4f;
  font-weight: 600;
}

/* 百分比样式 */
.percentage-pass {
  color: #52c41a;
  font-weight: 600;
}

.percentage-fail {
  color: #ff4d4f;
  font-weight: 600;
}

/* 天数样式 */
.days-count {
  font-size: 11px;
  margin-top: 2px;
}

.over-year {
  color: #52c41a;
}

.under-year {
  color: #ff4d4f;
}

/* 状态样式 */
.status-qualified {
  color: #52c41a;
  font-weight: 600;
  background: rgba(82, 196, 26, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
}

.status-disqualified {
  color: #ff4d4f;
  font-weight: 600;
  background: rgba(255, 77, 79, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
}

/* 操作按钮 */
.btn-detail {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-detail:hover {
  background: #40a9ff;
  transform: translateY(-1px);
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
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  color: #8c8c8c;
}

.info-value {
  color: #262626;
  font-weight: 500;
}

.btn-close {
  padding: 8px 24px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e6e6e6;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .query-modal {
    width: 98%;
    max-height: 95vh;
  }
  
  .results-table {
    font-size: 12px;
  }
  
  .member-table th,
  .member-table td {
    padding: 8px 10px;
  }
}

@media (max-width: 768px) {
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
  
  .footer-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .btn-close {
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
  }
}
</style>