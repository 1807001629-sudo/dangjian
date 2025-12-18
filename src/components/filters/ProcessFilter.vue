<!-- src/components/filters/ProcessFilter.vue -->
<template>
  <div class="process-filter">
    <div class="filter-row">
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
          <option value="未开始">未开始</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">活动时数</label>
        <div class="range-inputs">
          <input 
            type="number" 
            v-model="filters.hoursMin" 
            placeholder="最小"
            class="range-input"
            @input="emitFilters"
          />
          <span class="range-separator">-</span>
          <input 
            type="number" 
            v-model="filters.hoursMax" 
            placeholder="最大"
            class="range-input"
            @input="emitFilters"
          />
        </div>
      </div>
    </div>
    
    <div class="filter-row">
      <div class="filter-group search-group">
        <label class="filter-label">搜索</label>
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
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
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

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #595959;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
  width: 0; /* 让flex分配宽度 */
}

.range-input:focus {
  outline: none;
  border-color: #c7000a;
}

.range-separator {
  color: #8c8c8c;
  padding: 0 4px;
}

.search-group {
  flex: 2;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #262626;
}

.search-input:focus {
  outline: none;
  border-color: #c7000a;
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
  align-self: flex-end;
  padding: 8px 24px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 38px;
  white-space: nowrap;
}

.btn-reset:hover {
  background: #fff1f0;
  border-color: #ffa39e;
  color: #c7000a;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .btn-reset {
    align-self: stretch;
    height: 40px;
  }
}
</style>