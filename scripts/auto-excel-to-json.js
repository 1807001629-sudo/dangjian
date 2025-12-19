const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 导入转换函数
const { convertExcelToJson } = require('./convert-excel.js');

console.log('========================================');
console.log('🏢 党建管理系统 - 自动启动脚本');
console.log('========================================\n');

// 1. 首先执行Excel转换
console.log('🔄 第一步：检查并更新数据文件...\n');
const result = convertExcelToJson();

if (result.success) {
  console.log(`\n✅ 数据转换成功！共处理 ${result.count} 条记录`);
} else {
  console.log(`\n⚠️ 数据转换失败: ${result.error}`);
  console.log('将使用现有的数据文件继续启动...');
}

console.log('\n========================================');

// 2. 启动Vite开发服务器
console.log('🚀 第二步：启动Vite开发服务器...\n');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 启动Vite
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..') // 在项目根目录运行
});

// 监听进程事件
viteProcess.on('close', (code) => {
  console.log(`\n📤 Vite进程退出，代码: ${code}`);
});

viteProcess.on('error', (error) => {
  console.error('❌ 启动Vite时发生错误:', error.message);
});

// 处理用户中断
process.on('SIGINT', () => {
  console.log('\n\n👋 接收到中断信号，正在退出...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 接收到终止信号，正在退出...');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});