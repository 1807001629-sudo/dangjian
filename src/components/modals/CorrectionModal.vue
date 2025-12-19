<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="correction-modal">
      <div class="modal-header">
        <h3 class="modal-title">修正党时 - {{ member.姓名 }}</h3>
        <button class="modal-close" @click="closeModal">×</button>
      </div>
      
      <div class="modal-content">
        <div class="member-info">
          <div class="info-row">
            <span class="label">班级:</span>
            <span class="value">{{ member.班级 }}</span>
          </div>
          <div class="info-row">
            <span class="label">政治面貌:</span>
            <span class="value" :class="{ 'party-member': member.isPartyMember }">
              {{ member.政治面貌 }}
              <span v-if="member.isPartyMember" class="party-tip">(中共党员无需修正)</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">当前活动时数:</span>
            <span class="value">{{ member.活动时数 || 0 }}h</span>
          </div>
          <div class="info-row">
            <span class="label">当前修正党时:</span>
            <span class="value" :class="getCorrectionClass(member.修正党时, member.isPartyMember)">
              {{ member.修正党时 || 0 }}h
            </span>
          </div>
          <div class="info-row">
            <span class="label">当前总时数:</span>
            <span class="value">{{ getTotalHours(member) }}h</span>
          </div>
        </div>
        
        <div class="correction-form" v-if="!member.isPartyMember">
          <div class="form-group">
            <label class="form-label">新的修正党时</label>
            <div class="input-group">
              <input
                type="number"
                v-model="newCorrection"
                class="form-input"
                placeholder="请输入修正党时"
                step="0.5"
                @input="validateInput"
              />
              <span class="input-unit">小时</span>
            </div>
            <div class="input-hint">
              负数表示需要补足的活动时数，正数表示额外的活动时数
            </div>
          </div>
          
          <div class="quick-actions">
            <div class="quick-title">快捷调整:</div>
            <div class="quick-buttons">
              <button 
                v-for="action in quickActions" 
                :key="action.value"
                class="quick-btn"
                @click="applyQuickAction(action.value)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
          
          <div class="result-preview">
            <div class="preview-title">调整后结果:</div>
            <div class="preview-grid">
              <div class="preview-item">
                <span class="preview-label">活动时数</span>
                <span class="preview-value">{{ member.活动时数 || 0 }}h</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">修正党时</span>
                <span class="preview-value" :class="getCorrectionClass(newCorrection, false)">
                  {{ newCorrection }}h
                </span>
              </div>
              <div class="preview-item total">
                <span class="preview-label">总时数</span>
                <span class="preview-value">{{ (member.活动时数 || 0) + newCorrection }}h</span>
              </div>
            </div>
            <div class="preview-status" :class="getStatusClass(newCorrection)">
              {{ getStatusText(newCorrection) }}
            </div>
          </div>
          
          <div class="reason-section">
            <label class="form-label">修正原因</label>
            <textarea
              v-model="correctionReason"
              class="reason-input"
              placeholder="请输入修正党时的原因（选填）"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="party-member-info" v-else>
          <div class="info-card">
            <div class="info-icon">👑</div>
            <div class="info-content">
              <h4>中共党员无需修正</h4>
              <p>该成员为中共党员，无需进行修正党时操作。</p>
              <p>中共党员的活动时数管理与其他成员不同，如有疑问请联系管理员。</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">取消</button>
        <button 
          class="btn-save" 
          @click="saveCorrection" 
          v-if="!member.isPartyMember"
          :disabled="!isCorrectionChanged"
        >
          保存修正
        </button>
        <button class="btn-close" @click="closeModal" v-else>关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'close'])

const newCorrection = ref(props.member.修正党时 || 0)
const correctionReason = ref('')

const quickActions = [
  { label: '+10h', value: 10 },
  { label: '+5h', value: 5 },
  { label: '清零', value: 0 },
  { label: '-10h', value: -10 },
  { label: '-20h', value: -20 },
  { label: '-50h', value: -50 }
]

const getTotalHours = (member) => {
  const activity = member.活动时数 || 0
  const correction = member.修正党时 || 0
  return (activity + correction).toFixed(1)
}

