<template>
  <div class="activities-filter">
    <div class="filter-main">
      <div class="filter-group">
        <label class="filter-label">班级</label>
        <select v-model="filters.class" class="filter-select" @change="emitFilters">
          <option value="">全部班级</option>
          <option v-for="className in uniqueClasses" :key="className" :value="className">
            {{ className }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">政治面貌</label>
        <select v-model="filters.politicalStatus" class="filter-select" @change="emitFilters">
          <option value="">全部</option>
          <option value="中共党员">中共党员</option>
          <option value="中共预备党员">中共预备党员</option>
          <option value="共青团员">共青团员</option>
          <option value="群众">群众</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">入党阶段</label>
        <select v-model="filters.stage" class="filter-select" @change="emitFilters">
          <option value="">全部阶段</option>
          <option value="入党申请人">入党申请人</option>
          <option value="入党积极分子">入党积极分子</option>
          <option value="中共预备党员">中共预备党员</option>
          <option value="中共党员">中共党员</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">修正状态</label>
        <select v-model="filters.correctionStatus" class="filter-select" @change="emitFilters">
          <option value="">全部状态</option>
          <option value="need">需修正 (-50h以内)</option>
          <option value="serious">缺时较多 (-100h以内)</option>
          <option value="critical">严重缺时 (-100h以上)</option>
          <option value="completed">中共党员/已完成</option>
        </select>
      </div>
    </div>
    
    <div class="filter-search">
      <div class="search-group">
        <div class="search-box">
          <input 
            type="text"
            v-model="filters.search"
            placeholder="搜索姓名、学号"
            class="search-input"
            @input="emitFilters"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>
      
      <button class="btn-reset" @click="resetFilters">重置筛选</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

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
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-group {
  flex: 2;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #595959;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #262626;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
  pointer-events: none;
}

.btn-reset {
  padding: 10px 24px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: 42px;
}

.btn-reset:hover {
  background: #f0f0f0;
  border-color: #d9d9d9;
  color: #262626;
}

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
  
  .btn-reset {
    width: 100%;
  }
}
</style>