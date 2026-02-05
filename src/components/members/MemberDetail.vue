<!-- src/components/modals/MemberDetailModal.vue (Element Plus版本) -->
<template>
  <el-dialog
    v-model="visible"
    :title="`${member.姓名} - 详细信息`"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="member-detail" v-loading="loading">
      <!-- 基本信息 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag v-if="isAdvancedStage" size="small" type="success">
              积极分子及以上
            </el-tag>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">姓名：</span>
            <div class="value-with-avatar">
              <div class="avatar" :style="{ background: getAvatarColor(member.姓名) }">
                {{ getInitials(member.姓名) }}
              </div>
              <span class="value">{{ member.姓名 }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="label">学号：</span>
            <span class="value">{{ member.学号 }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级：</span>
            <span class="value">{{ member.班级 }}</span>
          </div>
          <div class="info-item">
            <span class="label">政治面貌：</span>
            <el-tag :type="getPoliticalStatusTagType(member.政治面貌)" size="medium">
              {{ member.政治面貌 }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">出生日期：</span>
            <span class="value">{{ formatDate(member.出生年月日) }}</span>
          </div>
          <div class="info-item">
            <span class="label">入校时间：</span>
            <span class="value">{{ formatDate(member.入校时间) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 入党流程信息 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>入党流程信息</span>
            <div class="process-stats">
              <el-tooltip content="活动时数 + 修正党时">
                <span class="stat-item">
                  <el-icon><Timer /></el-icon>
                  {{ totalHours }}h
                </span>
              </el-tooltip>
            </div>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">入党流程阶段：</span>
            <el-tag :type="getProcessStageTagType(member)" size="medium">
              {{ getProcessStageText(member) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">申请入党时间：</span>
            <span class="value">{{ formatDate(member.申请入党时间) }}</span>
          </div>
          <div class="info-item">
            <span class="label">党支部接收时间：</span>
            <span class="value">{{ formatDate(member['党支部接收入党积极分子时间']) }}</span>
            <span v-if="daysSinceActivist" class="days-count">
              ({{ daysSinceActivist }}天)
            </span>
          </div>
          <div class="info-item">
            <span class="label">确定为发展对象日期：</span>
            <span class="value">{{ formatDate(member.确定为发展对象日期) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支部大会：</span>
            <span class="value">{{ formatDate(member.支部大会) }}</span>
          </div>
          <div class="info-item">
            <span class="label">转正时间：</span>
            <span class="value">{{ formatDate(member.转正时间) }}</span>
          </div>
          <div class="info-item">
            <span class="label">申请时年龄：</span>
            <span class="value">{{ formatNumber(member['递交入党申请书年龄（岁）']) }} 岁</span>
          </div>
          <div class="info-item">
            <span class="label">活动时数：</span>
            <span class="value">{{ formatNumber(member.活动时数) }} 小时</span>
          </div>
          <div class="info-item">
            <span class="label">修正党时：</span>
            <span class="value" :class="getCorrectionClass(member.修正党时)">
              {{ formatNumber(member.修正党时) }} 小时
            </span>
          </div>
        </div>
      </el-card>

      <!-- 学习考试信息 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>学习考试信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">600题考试成绩：</span>
            <span class="value">
              <el-tag v-if="shouldShow600Pass" size="small" type="success">
                通过
              </el-tag>
              <span v-else>{{ formatScore(member['600题考试成绩']) }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">600题考试时间：</span>
            <span class="value">{{ formatDate(member['600题考试时间']) }}</span>
          </div>
          <div class="info-item">
            <span class="label">积极分子结业成绩：</span>
            <span class="value">{{ formatScore(member.积极分子结业成绩) }}</span>
          </div>
          <div class="info-item">
            <span class="label">四级成绩：</span>
            <span class="value" :class="getScoreClass(member.四级成绩, 425)">
              {{ formatScore(member.四级成绩) }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">计算机二级：</span>
            <span class="value" :class="getComputerScoreClass(member)">
              {{ formatScore(member.计算机二级) }}
              <span v-if="computerRequirement" class="requirement-text">
                ({{ computerRequirement }})
              </span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">不及格情况：</span>
            <span class="value" :class="getFailureClass(member.不及格情况)">
              {{ formatFailure(member.不及格情况) }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">前一学年综测百分比：</span>
            <span class="value" :class="getPercentageClass(member)">
              {{ formatPercentage(member.前一学年综测百分比) }}
              <span v-if="comprehensiveRequirement" class="requirement-text">
                ({{ comprehensiveRequirement }})
              </span>
            </span>
          </div>
        </div>
      </el-card>

      <!-- 团员信息 -->
      <el-card class="section-card" v-if="member.政治面貌 === '共青团员'">
        <template #header>
          <div class="card-header">
            <span>团员信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">入团时间：</span>
            <span class="value">{{ formatDate(member.入团时间) }}</span>
          </div>
          <div class="info-item">
            <span class="label">团员资料备注：</span>
            <span class="value">{{ member.团员资料备注 || '-' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 备注信息 -->
      <el-card class="section-card" v-if="member.备注">
        <template #header>
          <div class="card-header">
            <span>备注信息</span>
          </div>
        </template>
        <div class="remark-content">
          {{ member.备注 }}
        </div>
      </el-card>

      <!-- 积极分子资格检查 -->
      <el-card class="section-card" v-if="showActivistQualification">
        <template #header>
          <div class="card-header">
            <span>积极分子资格检查</span>
          </div>
        </template>
        <div class="qualification-check">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="培训结业">
              <el-tag :type="isActivistGraduate ? 'success' : 'danger'" size="small">
                {{ isActivistGraduate ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="满一年">
              <el-tag :type="isFullYear ? 'success' : 'danger'" size="small">
                {{ isFullYear ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="四级达标">
              <el-tag :type="isCET4Pass ? 'success' : 'danger'" size="small">
                {{ isCET4Pass ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="计算机二级">
              <el-tag :type="isComputerPass ? 'success' : 'danger'" size="small">
                {{ isComputerPass ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="无不及格">
              <el-tag :type="isNoFailures ? 'success' : 'danger'" size="small">
                {{ isNoFailures ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="综测达标">
              <el-tag :type="isComprehensivePass ? 'success' : 'danger'" size="small">
                {{ isComprehensivePass ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="qualification-summary">
            <el-alert
              :title="qualificationTitle"
              :type="isQualified ? 'success' : 'error'"
              :closable="false"
              center
            >
              <template #default>
                <div>{{ qualificationMessage }}</div>
              </template>
            </el-alert>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button 
          type="warning" 
          @click="handleCorrection"
          v-if="!isPartyMember"
          :disabled="!canEdit"
        >
          修正党时
        </el-button>
        <el-button 
          type="primary" 
          @click="emit('edit')"
          :disabled="!canEdit"
        >
          编辑信息
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from 'vue'
import { Timer } from '@element-plus/icons-vue'
import { 
  getInitials, 
  getAvatarColor,
  formatScore,
  formatPercentage,
  formatFailure,
  getTotalHours,
  getCorrectionClass as getCorrectionClassUtil,
  isPartyMember as isPartyMemberUtil
} from '@/utils/memberUtils'
import { formatDisplayDate } from '@/utils/dateFormatter'
import { 
  getPoliticalStatusClass,
  getProcessStageText,
  getProcessStageClass,
  shouldShow600Pass,
  getDaysSinceActivist,
  checkActivistQualification
} from '@/services/dataTransformer'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  member: {
    type: Object,
    required: true,
    default: () => ({})
  },
  canEdit: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'edit', 'correction'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)

// 计算属性
const totalHours = computed(() => {
  return getTotalHours(props.member)
})

const isPartyMember = computed(() => {
  return isPartyMemberUtil(props.member)
})

const isAdvancedStage = computed(() => {
  const advancedStages = ['入党积极分子', '积极分子培训结业', '中共预备党员', '中共党员']
  return advancedStages.includes(props.member.入党流程阶段) || isPartyMember.value
})

const shouldShow600Pass = computed(() => {
  return shouldShow600Pass(props.member)
})

const daysSinceActivist = computed(() => {
  return getDaysSinceActivist(props.member)
})

// 积极分子资格检查
const showActivistQualification = computed(() => {
  return props.member.入党流程阶段 === '积极分子培训结业'
})

const qualificationResult = computed(() => {
  if (!showActivistQualification.value) return null
  return checkActivistQualification(props.member)
})

const isActivistGraduate = computed(() => {
  return qualificationResult.value?.积极分子培训结业 || false
})

const isFullYear = computed(() => {
  return qualificationResult.value?.满一年 || false
})

const isCET4Pass = computed(() => {
  return qualificationResult.value?.四级达标 || false
})

const isComputerPass = computed(() => {
  return qualificationResult.value?.计算机二级达标 || false
})

const isNoFailures = computed(() => {
  return qualificationResult.value?.无不及格 || false
})

const isComprehensivePass = computed(() => {
  return qualificationResult.value?.综测达标 || false
})

const isQualified = computed(() => {
  return qualificationResult.value?.总体符合 || false
})

const qualificationTitle = computed(() => {
  return isQualified.value ? '符合积极分子发展条件' : '不符合积极分子发展条件'
})

const qualificationMessage = computed(() => {
  if (!qualificationResult.value) return ''
  
  const { 满一年, 四级达标, 计算机二级达标, 无不及格, 综测达标 } = qualificationResult.value
  
  const failedConditions = []
  if (!满一年) failedConditions.push('未满一年')
  if (!四级达标) failedConditions.push('四级未达标')
  if (!计算机二级达标) failedConditions.push('计算机二级未达标')
  if (!无不及格) failedConditions.push('有不及格记录')
  if (!综测达标) failedConditions.push('综测未达标')
  
  if (failedConditions.length === 0) {
    return '所有条件均符合要求'
  }
  
  return `未满足条件: ${failedConditions.join('、')}`
})

// 计算机二级要求
const computerRequirement = computed(() => {
  const className = props.member.班级 || ''
  if (className.includes('大数据')) {
    return '大数据专业不要求'
  } else if (className.includes('高分子')) {
    return '需≥60分'
  }
  return ''
})

const comprehensiveRequirement = computed(() => {
  const className = props.member.班级 || ''
  if (className.includes('大二') || /22/.test(className)) {
    return '需前40%'
  } else if (className.includes('大三') || /21/.test(className)) {
    return '需前50%'
  } else if (className.includes('大四') || /20/.test(className)) {
    return '需前60%'
  }
  return ''
})

// 格式化函数
const formatDate = formatDisplayDate

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  const num = parseFloat(value)
  return isNaN(num) ? value : num.toFixed(1)
}

// 样式类函数
const getPoliticalStatusTagType = (status) => {
  const types = {
    '中共党员': 'success',
    '中共预备党员': 'warning',
    '入党积极分子': 'info',
    '共青团员': '',
    '群众': 'info'
  }
  return types[status] || ''
}

const getProcessStageTagType = (member) => {
  const classType = getProcessStageClass(member)
  const types = {
    'stage-party': 'success',
    'stage-candidate': 'warning',
    'stage-activist': 'info',
    'stage-graduate': 'info',
    'stage-applicant': '',
    'stage-passed600': '',
    'stage-none': 'info'
  }
  return types[classType] || ''
}

const getCorrectionClass = (correction) => {
  const classType = getCorrectionClassUtil(correction)
  const classes = {
    'positive': 'text-success',
    'warning': 'text-warning',
    'serious': 'text-danger',
    'critical': 'text-danger'
  }
  return classes[classType] || ''
}

const getScoreClass = (score, threshold) => {
  const num = parseFloat(score || 0)
  if (isNaN(num)) return ''
  return num >= threshold ? 'text-success' : 'text-danger'
}

const getComputerScoreClass = (member) => {
  const className = member.班级 || ''
  const score = parseFloat(member.计算机二级 || 0)
  
  if (className.includes('大数据')) {
    return 'text-info' // 大数据专业不要求
  }
  
  if (className.includes('高分子')) {
    return score >= 60 ? 'text-success' : 'text-danger'
  }
  
  return '' // 其他专业暂无要求
}

const getFailureClass = (failure) => {
  if (!failure || failure === 'null' || failure === 'nan' || failure === '无') {
    return 'text-success'
  }
  return 'text-danger'
}

const getPercentageClass = (member) => {
  const percentage = member.前一学年综测百分比
  if (!percentage || percentage === 'nan' || percentage === 'null') return ''
  
  const percentNum = parseFloat(percentage.replace('%', ''))
  if (isNaN(percentNum)) return ''
  
  const className = member.班级 || ''
  let maxPercent = 100
  
  if (className.includes('大二') || /22/.test(className)) {
    maxPercent = 40
  } else if (className.includes('大三') || /21/.test(className)) {
    maxPercent = 50
  } else if (className.includes('大四') || /20/.test(className)) {
    maxPercent = 60
  }
  
  return percentNum <= maxPercent ? 'text-success' : 'text-danger'
}

// 方法
const handleClose = () => {
  loading.value = false
}

const handleCorrection = () => {
  emit('correction', props.member)
}

const close = () => {
  visible.value = false
}

// 监听member变化
watch(() => props.member, () => {
  loading.value = false
}, { deep: true })
</script>

<style scoped>
.member-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.process-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.stat-item .el-icon {
  font-size: 14px;
  color: #c7000a;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.label {
  min-width: 140px;
  color: #595959;
  font-weight: 500;
  font-size: 14px;
  line-height: 36px;
  flex-shrink: 0;
}

.value {
  color: #262626;
  font-weight: 400;
  font-size: 14px;
  line-height: 36px;
  flex: 1;
}

.value-with-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.days-count {
  margin-left: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.requirement-text {
  margin-left: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.text-success {
  color: #52c41a;
  font-weight: 600;
}

.text-warning {
  color: #faad14;
  font-weight: 600;
}

.text-danger {
  color: #ff4d4f;
  font-weight: 600;
}

.text-info {
  color: #1890ff;
  font-weight: 600;
}

.remark-content {
  color: #595959;
  line-height: 1.6;
  padding: 8px 0;
  font-size: 14px;
}

.qualification-check {
  margin-top: 16px;
}

.qualification-summary {
  margin-top: 20px;
}

/* 美化滚动条 */
.member-detail::-webkit-scrollbar {
  width: 6px;
}

.member-detail::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.member-detail::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 3px;
}

.member-detail::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-height: auto;
  }
  
  .label {
    min-width: auto;
    line-height: 1.5;
  }
  
  .value {
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .member-detail {
    max-height: 60vh;
  }
  
  .info-grid {
    gap: 12px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .process-stats {
    align-self: flex-start;
  }
}
</style>