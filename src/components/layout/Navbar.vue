<template>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="logo">
        <div class="logo-icon">🏢</div>
        <h1 class="logo-text">党建管理系统</h1>
      </div>
    </div>
    <div class="navbar-center">
      <!-- 移除了搜索框 -->
    </div>
    <div class="navbar-right">
      <div class="user-info">
        <div class="user-avatar">
          <span class="avatar-text">党</span>
        </div>
        <div class="user-details">
          <div class="user-name">管理员</div>
          <div class="user-role">党建工作负责人</div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
// 移除了搜索相关的代码
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-left,
.navbar-center,
.navbar-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-center {
  justify-content: center;
}

.navbar-right {
  justify-content: flex-end;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #c7000a;
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #fafafa;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.user-details {
  text-align: right;
}

.user-name {
  font-weight: 600;
  color: #262626;
  font-size: 14px;
}

.user-role {
  color: #8c8c8c;
  font-size: 12px;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .user-details {
    display: none;
  }
}
</style>