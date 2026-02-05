<!-- src/views/Home.vue - 最简单的主页 -->
<template>
  <div class="home-page">
    <div class="header">
      <h1>🏛️ 党建管理系统</h1>
      <p>基于SQL Server数据库的党建信息管理系统</p>
    </div>
    
    <div class="status-panel">
      <div class="status-card" :class="{ 'online': apiOnline }">
        <div class="status-icon">{{ apiOnline ? '✅' : '❌' }}</div>
        <div class="status-content">
          <h3>API服务</h3>
          <p>{{ apiOnline ? '运行正常' : '连接失败' }}</p>
        </div>
      </div>
      
      <div class="status-card" :class="{ 'online': dbOnline }">
        <div class="status-icon">{{ dbOnline ? '✅' : '❌' }}</div>
        <div class="status-content">
          <h3>数据库</h3>
          <p>{{ dbOnline ? '连接正常' : '连接失败' }}</p>
        </div>
      </div>
      
      <div class="status-card">
        <div class="status-icon">📊</div>
        <div class="status-content">
          <h3>数据统计</h3>
          <p>{{ memberCount }} 名成员</p>
        </div>
      </div>
    </div>
    
    <div class="data-panel">
      <div class="panel-header">
        <h2>成员列表</h2>
        <button @click="refreshData" class="btn-refresh">刷新数据</button>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在加载数据...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>❌ {{ error }}</p>
        <button @click="refreshData" class="btn-retry">重试</button>
      </div>
      
      <div v-else class="members-table">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>学号</th>
              <th>班级</th>
              <th>性别</th>
              <th>学籍状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id">
              <td>{{ member.姓名 }}</td>
              <td>{{ member.学号 }}</td>
              <td>{{ member.班级 }}</td>
              <td>{{ member.性别 }}</td>
              <td>{{ member.学籍状态 }}</td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          <p>显示 {{ members.length }} 条记录</p>
        </div>
      </div>
    </div>
    
    <div class="api-info">
      <h3>API接口测试</h3>
      <div class="api-links">
        <a :href="apiBaseUrl" target="_blank">API根目录</a>
        <a :href="apiBaseUrl + '/health'" target="_blank">健康检查</a>
        <a :href="apiBaseUrl + '/members'" target="_blank">成员数据</a>
        <a :href="apiBaseUrl + '/test-query'" target="_blank">测试查询</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const apiOnline = ref(false)
const dbOnline = ref(false)
const memberCount = ref(0)
const members = ref([])
const loading = ref(false)
const error = ref('')

// API基础URL
const apiBaseUrl = 'http://localhost:3001/api'

// 初始化数据
onMounted(async () => {
  await checkServices()
  await loadMembers()
})

// 检查服务状态
async function checkServices() {
  try {
    // 检查API
    const healthRes = await fetch(apiBaseUrl + '/health')
    apiOnline.value = healthRes.ok
    
    // 检查数据库
    const dbRes = await fetch(apiBaseUrl + '/db-status')
    if (dbRes.ok) {
      const data = await dbRes.json()
      dbOnline.value = data.connected
    }
  } catch (err) {
    console.error('检查服务失败:', err)
  }
}

// 加载成员数据
async function loadMembers() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(apiBaseUrl + '/members')
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      members.value = data.data
      memberCount.value = data.count || data.data.length
    } else {
      throw new Error(data.error || 'API返回失败')
    }
  } catch (err) {
    error.value = err.message
    console.error('加载数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 刷新数据
async function refreshData() {
  await checkServices()
  await loadMembers()
}
</script>

<style scoped>
.home-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header h1 {
  font-size: 36px;
  color: #c7000a;
  margin: 0 0 12px 0;
}

.header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.status-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.status-card.online {
  border-left: 4px solid #52c41a;
}

.status-card:not(.online) {
  border-left: 4px solid #f5222d;
}

.status-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
}

.status-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #262626;
}

.status-content p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.data-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.panel-header h2 {
  margin: 0;
  font-size: 24px;
  color: #262626;
}

.btn-refresh {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-radius: 50%;
  border-top-color: #c7000a;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  margin: 20px 0;
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 24px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.members-table {
  overflow-x: auto;
}

.members-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.members-table th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  border-bottom: 2px solid #f0f0f0;
}

.members-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #595959;
}

.members-table tr:hover {
  background: #fafafa;
}

.table-footer {
  margin-top: 16px;
  text-align: right;
  color: #8c8c8c;
  font-size: 14px;
}

.api-info {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 12px;
  padding: 24px;
}

.api-info h3 {
  margin: 0 0 16px 0;
  color: #389e0d;
}

.api-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.api-links a {
  display: inline-block;
  padding: 8px 16px;
  background: white;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  color: #389e0d;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.api-links a:hover {
  background: #f6ffed;
  border-color: #73d13d;
  transform: translateY(-1px);
}
</style>