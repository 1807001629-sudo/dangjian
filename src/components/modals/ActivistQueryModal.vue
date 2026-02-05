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
          <button 
            class="btn-query" 
            @click="queryQualifiedActivists"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else class="btn-icon">🔍</span>
            {{ loading ? '查询中...' : '一键查询符合条件的积极分子' }}
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
                :disabled="exporting"
              >
                <span v-if="exporting" class="loading-spinner small"></span>
                <span v-else class="export-icon">📊</span>
                {{ exporting ? '导出中...' : '导出CSV' }}
              </button>
            </div>
          </div>
          
          <div class="results-container">
            <div v-if="qualifiedMembers.length === 0 && !loading" class="empty-results">
              <div class="empty-icon">📭</div>
              <p>暂无符合条件的积极分子</p>
              <p class="empty-tip">请点击上方按钮进行查询</p>
            </div>
            
            <div v-else-if="loading" class="loading-results">
              <div class="loading-spinner large"></div>
              <p>正在查询中...</p>
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
                    <tr v-for="member in qualifiedMembers" :key="member.id || member.学号">
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
                          'score-fail': !checkComputerScore(member) && member.班级?.includes('高分子'),
                          'score-exempt': !member.班级?.includes('高分子')
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
                        <span class="status-qualified">符合条件</span>
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
          <div class="info-item" v-if="queryStats">
            <span class="info-label">积极分子总数:</span>
            <span class="info-value">{{ queryStats.积极分子总数 }} 人</span>
          </div>
        </div>
        <button class="btn-close" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiService from '@/services/apiService'
import { 
  formatDateStr, 
  getDaysSinceActivist 
} from '@/services/dataTransformer'

const props = defineProps({
  // 不再需要本地传递membersData，直接从API获取
})

const emit = defineEmits(['close', 'view-detail'])

// 响应式数据
const qualifiedMembers = ref([])
const queryTime = ref('')
const currentDate = ref('')
const loading = ref(false)
const exporting = ref(false)
const queryStats = ref(null)

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
  const num = parseFloat(score)
  return isNaN(num) ? '-' : num.toFixed(0)
}

const formatPercentage = (percentage) => {
  if (!percentage || percentage === 'nan' || percentage === 'null') return '-'
  return percentage
}

const formatFailure = (failure) => {
  if (!failure || failure === 'nan' || failure === 'NaN' || failure === 'null') {
    return '无'
  }
  return failure
}

const formatDate = (dateStr) => {
  return formatDateStr(dateStr) || '-'
}

// 检查条件函数
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

// 查询符合条件的积极分子 - 使用API
const queryQualifiedActivists = async () => {
  const now = new Date()
  queryTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  loading.value = true
  qualifiedMembers.value = []
  queryStats.value = null
  
  try {
    console.log('开始查询符合条件的积极分子...')
    
    // 使用API查询
    const response = await apiService.queryQualifiedActivists({
      checkFullYear: true,
      checkCET4: true,
      checkComputer: true,
      checkFailures: true,
      checkComprehensive: true,
      strictMode: false
    })
    
    const result = response.data || response
    
    qualifiedMembers.value = result.符合条件成员 || []
    queryStats.value = result.统计信息 || null
    
    console.log('查询完成:', {
      积极分子总数: queryStats.value?.积极分子总数,
      符合条件人数: qualifiedMembers.value.length,
      查询选项: result.查询选项
    })
    
  } catch (error) {
    console.error('查询积极分子失败:', error)
    
    // 如果API失败，可以尝试从本地获取积极分子数据
    try {
      const activistsResponse = await apiService.getActivists()
      const activists = activistsResponse.data || []
      
      // 临时在前端筛选
      const tempQualified = activists.filter(member => {
        if (member.入党流程阶段 !== '积极分子培训结业') return false
        
        // 检查满一年
        const daysSince = getDaysSinceActivist(member)
        if (daysSince < 365) return false
        
        // 检查四级
        const cet4Score = parseFloat(member.四级成绩 || 0)
        if (cet4Score < 425) return false
        
        // 检查计算机二级
        if (!checkComputerScore(member)) return false
        
        // 检查不及格
        const failure = member.不及格情况
        if (failure && failure !== '无' && failure !== 'null' && failure !== 'nan') {
          return false
        }
        
        // 检查综测
        if (!checkComprehensive(member)) return false
        
        return true
      })
      
      qualifiedMembers.value = tempQualified
      queryStats.value = {
        积极分子总数: activists.length,
        符合条件人数: tempQualified.length,
        符合条件比例: activists.length > 0 ? 
          ((tempQualified.length / activists.length) * 100).toFixed(1) + '%' : '0%'
      }
      
      console.log('前端筛选结果:', {
        积极分子总数: activists.length,
        符合条件人数: tempQualified.length
      })
      
    } catch (fallbackError) {
      console.error('备用方案也失败了:', fallbackError)
      alert('查询失败，请检查网络连接或联系管理员')
    }
  } finally {
    loading.value = false
  }
}

