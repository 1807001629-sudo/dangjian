<!-- src/components/modals/StageDetailModal.vue -->
<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="stage-detail-modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ stage }}详细信息</h3>
        <button class="modal-close" @click="closeModal">×</button>
      </div>
      
      <div class="modal-content">
        <div class="summary-info">
          <div class="summary-card">
            <div class="summary-value">{{ total }}人</div>
            <div class="summary-label">总人数</div>
          </div>
          <div class="summary-card" v-if="stage === '入党申请人' || stage === '入党积极分子'">
            <div class="summary-value">{{ averageHours }}h</div>
            <div class="summary-label">平均活动时数</div>
          </div>
          <div class="summary-card" v-if="stage === '入党申请人'">
            <div class="summary-value">{{ passRate }}%</div>
            <div class="summary-label">600题通过率</div>
          </div>
        </div>
        
        <div class="search-section">
          <div class="search-box">
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索姓名、学号或班级..."
              class="search-input"
              @keyup.enter="performSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          <div class="filter-options">
            <label class="filter-label">
              <input type="checkbox" v-model="showAllDetails" />
              显示详细信息
            </label>
          </div>
        </div>
        
        <div class="member-list">
          <div v-if="filteredList.length === 0" class="empty-list">
            暂无成员数据
          </div>
          <div v-else class="table-container">
            <table class="member-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>姓名</th>
                  <th>学号</th>
                  <th>班级</th>
                  <th>政治面貌</th>
                  <th v-if="stage === '入党申请人'">600题成绩</th>
                  <th>活动时数</th>
                  <th v-if="showAllDetails">联系方式</th>
                  <th v-if="showAllDetails">申请时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in paginatedList" :key="getMemberKey(member, index)">
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td>{{ member.姓名 || '未知' }}</td>
                  <td>{{ member.学号 || '-' }}</td>
                  <td>{{ member.班级 || '-' }}</td>
                  <td>{{ member.政治面貌 || '-' }}</td>
                  <td v-if="stage === '入党申请人'">
                    <span :class="{
                      'pass': member['600题考试成绩'] && member['600题考试成绩'] >= 60, 
                      'fail': member['600题考试成绩'] && member['600题考试成绩'] < 60,
                      'no-data': !member['600题考试成绩']
                    }">
                      {{ member['600题考试成绩'] || '未考' }}
                    </span>
                  </td>
                  <td>{{ member.活动时数 || '0' }}h</td>
                  <td v-if="showAllDetails">{{ member.联系方式 || '-' }}</td>
                  <td v-if="showAllDetails">{{ member.申请时间 || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 分页 -->
          <div class="pagination" v-if="filteredList.length > pageSize">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
            </span>
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-export" @click="exportData">
          <span class="export-icon">📥</span>
          导出数据
        </button>
        <div class="footer-info">
          共 {{ filteredList.length }} 条记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  stage: String,
  members: Array,
  total: Number
});

const emit = defineEmits(['close']);

const searchText = ref('');
const showAllDetails = ref(false);
const currentPage = ref(1);
const pageSize = 10;

const closeModal = () => {
  emit('close');
};

const getMemberKey = (member, index) => {
  return member.id || member.学号 || `${member.姓名}_${index}`;
};

const filteredList = computed(() => {
  if (!searchText.value.trim()) {
    return props.members;
  }
  
  const search = searchText.value.toLowerCase();
  return props.members.filter(member => 
    (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
    (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
    (member.班级 && member.班级.toLowerCase().includes(search))
  );
});

const averageHours = computed(() => {
  if (props.members.length === 0) return '0.0';
  const total = props.members.reduce((sum, member) => {
    return sum + (parseFloat(member.活动时数) || 0);
  }, 0);
  return (total / props.members.length).toFixed(1);
});

const passRate = computed(() => {
  if (props.members.length === 0) return 0;
  const membersWithScore = props.members.filter(member => 
    member['600题考试成绩'] !== undefined && member['600题考试成绩'] !== null
  );
  if (membersWithScore.length === 0) return 0;
  const passed = membersWithScore.filter(member => 
    member['600题考试成绩'] >= 60
  ).length;
  return Math.round((passed / membersWithScore.length) * 100);
});

const totalPages = computed(() => {
  return Math.ceil(filteredList.value.length / pageSize);
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredList.value.slice(start, end);
});

const performSearch = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

const exportData = () => {
  const dataStr = JSON.stringify(filteredList.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.stage}_成员数据_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`已导出${props.stage}的数据，共${filteredList.value.length}条记录`);
};

// 当搜索词变化时重置页码
watch(searchText, () => {
  currentPage.value = 1;
});

// 当成员数据变化时重置页码
watch(() => props.members, () => {
  currentPage.value = 1;
});
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

.stage-detail-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 85vh;
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

.summary-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #c7000a;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 12px;
  color: #8c8c8c;
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
  font-size: 16px;
}

.filter-options {
  display: flex;
  align-items: center;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
}

.filter-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-list {
  text-align: center;
  padding: 60px 0;
  color: #bfbfbf;
  font-size: 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #f0f0f0;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.member-table th {
  background: #fafafa;
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  font-size: 13px;
  border-bottom: 2px solid #f0f0f0;
  white-space: nowrap;
}

.member-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #595959;
  white-space: nowrap;
}

.member-table tbody tr:hover {
  background: #fffafa;
}

.member-table .pass {
  color: #52c41a;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 3px;
}

.member-table .fail {
  color: #ff4d4f;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 3px;
}

.member-table .no-data {
  color: #8c8c8c;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.page-btn {
  padding: 6px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #c7000a;
  color: #c7000a;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #595959;
  min-width: 100px;
  text-align: center;
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

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover {
  background: #d9363e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.2);
}

.export-icon {
  font-size: 16px;
}

.footer-info {
  font-size: 13px;
  color: #8c8c8c;
}

@media (max-width: 768px) {
  .stage-detail-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .summary-info {
    grid-template-columns: 1fr;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .member-table {
    font-size: 12px;
  }
  
  .member-table th,
  .member-table td {
    padding: 8px 12px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .footer-info {
    text-align: center;
  }
}
</style>