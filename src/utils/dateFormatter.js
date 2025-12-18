// src/utils/dateFormatter.js

/**
 * 格式化日期字符串
 * @param {string|number} dateStr - 日期字符串或数字
 * @returns {string} 格式化后的日期字符串，格式为 YYYY/MM/DD
 */
export function formatDate(dateStr) {
  if (!dateStr && dateStr !== 0) return ''
  
  // 如果是数字类型如 20251218.0
  if (typeof dateStr === 'number' && !isNaN(dateStr)) {
    const dateNum = Math.floor(dateStr) // 去掉 .0
    return formatDateStr(dateNum.toString())
  }
  
  // 如果是字符串类型
  if (typeof dateStr === 'string') {
    return formatDateStr(dateStr)
  }
  
  return dateStr
}

/**
 * 格式化日期字符串的具体实现
 * @param {string} str - 日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDateStr(str) {
  if (!str) return ''
  
  // 移除 .0 后缀
  const cleanStr = str.replace(/\.0$/, '')
  
  // 检查是否是纯数字格式 YYYYMMDD
  if (/^\d{8}$/.test(cleanStr)) {
    const year = cleanStr.substring(0, 4)
    const month = cleanStr.substring(4, 6)
    const day = cleanStr.substring(6, 8)
    return `${year}/${month}/${day}`
  }
  
  // 检查是否是 YYYY/MM/DD 格式（已经是目标格式）
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(cleanStr)) {
    return cleanStr
  }
  
  // 检查是否是 YYYY-MM-DD 格式
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return cleanStr.replace(/-/g, '/')
  }
  
  // 尝试解析其他格式的日期
  try {
    const date = new Date(cleanStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/')
    }
  } catch (e) {
    // 解析失败，返回原字符串
  }
  
  return cleanStr
}

/**
 * 将格式化后的日期字符串转换为 Date 对象
 * @param {string} dateStr - 格式化后的日期字符串（YYYY/MM/DD）
 * @returns {Date|null} Date 对象或 null
 */
export function parseFormattedDate(dateStr) {
  if (!dateStr) return null
  
  try {
    // 处理 YYYY/MM/DD 格式
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('/')
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }
    
    // 尝试其他格式
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date
    }
  } catch (e) {
    console.error('解析日期失败:', dateStr, e)
  }
  
  return null
}

/**
 * 获取日期的显示格式（YYYY年MM月DD日）
 * @param {string} dateStr - 日期字符串
 * @returns {string} 中文格式的日期
 */
export function getChineseDate(dateStr) {
  if (!dateStr) return ''
  
  const formattedDate = formatDate(dateStr)
  if (!formattedDate) return ''
  
  try {
    const [year, month, day] = formattedDate.split('/')
    if (year && month && day) {
      return `${year}年${month}月${day}日`
    }
  } catch (e) {
    // 转换失败，返回格式化后的日期
  }
  
  return formattedDate
}