// 导出结果到CSV - 不再依赖xlsx
const exportResults = async () => {
  if (qualifiedMembers.value.length === 0) {
    alert('没有数据可以导出')
    return
  }
  
  exporting.value = true
  
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
        '不及格情况': formatFailure(member.不及格情况),
        '前一学年综测百分比': member.前一学年综测百分比 || '',
        '积极分子时间': formatDate(member.党支部接收入党积极分子时间),
        '成为积极分子天数': getDaysSinceActivist(member),
        '积极分子培训结业时间': member.积极分子培训结业时间 || '',
        '是否满一年': getDaysSinceActivist(member) >= 365 ? '是' : '否',
        '四级是否达标': parseFloat(member.四级成绩 || 0) >= 425 ? '是' : '否',
        '计算机二级是否达标': checkComputerScore(member) ? '是' : '否',
        '是否有不及格': !member.不及格情况 || member.不及格情况 === 'null' || member.不及格情况 === 'nan' ? '否' : '是',
        '综测是否达标': checkComprehensive(member) ? '是' : '否',
        '总体是否符合': '是',
        '备注': member.备注 || ''
      }
    })
    
    // 转换为CSV格式
    const headers = Object.keys(exportData[0]);
    const csvRows = [];
    
    // 添加标题行
    csvRows.push(headers.join(','));
    
    // 添加数据行
    for (const row of exportData) {
      const values = headers.map(header => {
        const escaped = String(row[header]).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `符合条件的积极分子_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`已导出${exportData.length}条记录到CSV`);
    
  } catch (error) {
    console.error('导出数据失败:', error);
    alert('导出失败，请重试');
  } finally {
    exporting.value = false;
  }
};

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
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.query-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease;
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
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fffafa 0%, #fff 100%);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.modal-subtitle {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.date-info {
  font-size: 12px;
  color: #595959;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
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

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.criteria-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
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
  font-size: 16px;
  color: #52c41a;
  margin-top: 2px;
}

.criteria-text {
  font-size: 14px;
  color: #262626;
  line-height: 1.4;
}

.criteria-subtext {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.query-actions {
  text-align: center;
  padding: 24px;
  background: #fff7e6;
  border-radius: 8px;
  border: 1px solid #ffe7ba;
  margin-bottom: 24px;
}

.btn-query {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-query:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(199, 0, 10, 0.3);
}

.btn-query:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-query:disabled:hover {
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.btn-icon {
  font-size: 18px;
}

.query-info {
  margin-top: 12px;
  font-size: 13px;
  color: #8c8c8c;
}

.results-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.results-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.results-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-count {
  font-size: 14px;
  color: #595959;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover:not(:disabled) {
  background: #40a9ff;
  transform: translateY(-1px);
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-export:disabled:hover {
  transform: none;
}

.loading-spinner.small {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
  margin-right: 4px;
}

.export-icon {
  font-size: 14px;
}

.results-container {
  padding: 0;
}

.empty-results {
  text-align: center;
  padding: 60px 20px;
  color: #bfbfbf;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
}

.loading-results {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
  margin: 20px auto;
}

.table-container {
  overflow-x: auto;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.member-table th {
  background: #fafafa;
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  font-size: 13px;
  border-bottom: 2px solid #f0f0f0;
  white-space: nowrap;
}

.member-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #595959;
  vertical-align: middle;
}

.member-table tbody tr:hover {
  background: #fafafa;
}

.member-name {
  min-width: 150px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-small {
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

.score-pass {
  color: #52c41a;
  font-weight: 600;
}

.score-fail {
  color: #ff4d4f;
  font-weight: 600;
}

.score-exempt {
  color: #8c8c8c;
  font-style: italic;
}

.no-failures {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.has-failures {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.percentage-pass {
  color: #52c41a;
  font-weight: 600;
}

.percentage-fail {
  color: #ff4d4f;
  font-weight: 600;
}

.days-count {
  font-size: 11px;
  margin-top: 2px;
}

.over-year {
  color: #52c41a;
}

.under-year {
  color: #faad14;
}

.status-qualified {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.btn-detail {
  padding: 4px 12px;
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
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #8c8c8c;
}

.info-value {
  font-size: 13px;
  color: #262626;
  font-weight: 500;
}

.btn-close {
  padding: 8px 24px;
  background: #f0f0f0;
  color: #262626;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e8e8e8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .query-modal {
    width: 95%;
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
  
  .criteria-section {
    padding: 16px;
  }
  
  .query-actions {
    padding: 16px;
  }
  
  .btn-query {
    width: 100%;
    justify-content: center;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .results-summary {
    justify-content: space-between;
  }
  
  .footer-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .btn-close {
    width: 100%;
  }
}
</style>