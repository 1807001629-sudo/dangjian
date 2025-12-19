<template>
  <el-dialog
    v-model="visible"
    :title="`${member.姓名} - 详细信息`"
    width="900px"
    :close-on-click-modal="false"
  >
    <div class="member-detail">
      <!-- 基本信息 -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
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
            <el-tag :type="getPoliticalStatusTagType(member.政治面貌)">
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
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">入党流程阶段：</span>
            <el-tag :type="getProcessStageTagType(member.入党流程阶段)" size="medium">
              <!-- 针对中共党员和中共预备党员的特殊处理 -->
              <template v-if="member.政治面貌 === '中共党员' || member.政治面貌 === '中共预备党员'">
                {{ member.政治面貌 }}
              </template>
              <template v-else>
                {{ member.入党流程阶段 || '未开始' }}
              </template>
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">申请入党时间：</span>
            <span class="value">{{ formatDate(member.申请入党时间) }}</span>
          </div>
          <div class="info-item">
            <span class="label">党支部接收时间：</span>
            <span class="value">{{ formatDate(member['党支部接收入党积极分子时间']) }}</span>
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
            <span class="value">{{ member['递交入党申请书年龄（岁）'] || '-' }} 岁</span>
          </div>
          <div class="info-item">
            <span class="label">活动时数：</span>
            <span class="value">{{ member.活动时数 || 0 }} 小时</span>
          </div>
          <div class="info-item">
            <span class="label">修正党时：</span>
            <span class="value">{{ member.修正党时 || 0 }} 小时</span>
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
              <!-- 积极分子及以上阶段显示"通过" -->
              <template v-if="isAdvancedStage(member)">
                通过
              </template>
              <template v-else>
                {{ member['600题考试成绩'] || '-' }}
              </template>
            </span>
          </div>
          <div class="info-item">
            <span class="label">600题考试时间：</span>
            <span class="value">{{ formatDate(member['600题考试时间']) }}</span>
          </div>
          <div class="info-item">
            <span class="label">积极分子结业成绩：</span>
            <span class="value">{{ member.积极分子结业成绩 || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">四级成绩：</span>
            <span class="value">{{ member.四级成绩 || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">计算机二级：</span>
            <span class="value">{{ member.计算机二级 || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">不及格情况：</span>
            <span class="value">{{ member.不及格情况 || '无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">前一学年综测百分比：</span>
            <span class="value">{{ member.前一学年综测百分比 || '-' }}</span>
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
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="emit('edit')">
          编辑信息
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  member: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'edit'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 获取姓名后两个字作为头像
const getInitials = (name) => {
  if (!name || name.length < 2) return name || '??'
  return name.slice(-2) // 取最后两个字
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

const getProcessStageTagType = (stage) => {
  const types = {
    '正式党员': 'success',
    '预备党员': 'warning',
    '积极分子': 'info',
    '发展对象': '',
    '已提交申请': '',
    '未申请': 'info'
  }
  return types[stage] || ''
}

// 判断是否是积极分子及以上阶段（包括中共预备党员和中共党员）
const isAdvancedStage = (member) => {
  const advancedStages = [
    '入党积极分子', 
    '积极分子培训结业',
    '中共预备党员',
    '中共党员'
  ]
  
  // 如果政治面貌是中共预备党员或中共党员，直接认为是高级阶段
  if (member.政治面貌 === '中共预备党员' || member.政治面貌 === '中共党员') {
    return true
  }
  
  // 或者入党流程阶段是积极分子及以上
  return advancedStages.includes(member.入党流程阶段)
}

const formatDate = (date) => {
  if (!date || date === 'nan' || date === '') return '-'
  try {
    // 尝试解析日期格式
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return date // 如果不是有效日期，返回原字符串
    
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return date
  }
}

const close = () => {
  visible.value = false
}
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
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  min-height: 36px;
}

.label {
  min-width: 140px;
  color: #595959;
  font-weight: 500;
  font-size: 14px;
  line-height: 36px;
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

.remark-content {
  color: #595959;
  line-height: 1.6;
  padding: 8px 0;
  font-size: 14px;
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
</style>