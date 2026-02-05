// src/utils/dateFormatter.js
/**
 * 日期格式化工具函数
 */

// 格式化日期为 YYYY/MM/DD 格式
export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'nan' || dateStr === 'null' || dateStr === 'NaN') {
    return '';
  }
  
  // 如果是数字类型如 20251218.0
  if (typeof dateStr === 'number' && !isNaN(dateStr)) {
    const dateNum = Math.floor(dateStr);
    const dateStrClean = dateNum.toString();
    
    if (dateStrClean.length === 8) {
      const year = dateStrClean.substring(0, 4);
      const month = dateStrClean.substring(4, 6);
      const day = dateStrClean.substring(6, 8);
      return `${year}/${month}/${day}`;
    }
  }
  
  // 如果是字符串类型
  if (typeof dateStr === 'string') {
    // 移除 .0 后缀
    const cleanStr = dateStr.replace(/\.0$/, '');
    
    // 检查是否是纯数字格式 YYYYMMDD
    if (/^\d{8}$/.test(cleanStr)) {
      const year = cleanStr.substring(0, 4);
      const month = cleanStr.substring(4, 6);
      const day = cleanStr.substring(6, 8);
      return `${year}/${month}/${day}`;
    }
    
    // 检查是否是 YYYY-MM-DD 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      return cleanStr;
    }
    
    // 其他格式直接返回
    return cleanStr;
  }
  
  return dateStr;
}

// 别名，兼容旧代码
export const formatTime = formatDate;
export const formatDateStr = formatDate;

// 格式化相对时间（如：3天前）
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '未知时间';
  
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffYear > 0) return `${diffYear}年前`;
  if (diffMonth > 0) return `${diffMonth}个月前`;
  if (diffDay > 0) return `${diffDay}天前`;
  if (diffHour > 0) return `${diffHour}小时前`;
  if (diffMin > 0) return `${diffMin}分钟前`;
  return '刚刚';
}

// 解析日期字符串
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // 尝试解析 YYYYMMDD 格式
    if (/^\d{8}$/.test(dateStr)) {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }
    
    // 尝试解析 YYYY/MM/DD 格式
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // 尝试解析 YYYY-MM-DD 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }
    
    // 尝试通用日期解析
    return new Date(dateStr);
  } catch (e) {
    console.error('解析日期失败:', dateStr, e);
    return null;
  }
}

// 格式化时间范围
export function formatTimeRange(startStr, endStr) {
  const start = formatDate(startStr);
  const end = formatDate(endStr);
  
  if (!start && !end) return '';
  if (start && !end) return `${start} 至今`;
  if (!start && end) return `至 ${end}`;
  if (start === end) return start;
  
  return `${start} - ${end}`;
}

// 计算年龄
export function calculateAge(birthDateStr) {
  if (!birthDateStr) return '';
  
  const birthDate = parseDate(birthDateStr);
  if (!birthDate) return '';
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export default {
  formatDate,
  formatTime,
  formatDateStr,
  formatRelativeTime,
  formatTimeRange,
  calculateAge
};