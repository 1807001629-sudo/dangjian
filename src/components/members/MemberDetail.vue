<template>
  <el-dialog
    v-model="visible"
    :title="`${member.姓名} - 详细信息`"
    width="800px"
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
            <span class="value">{{ member.姓名 }}</span>
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
              {{ member.入党流程阶段 || '未开始' }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">申请入党时间：</span>
            <span class="value">{{ formatDate(member.申请入党时间) }}</span>
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
            <span class="value">{{ member['600题考试成绩'] || '-' }}</span>
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
            <span class="label">党支部接收时间：</span>
            <span class="value">{{ formatDate(member['党支部接收入党积极分子时间']) }}</span>
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

const getPoliticalStatusTagType = (status) => {
  const types = {
    '党员': 'success',
    '预备党员': 'warning',
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

const formatDate = (date) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('zh-CN', {
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
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.section-card {
  margin-bottom: 16px;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.label {
  min-width: 120px;
  color: #606266;
  font-weight: 500;
}

.value {
  color: #303133;
  font-weight: 400;
}

.remark-content {
  color: #606266;
  line-height: 1.6;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>