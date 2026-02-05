// src/utils/dataParser.js
/**
 * 数据解析工具函数
 */
import { formatDateStr, getProcessStageText } from '@/services/dataTransformer';

// 解析Excel数据（模拟函数）
export function parseExcelData(data) {
  console.log('解析Excel数据:', data);
  // 这里原本处理Excel数据的逻辑
  // 现在API改造后，这个函数可能不需要了
  return Array.isArray(data) ? data : [];
}

// 一键查询符合条件的积极分子
export function oneClickActivistQuery(members, options = {}) {
  console.log('执行积极分子查询:', { 
    成员数量: members.length,
    选项: options 
  });
  
  // 这里可以调用 dataTransformer.js 中的函数
  // 暂时返回模拟数据
  return {
    符合条件成员: [],
    不符合条件成员: [],
    所有结果: members,
    查询选项: options,
    统计信息: {
      积极分子总数: 0,
      符合条件人数: 0,
      不符合条件人数: 0,
      符合条件比例: '0%',
      启用的条件数: 0
    }
  };
}

// 计算成为积极分子至今的天数
export function getDaysSinceActivist(member) {
  const activistTime = member.积极分子时间 || member['党支部接收入党积极分子时间'];
  if (!activistTime || activistTime === '') return 0;
  
  try {
    const currentDate = new Date();
    let activistDate;
    
    const dateStr = activistTime.toString();
    if (/^\d{8}$/.test(dateStr)) {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      activistDate = new Date(year, month, day);
    } else {
      activistDate = new Date(dateStr);
    }
    
    if (isNaN(activistDate.getTime())) return 0;
    
    const diffTime = Math.abs(currentDate - activistDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    console.error('计算天数错误:', e);
    return 0;
  }
}

// 获取成员标签
export function getMemberTags(member) {
  const tags = [];
  
  if (member.政治面貌 === '中共党员') {
    tags.push({ text: '党员', color: 'red' });
  } else if (member.政治面貌 === '中共预备党员') {
    tags.push({ text: '预备党员', color: 'orange' });
  } else if (member.政治面貌 === '共青团员') {
    tags.push({ text: '团员', color: 'green' });
  }
  
  // 入党阶段标签
  const stage = getProcessStageText(member);
  if (stage === '入党申请人') {
    tags.push({ text: '申请人', color: 'blue' });
  } else if (stage === '入党积极分子') {
    tags.push({ text: '积极分子', color: 'purple' });
  } else if (stage === '确定为发展对象') {
    tags.push({ text: '发展对象', color: 'cyan' });
  }
  
  return tags;
}

// 格式化成员信息用于显示
export function formatMemberForDisplay(member) {
  if (!member) return {};
  
  return {
    id: member.id || member.学号,
    姓名: member.姓名 || '',
    学号: member.学号 || '',
    班级: member.班级 || '',
    政治面貌: member.政治面貌 || '群众',
    入党流程阶段: getProcessStageText(member),
    积极分子时间: formatDateStr(member.积极分子时间),
    递交入党申请书: formatDateStr(member.递交入党申请书),
    确定为发展对象日期: formatDateStr(member.确定为发展对象日期),
    支部大会: formatDateStr(member.支部大会),
    转正时间: formatDateStr(member.转正时间),
    活动时数: member.活动时数 || 0,
    修正党时: member.修正党时 || 0,
    四级成绩: member.四级成绩 || 0,
    计算机二级: member.计算机二级 || 0
  };
}

// 筛选成员
export function filterMembers(members, filters) {
  if (!Array.isArray(members) || members.length === 0) return [];
  if (!filters || Object.keys(filters).length === 0) return members;
  
  return members.filter(member => {
    // 搜索过滤
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const match = 
        (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
        (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
        (member.班级 && member.班级.toLowerCase().includes(search));
      if (!match) return false;
    }
    
    // 政治面貌过滤
    if (filters.政治面貌 && member.政治面貌 !== filters.政治面貌) {
      return false;
    }
    
    // 入党阶段过滤
    if (filters.入党流程阶段) {
      const currentStage = getProcessStageText(member);
      if (currentStage !== filters.入党流程阶段) {
        return false;
      }
    }
    
    // 班级过滤
    if (filters.班级 && member.班级 !== filters.班级) {
      return false;
    }
    
    // 性别过滤
    if (filters.性别 && member.性别 !== filters.性别) {
      return false;
    }
    
    return true;
  });
}

export default {
  parseExcelData,
  oneClickActivistQuery,
  getDaysSinceActivist,
  getMemberTags,
  formatMemberForDisplay,
  filterMembers
};