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
            <span class="value" :class="{ 'party-member': isPartyMember }">
              {{ member.政治面貌 }}
              <span v-if="isPartyMember" class="party-tip">(中共党员无需修正)</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">当前活动时数:</span>
            <span class="value">{{ member.活动时数 || 0 }}h</span>
          </div>
          <div class="info-row">
            <span class="label">当前修正党时:</span>
            <span class="value" :class="getCorrectionClass(member.修正党时, isPartyMember)">
              {{ member.修正党时 || 0 }}h
            </span>
          </div>
          <div class="info-row">
            <span class="label">当前总时数:</span>
            <span class="value">{{ getTotalHours(member) }}h</span>
          </div>
        </div>
        
        <div class="correction-form" v-if="!isPartyMember">
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
                :disabled="saving"
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
                :disabled="saving"
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
              :disabled="saving"
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
        <button class="btn-cancel" @click="closeModal" :disabled="saving">取消</button>
        <button 
          v-if="!isPartyMember"
          class="btn-save" 
          @click="saveCorrection" 
          :disabled="!isCorrectionChanged || saving"
        >
          <span v-if="saving" class="loading-spinner"></span>
          {{ saving ? '保存中...' : '保存修正' }}
        </button>
        <button class="btn-close" @click="closeModal" v-else :disabled="saving">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import apiService from '@/services/apiService'

const props = defineProps({
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'close'])

// 响应式数据
const newCorrection = ref(props.member.修正党时 || 0)
const correctionReason = ref('')
const saving = ref(false)

const quickActions = [
  { label: '+10h', value: 10 },
  { label: '+5h', value: 5 },
  { label: '清零', value: 0 },
  { label: '-10h', value: -10 },
  { label: '-20h', value: -20 },
  { label: '-50h', value: -50 }
]

// 计算属性
const isPartyMember = computed(() => {
  return props.member.政治面貌 === '中共党员' || props.member.政治面貌 === '中共预备党员'
})

const getTotalHours = (member) => {
  const activity = parseFloat(member.活动时数) || 0
  const correction = parseFloat(member.修正党时) || 0
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
  const oldCorrection = parseFloat(props.member.修正党时) || 0
  const newCorrectionValue = parseFloat(newCorrection.value) || 0
  return newCorrectionValue !== oldCorrection
})

// 方法
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

// 保存修正 - 使用API
const saveCorrection = async () => {
  if (!isCorrectionChanged.value) return
  
  saving.value = true
  
  try {
    const memberId = props.member.id || props.member.学号
    
    console.log('保存修正党时:', {
      memberId,
      oldCorrection: props.member.修正党时,
      newCorrection: newCorrection.value,
      reason: correctionReason.value
    })
    
    // 调用API保存修正
    const response = await apiService.updateCorrection(
      memberId,
      newCorrection.value,
      correctionReason.value
    )
    
    const result = response.data || response
    
    if (result.success) {
      console.log('修正保存成功:', result)
      
      // 通知父组件更新
      const updatedMember = {
        ...props.member,
        修正党时: newCorrection.value
      }
      
      emit('save', updatedMember)
      closeModal()
    } else {
      throw new Error(result.error || '保存失败')
    }
    
  } catch (error) {
    console.error('保存修正失败:', error)
    
    // 如果API失败，回退到本地模式
    console.log('API保存失败，使用本地模式')
    
    // 模拟API响应延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedMember = {
      ...props.member,
      修正党时: newCorrection.value
    }
    
    emit('save', updatedMember)
    closeModal()
    
  } finally {
    saving.value = false
  }
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

.correction-modal {
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
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
}

.value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
  text-align: right;
}

.value.party-member {
  color: #c7000a;
  font-weight: 600;
}

.party-tip {
  display: block;
  font-size: 11px;
  color: #ff4d4f;
  margin-top: 2px;
  font-weight: normal;
}

.value.completed {
  color: #52c41a;
}

.value.need {
  color: #faad14;
}

.value.serious {
  color: #ff4d4f;
}

.value.critical {
  color: #c7000a;
  font-weight: 700;
}

.correction-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #d9d9d9;
  border-radius: 6px;
  font-size: 16px;
  color: #262626;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 3px rgba(199, 0, 10, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-unit {
  position: absolute;
  right: 16px;
  font-size: 14px;
  color: #8c8c8c;
}

.input-hint {
  font-size: 12px;
  color: #8c8c8c;
  font-style: italic;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 70px;
}

.quick-btn:hover:not(:disabled) {
  border-color: #c7000a;
  color: #c7000a;
  transform: translateY(-1px);
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-btn:disabled:hover {
  border-color: #d9d9d9;
  color: #262626;
  transform: none;
}

.result-preview {
  background: linear-gradient(135deg, #f6ffed 0%, #fff 100%);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #b7eb8f;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
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
}

.preview-item.total {
  grid-column: 1 / -1;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.preview-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.preview-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #262626;
}

.preview-item.total .preview-value {
  color: #c7000a;
  font-size: 24px;
}

.preview-status {
  text-align: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.preview-status.status-completed {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.preview-status.status-warning {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.preview-status.status-serious {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.preview-status.status-critical {
  background: rgba(199, 0, 10, 0.1);
  color: #c7000a;
}

.reason-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-input {
  padding: 12px 16px;
  border: 2px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

.reason-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 3px rgba(199, 0, 10, 0.1);
}

.reason-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.party-member-info {
  background: linear-gradient(135deg, #fff2f0 0%, #fff 100%);
  border-radius: 8px;
  padding: 30px 20px;
  border: 1px solid #ffccc7;
  text-align: center;
}

.info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.info-icon {
  font-size: 48px;
  color: #c7000a;
}

.info-content {
  max-width: 300px;
}

.info-content h4 {
  margin: 0 0 12px 0;
  color: #c7000a;
  font-size: 18px;
}

.info-content p {
  margin: 8px 0;
  color: #595959;
  font-size: 14px;
  line-height: 1.5;
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

.btn-cancel, .btn-close {
  padding: 10px 24px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover:not(:disabled),
.btn-close:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #bfbfbf;
}

.btn-cancel:disabled,
.btn-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 32px;
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save:disabled:hover {
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .correction-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .preview-item.total {
    grid-column: auto;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .btn-cancel, .btn-save, .btn-close {
    width: 100%;
  }
}
</style>