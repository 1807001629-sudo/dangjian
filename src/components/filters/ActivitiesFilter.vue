<!-- src/components/filters/ActivitiesFilter.vue (Element Plus版本) -->
<template>
  <div class="activities-filter">
    <div class="filter-main">
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
        </el-select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">修正状态</label>
        <el-select
          v-model="filters.correctionStatus"
          placeholder="全部状态"
          clearable
          size="medium"
          @change="emitFilters"
          style="width: 100%;"
        >
          <el-option label="需修正 (-50h以内)" value="need" />
          <el-option label="缺时较多 (-100h以内)" value="serious" />
          <el-option label="严重缺时 (-100h以上)" value="critical" />
          <el-option label="中共党员/已完成" value="completed" />
        </el-select>
      </div>
    </div>
    
    <div class="filter-search">
      <div class="search-group">
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
        style="margin-left: 8px;"
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
  correctionStatus: '',
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
    correctionStatus: '',
    search: ''
  }
  emit('filter-change', {})
}
</script>

<style scoped>
.activities-filter {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.filter-main {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-search {
  display: flex;
  gap: 8px;
  align-items: center;
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
  font-size: 13px;
  font-weight: 500;
  color: #595959;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-main {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-search {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group,
  .search-group {
    min-width: 100%;
  }
  
  :deep(.el-select),
  :deep(.el-input) {
    width: 100%;
  }
}
</style>