const getCorrectionClass = (correction, isPartyMember) => {
  // 中共党员直接显示中共党员样式
  if (isPartyMember) return 'party-member'
  
  const value = parseFloat(correction) || 0
  if (value >= 0) return 'completed'
  if (value > -50) return 'need'
  if (value > -100) return 'serious'
  return 'critical'
}

const getStatusClass = (correction) => {
  const value = parseFloat(correction) || 0
  if (value >= 0) return 'status-completed'
  if (value > -50) return 'status-warning'
  if (value > -100) return 'status-serious'
  return 'status-critical'
}

const getStatusText = (correction) => {
  const value = parseFloat(correction) || 0
  if (value >= 0) return '已完成修正'
  if (value > -50) return '需修正 (-50h以内)'
  if (value > -100) return '缺时较多 (-100h以内)'
  return '严重缺时 (-100h以上)'
}

const isCorrectionChanged = computed(() => {
  return newCorrection.value !== (props.member.修正党时 || 0)
})

const validateInput = () => {
  // 确保输入的是有效的数字
  const num = parseFloat(newCorrection.value)
  if (isNaN(num)) {
    newCorrection.value = 0
  } else {
    newCorrection.value = Math.round(num * 2) / 2 // 支持0.5步长
  }
}

const applyQuickAction = (value) => {
  newCorrection.value = parseFloat(value)
}

const closeModal = () => {
  emit('close')
}

const saveCorrection = () => {
  const updatedMember = {
    ...props.member,
    修正党时: parseFloat(newCorrection.value) || 0
  }
  
  emit('save', updatedMember)
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

.correction-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
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

.member-info {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #595959;
}

.value {
  color: #262626;
  font-weight: 500;
}

.value.completed {
  color: #52c41a;
}

.value.need {
  color: #faad14;
}

.value.serious {
  color: #ff7a45;
}

.value.critical {
  color: #f5222d;
}

.value.party-member {
  color: #722ed1;
  font-weight: 600;
}

.party-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: 8px;
  font-weight: normal;
  font-style: italic;
}

.correction-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  margin-bottom: 8px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.input-unit {
  font-size: 14px;
  color: #595959;
  min-width: 40px;
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.quick-actions {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.quick-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-btn {
  padding: 10px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-1px);
}

.result-preview {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 16px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.preview-item {
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.preview-item.total {
  background: #1890ff;
  border-color: #1890ff;
}

.preview-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.preview-item.total .preview-label {
  color: rgba(255, 255, 255, 0.8);
}

.preview-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.preview-item.total .preview-value {
  color: white;
}

.preview-value.completed {
  color: #52c41a;
}

.preview-value.need {
  color: #faad14;
}

.preview-value.serious {
  color: #ff7a45;
}

.preview-value.critical {
  color: #f5222d;
}

.preview-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.status-completed {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.status-warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid rgba(250, 173, 20, 0.2);
}

.status-serious {
  background: rgba(255, 122, 69, 0.1);
  color: #ff7a45;
  border: 1px solid rgba(255, 122, 69, 0.2);
}

.status-critical {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
  border: 1px solid rgba(245, 34, 45, 0.2);
}

.reason-section {
  margin-top: 16px;
}

.reason-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  color: #262626;
  resize: vertical;
  transition: all 0.3s ease;
}

.reason-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.party-member-info {
  text-align: center;
  padding: 40px 20px;
}

.info-card {
  background: linear-gradient(135deg, #f9f0ff 0%, #f2e6ff 100%);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid rgba(114, 46, 209, 0.2);
  max-width: 400px;
  margin: 0 auto;
}

.info-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #722ed1;
}

.info-content h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #722ed1;
  font-weight: 600;
}

.info-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #595959;
  line-height: 1.5;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.btn-cancel {
  padding: 10px 24px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  border-color: #bfbfbf;
  background: #f5f5f5;
}

.btn-save {
  padding: 10px 24px;
  background: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover:not(:disabled) {
  background: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-close {
  padding: 10px 24px;
  background: #722ed1;
  border: 1px solid #722ed1;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #8552d4;
  border-color: #8552d4;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .correction-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .quick-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-save,
  .btn-close {
    width: 100%;
  }
}
</style>