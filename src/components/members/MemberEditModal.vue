<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑成员信息' : '添加新成员'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      label-position="right"
      status-icon
    >
      <!-- 基本信息 -->
      <el-form-item label="姓名：" prop="姓名">
        <el-input v-model="form.姓名" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="学号：" prop="学号">
        <el-input 
          v-model.number="form.学号" 
          placeholder="请输入学号"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="班级：" prop="班级">
        <el-input v-model="form.班级" placeholder="例如：大数据2201" />
      </el-form-item>

      <el-form-item label="政治面貌：" prop="政治面貌">
        <el-select v-model="form.政治面貌" placeholder="请选择政治面貌">
          <el-option label="群众" value="群众" />
          <el-option label="共青团员" value="共青团员" />
          <el-option label="入党积极分子" value="入党积极分子" />
          <el-option label="预备党员" value="预备党员" />
          <el-option label="党员" value="党员" />
        </el-select>
      </el-form-item>

      <el-form-item label="入党流程阶段：" prop="入党流程阶段">
        <el-select v-model="form.入党流程阶段" placeholder="请选择流程阶段">
          <el-option label="未申请" value="未申请" />
          <el-option label="已提交申请" value="已提交申请" />
          <el-option label="积极分子" value="积极分子" />
          <el-option label="发展对象" value="发展对象" />
          <el-option label="预备党员" value="预备党员" />
          <el-option label="正式党员" value="正式党员" />
        </el-select>
      </el-form-item>

      <!-- 日期信息 -->
      <el-form-item label="出生日期：">
        <el-date-picker
          v-model="form.出生年月日"
          type="date"
          placeholder="选择出生日期"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="入校时间：">
        <el-date-picker
          v-model="form.入校时间"
          type="date"
          placeholder="选择入校时间"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>

      <!-- 团员信息 -->
      <el-form-item label="入团时间：" v-if="form.政治面貌 === '共青团员'">
        <el-date-picker
          v-model="form.入团时间"
          type="date"
          placeholder="选择入团时间"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>

      <!-- 入党信息 -->
      <el-form-item label="申请入党时间：">
        <el-date-picker
          v-model="form.申请入党时间"
          type="date"
          placeholder="选择申请入党时间"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="申请时年龄：">
        <el-input-number
          v-model="form['递交入党申请书年龄（岁）']"
          :min="16"
          :max="40"
          :precision="0"
          placeholder="申请入党时年龄"
          style="width: 100%;"
        />
      </el-form-item>

      <!-- 活动时数 -->
      <el-form-item label="活动时数：">
        <el-input-number
          v-model="form.活动时数"
          :min="0"
          :precision="1"
          placeholder="请输入活动时数"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="修正党时：">
        <el-input-number
          v-model="form.修正党时"
          :min="0"
          :precision="1"
          placeholder="请输入修正党时"
          style="width: 100%;"
        />
      </el-form-item>

      <!-- 考试信息 -->
      <el-form-item label="600题考试成绩：">
        <el-input
          v-model="form['600题考试成绩']"
          placeholder="请输入600题考试成绩"
        />
      </el-form-item>

      <el-form-item label="600题考试时间：">
        <el-date-picker
          v-model="form['600题考试时间']"
          type="date"
          placeholder="选择600题考试时间"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="积极分子结业成绩：">
        <el-input
          v-model="form.积极分子结业成绩"
          placeholder="请输入积极分子结业成绩"
        />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注：">
        <el-input
          v-model="form.备注"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  member: {
    type: Object,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({ ...props.member })

// 表单验证规则
const rules = reactive({
  姓名: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  学号: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { type: 'number', message: '学号必须为数字', trigger: 'blur' }
  ],
  班级: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  政治面貌: [
    { required: true, message: '请选择政治面貌', trigger: 'change' }
  ]
})

// 监听传入的 member 变化
watch(() => props.member, (newVal) => {
  Object.assign(form, newVal)
}, { deep: true })

const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    
    submitting.value = true
    
    // 这里可以添加 API 调用
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 触发保存事件
    emit('save', { ...form })
    
    ElMessage.success(props.isEdit ? '更新成功' : '添加成功')
    close()
  } catch (error) {
    if (error && error.fields) {
      ElMessage.error('请检查表单填写是否正确')
    }
  } finally {
    submitting.value = false
  }
}

const close = () => {
  visible.value = false
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>