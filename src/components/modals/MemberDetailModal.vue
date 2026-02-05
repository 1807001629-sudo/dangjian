<!-- src/components/modals/MemberDetailModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="member-detail-modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ member.姓名 }} - 成员详情</h3>
        <button class="modal-close" @click="closeModal">×</button>
      </div>
      
      <div class="modal-content">
        <!-- 基本信息 -->
        <div class="section">
          <h5 class="section-title">
            <span class="title-icon">👤</span>
            基本信息
          </h5>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <div class="info-value">
                <div class="avatar-small" :style="{ background: getAvatarColor(member.姓名) }">
                  {{ getInitials(member.姓名) }}
                </div>
                <span>{{ member.姓名 }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">学号：</span>
              <span class="info-value">{{ member.学号 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">班级：</span>
              <span class="info-value">{{ member.班级 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">政治面貌：</span>
              <div class="info-value">
                <span class="status-tag compact" :class="getPoliticalStatusClass(member.政治面貌)">
                  {{ member.政治面貌 }}
                </span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">入党阶段：</span>
              <div class="info-value">
                <span class="status-tag compact" :class="getProcessStageClass(member)">
                  {{ getProcessStageText(member) }}
                </span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">出生日期：</span>
              <span class="info-value">{{ formatDate(member.出生年月日) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入校时间：</span>
              <span class="info-value">{{ formatDate(member.入校时间) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 入党流程信息 -->
        <div class="section">
          <h5 class="section-title">
            <span class="title-icon">📋</span>
            入党流程信息
          </h5>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">申请入党时间：</span>
              <span class="info-value">{{ formatDate(member.申请入党时间) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">党支部接收入党积极分子时间：</span>
              <span class="info-value">{{ formatDate(member['党支部接收入党积极分子时间']) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">确定为发展对象日期：</span>
              <span class="info-value">{{ formatDate(member.确定为发展对象日期) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">支部大会：</span>
              <span class="info-value">{{ formatDate(member.支部大会) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">转正时间：</span>
              <span class="info-value">{{ formatDate(member.转正时间) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请时年龄：</span>
              <span class="info-value">{{ formatScore(member['递交入党申请书年龄（岁）']) }} 岁</span>
            </div>
            <div class="info-item">
              <span class="info-label">活动时数：</span>
              <span class="info-value">{{ formatScore(member.活动时数) }} 小时</span>
            </div>
            <div class="info-item">
              <span class="info-label">修正党时：</span>
              <span class="info-value">{{ formatScore(member.修正党时) }} 小时</span>
            </div>
          </div>
        </div>
        
        <!-- 学习考试信息 -->
        <div class="section">
          <h5 class="section-title">
            <span class="title-icon">📚</span>
            学习考试信息
          </h5>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">600题考试成绩：</span>
              <div class="info-value">
                <span v-if="shouldShow600Pass(member)" class="score-pass compact">通过</span>
                <span v-else>{{ formatScore(member['600题考试成绩']) }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-label">600题考试时间：</span>
              <span class="info-value">{{ formatDate(member['600题考试时间']) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">积极分子结业成绩：</span>
              <span class="info-value">{{ formatScore(member.积极分子结业成绩) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">四级成绩：</span>
              <span class="info-value">{{ formatScore(member.四级成绩) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">计算机二级：</span>
              <span class="info-value">{{ formatScore(member.计算机二级) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">不及格情况：</span>
              <span class="info-value">{{ formatFailure(member.不及格情况) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">前一学年综测百分比：</span>
              <span class="info-value">{{ formatPercentage(member.前一学年综测百分比) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 团员信息（如果是共青团员） -->
        <div class="section" v-if="member.政治面貌 === '共青团员'">
          <h5 class="section-title">
            <span class="title-icon">👥</span>
            团员信息
          </h5>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">入团时间：</span>
              <span class="info-value">{{ formatDate(member.入团时间) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">团员资料备注：</span>
              <span class="info-value">{{ member.团员资料备注 || '-' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 备注信息 -->
        <div class="section" v-if="member.备注">
          <h5 class="section-title">
            <span class="title-icon">📝</span>
            备注信息
          </h5>
          <div class="remark-content">
            {{ member.备注 }}
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-value">{{ formatScore(member.活动时数) }}</div>
            <div class="stat-label">活动时数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" :class="getCorrectionClass(member.修正党时)">
              {{ formatScore(member.修正党时) }}
            </div>
            <div class="stat-label">修正党时</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getTotalHours(member) }}</div>
            <div class="stat-label">总时数</div>
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
import { 
  getInitials, 
  getAvatarColor, 
  formatScore, 
  formatPercentage, 
  formatFailure,
  getTotalHours,
  getCorrectionClass
} from '@/utils/memberUtils'
import { formatDisplayDate } from '@/utils/dateFormatter'
import { 
  getProcessStageText,
  getProcessStageClass,
  getPoliticalStatusClass,
  shouldShow600Pass
} from '@/services/dataTransformer'

const props = defineProps({
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// 格式化日期 - 使用统一的日期格式化工具
const formatDate = formatDisplayDate

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* 原有的样式保持不变 */
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
  max-width: 800px;
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

.section {
  margin-bottom: 24px;
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.info-label {
  min-width: 160px;
  color: #595959;
  font-weight: 500;
  font-size: 14px;
  line-height: 36px;
  flex-shrink: 0;
}

.info-value {
  color: #262626;
  font-weight: 400;
  font-size: 14px;
  line-height: 36px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 状态标签样式 - 修改为紧凑版本 */
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  min-width: auto;
  max-width: 100px;
  height: 24px;
  line-height: 1;
  margin: 0;
}

/* 紧凑版本 */
.status-tag.compact {
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 10px;
  height: 22px;
  min-width: 60px;
}

.status-party {
  background: rgba(199, 0, 10, 0.1);
  color: #c7000a;
  border: 1px solid rgba(199, 0, 10, 0.2);
}

.status-candidate {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
  border: 1px solid rgba(250, 140, 22, 0.2);
}

.status-youth {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.status-masses {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border: 1px solid rgba(24, 144, 255, 0.2);
}

/* 入党阶段标签样式 */
.stage-party {
  background: rgba(114, 46, 209, 0.1);
  color: #722ed1;
  border: 1px solid rgba(114, 46, 209, 0.2);
}

.stage-candidate {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
  border: 1px solid rgba(250, 140, 22, 0.2);
}

.stage-applicant {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border: 1px solid rgba(24, 144, 255, 0.2);
}

.stage-passed600 {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.stage-activist {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid rgba(250, 173, 20, 0.2);
}

.stage-graduate {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.stage-none {
  background: rgba(191, 191, 191, 0.1);
  color: #bfbfbf;
  border: 1px solid rgba(191, 191, 191, 0.2);
}

/* 600题通过样式 */
.score-pass {
  color: #52c41a;
  font-weight: 600;
  background: rgba(82, 196, 26, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  border: 1px solid rgba(82, 196, 26, 0.2);
  font-size: 11px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.score-pass.compact {
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 10px;
  height: 22px;
}

/* 备注信息样式 */
.remark-content {
  color: #595959;
  line-height: 1.6;
  padding: 12px;
  font-size: 14px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

/* 统计卡片 */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 8px;
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
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .member-detail-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .info-label {
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-height: auto;
  }
  
  .info-label {
    min-width: auto;
    line-height: 1.5;
    width: 100%;
  }
  
  .info-value {
    line-height: 1.5;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  
  .status-tag.compact {
    margin-left: 0;
  }
}
</style>