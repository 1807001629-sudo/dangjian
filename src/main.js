import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

console.log('🚀 main.js开始执行...')

// 创建Vue应用
const app = createApp(App)

console.log('✅ Vue应用实例已创建')

// 使用路由
app.use(router)
console.log('✅ 路由已安装')

// 使用Element Plus
app.use(ElementPlus)
console.log('✅ Element Plus已安装')

// 挂载应用
console.log('🔄 正在挂载应用到 #app...')

try {
  app.mount('#app')
  console.log('🎉 Vue应用已成功挂载！')
  
  // 3秒后隐藏加载界面
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen')
    if (loadingScreen) {
      loadingScreen.style.display = 'none'
      console.log('✅ 加载界面已隐藏')
    }
  }, 3000)
  
} catch (error) {
  console.error('❌ 应用挂载失败:', error)
  
  // 显示错误信息
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 30px; background: #fff2f0; border-radius: 8px; border: 1px solid #ffccc7;">
        <h2 style="color: #c7000a;">❌ 应用启动失败</h2>
        <p><strong>错误信息:</strong> ${error.message}</p>
        <p><strong>堆栈:</strong></p>
        <pre style="background: white; padding: 10px; border-radius: 4px; overflow: auto;">${error.stack}</pre>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #c7000a; color: white; border: none; border-radius: 4px; cursor: pointer;">
          重新加载
        </button>
      </div>
    `
  }
}