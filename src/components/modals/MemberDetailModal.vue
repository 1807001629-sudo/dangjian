<!-- src/components/modals/MemberDetailModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="member-detail-modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ member.姓名 }} - 成员详情</h3>
        <button class="modal-close" @click="closeModal">×</button>
      </div>
      
      <div class="modal-content">
        <div class="member-summary">
          <div class="summary-header">
            <div class="avatar" :style="{ background: getAvatarColor(member.姓名) }">
              {{ getInitials(member.姓名) }}
            </div>
            <div class="header-info">
              <h4>{{ member.姓名 }}</h4>
              <div class="meta-info">
                <span class="meta-item">{{ member.班级 }}</span>
                <span class="meta-item">学号: {{ member.学号 }}</span>
              </div>
            </div>
          </div>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">{{ member.活动时数 || 0 }}</div>
              <div class="stat-label">活动时数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" :class="getCorrectionClass(member.修正党时)">
                {{ member.修正党时 || 0 }}
              </div>
              <div class="stat-label">修正党时</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getTotalHours(member) }}</div>
              <div class="stat-label">总时数</div>
            </div>
          </div>
        </div>
        
        <div class="detail-sections">
          <div class="section">
            <h5 class="section-title">基本信息</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">政治面貌</span>
                <span class="info-value">{{ member.政治面貌 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">入党阶段</span>
                <span class="info-value">{{ member.processStage || '未开始' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">申请入党时间</span>
                <span class="info-value">{{ member.申请入党时间 || '未申请' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">600题成绩</span>
                <span class="info-value">{{ member['600题考试成绩'] || '未参加' }}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h5 class="section-title">状态说明</h5>
            <div class="status-box" :class="getStatusClass(member)">
              <div class="status-title">{{ getStatusText(member) }}</div>
              <div class="status-desc">
                {{ getStatusDescription(member) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-close" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

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

const getTotalHours = (member) => {
  const activity = member.活动时数 || 0
  const correction = member.修正党时 || 0
  return (activity + correction).toFixed(1)
}

const getCorrectionClass = (correction) => {
  const value = correction || 0
  if (value >= 0) return 'positive'
  if (value > -50) return 'warning'
  if (value > -100) return 'serious'
  return 'critical'
}

const getStatusClass = (member) => {
  const correction = member.修正党时 || 0
  if (correction >= 0) return 'status-completed'
  if (correction > -50) return 'status-warning'
  if (correction > -100) return 'status-serious'
  return 'status-critical'
}

const getStatusText = (member) => {
  const correction = member.修正党时 || 0
  if (correction >= 0) return '活动时数达标'
  if (correction > -50) return '需补充活动时数'
  if (correction > -100) return '活动时数不足'
  return '严重缺乏活动时数'
}

const getStatusDescription = (member) => {
  const correction = member.修正党时 || 0
  const need = Math.abs(correction)
  
  if (correction >= 0) {
    return '该成员的活动时数已达到要求，无需补充。'
  } else {
    return `需要补充 ${need} 小时活动时数以达到要求。建议参加更多的党组织活动和志愿服务。`
  }
}

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

.member-detail-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fafafa 0%, #fff 100%);
}

.modal-title {
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

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.member-summary {
  margin-bottom: 24px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
  flex-shrink: 0;
}

.header-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.meta-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #595959;
}

.meta-item {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 4px;
}

.stat-value.positive {
  color: #52c41a;
}

.stat-value.warning {
  color: #faad14;
}

.stat-value.serious {
  color: #ff7a45;
}

.stat-value.critical {
  color: #f5222d;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #f0f0f0;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.status-box {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.status-completed {
  background: rgba(82, 196, 26, 0.05);
  border-color: rgba(82, 196, 26, 0.2);
}

.status-warning {
  background: rgba(250, 173, 20, 0.05);
  border-color: rgba(250, 173, 20, 0.2);
}

.status-serious {
  background: rgba(255, 122, 69, 0.05);
  border-color: rgba(255, 122, 69, 0.2);
}

.status-critical {
  background: rgba(245, 34, 45, 0.05);
  border-color: rgba(245, 34, 45, 0.2);
}

.status-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.status-completed .status-title {
  color: #52c41a;
}

.status-warning .status-title {
  color: #faad14;
}

.status-serious .status-title {
  color: #ff7a45;
}

.status-critical .status-title {
  color: #f5222d;
}

.status-desc {
  font-size: 13px;
  color: #595959;
  line-height: 1.5;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.btn-close {
  padding: 10px 32px;
  background: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .member-detail-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>