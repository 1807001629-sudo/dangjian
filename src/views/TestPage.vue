<template>
  <div style="padding: 40px; text-align: center;">
    <h1 style="color: green;">✅ 测试页面加载成功！</h1>
    <p>时间: {{ new Date().toLocaleTimeString() }}</p>
    <p>路由正常！</p>
  </div>
</template>

<script setup>
console.log('TestPage.vue 加载成功');
</script>