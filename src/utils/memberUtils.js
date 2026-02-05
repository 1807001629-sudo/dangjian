// src/utils/memberUtils.js - 创建基础版本
/**
 * 成员数据处理工具函数
 */

/**
 * 获取成员姓名首字母
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '??'
  return name.slice(0, 2)
}

/**
 * 获取头像颜色
 */
export function getAvatarColor(name) {
  const colors = [
    '#c7000a', '#ff4d4f', '#ff7a45', '#ffa940', '#faad14',
    '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb',
    '#722ed1', '#eb2f96'
  ]
  const index = name ? name.charCodeAt(0) % colors.length : 0
  return colors[index]
}

/**
 * 简化版成员数据处理
 */
export function processMemberData(member) {
  return {
    ...member,
    id: member.id || member.学号 || Math.random().toString(36).substr(2, 9),
    姓名: member.姓名 || '未命名',
    学号: member.学号 || '',
    班级: member.班级 || '',
    显示名称: member.姓名 || '未命名'
  }
}

export default {
  getInitials,
  getAvatarColor,
  processMemberData
}