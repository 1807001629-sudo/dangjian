<!-- src/components/filters/ProcessFilter.vue (Element Plus版本) -->
<template>
  <div class="process-filter">
    <div class="filter-row">
      <div class="filter-group">
        <label class="filter-label">班级</label>
        <el-select
          v-model="filters.class"
          placeholder="全部班级"
          clearable
          size="medium"
          @change="emitFilters"
          style="width: 100%;"
        >
          <el-option
            v-for="className in uniqueClasses"
            :key="className"
            :label="className"
            :value="className"
          />
        </el-select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">政治面貌</label>
        <el-select
          v-model="filters.politicalStatus"
          placeholder="全部"
          clearable
          size="medium"
          @change="emitFilters"
          style="width: 100%;"
        >
          <el-option label="中共党员" value="中共党员" />
          <el-option label="中共预备党员" value="中共预备党员" />
          <el-option label="共青团员" value="共青团员" />
          <el-option label="群众" value="群众" />
        </el-select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">入党阶段</label>
        <el-select
          v-model="filters.stage"
          placeholder="全部阶段"
          clearable
          size="medium"
          @change="emitFilters"
          style="width: 100%;"
        >
          <el-option label="入党申请人" value="入党申请人" />
          <el-option label="入党积极分子" value="入党积极分子" />
          <el-option label="中共预备党员" value="中共预备党员" />
          <el-option label="中共党员" value="中共党员" />
          <el-option label="未开始" value="未开始" />
        </el-select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">活动时数范围</label>
        <div class="range-inputs">
          <el-input-number
            v-model="filters.hoursMin"
            placeholder="最小"
            size="medium"
            :min="0"
            :precision="1"
            controls-position="right"
            @change="emitFilters"
            style="width: 100%;"
          />
          <span class="range-separator">-</span>
          <el-input-number
            v-model="filters.hoursMax"
            placeholder="最大"
            size="medium"
            :min="0"
            :precision="1"
            controls-position="right"
            @change="emitFilters"
            style="width: 100%;"
          />
        </div>
      </div>
    </div>
    
    <div class="filter-row">
      <div class="filter-group search-group">
        <label class="filter-label">搜索</label>
        <el-input
          v-model="filters.search"
          placeholder="搜索姓名、学号"
          clearable
          size="medium"
          @input="emitFilters"
          :prefix-icon="Search"
          style="width: 100%;"
        />
      </div>
      
      <el-button 
        type="info" 
        plain 
        size="medium" 
        @click="resetFilters"
        style="align-self: flex-end;"
      >
        重置筛选
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  uniqueClasses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter-change'])

const filters = ref({
  class: '',
  politicalStatus: '',
  stage: '',
  hoursMin: '',
  hoursMax: '',
  search: ''
})

const emitFilters = () => {
  const cleanFilters = {}
  Object.keys(filters.value).forEach(key => {
    if (filters.value[key] !== '' && filters.value[key] !== null && filters.value[key] !== undefined) {
      cleanFilters[key] = filters.value[key]
    }
  })
  emit('filter-change', cleanFilters)
}

const resetFilters = () => {
  filters.value = {
    class: '',
    politicalStatus: '',
    stage: '',
    hoursMin: '',
    hoursMax: '',
    search: ''
  }
  emit('filter-change', {})
}
</script>

<style scoped>
.process-filter {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-group {
  flex: 2;
  min-width: 300px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #595959;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-separator {
  color: #8c8c8c;
  padding: 0 4px;
  font-size: 14px;
}

/* 调整Element Plus组件样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

:deep(.el-input-number) {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .range-inputs {
    gap: 16px;
  }
  
  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>