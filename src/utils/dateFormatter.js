// src/services/dataTransformer.js - 修正版
import { formatDate } from '@/utils/dateFormatter';

/**
 * 根据成员数据计算入党阶段
 * @param {Object} member - 成员对象
 * @returns {string} 入党阶段
 */
export function calculateProcessStage(member) {
  if (!member) return '未开始';
  
  // 如果有明确的入党阶段字段，直接使用
  if (member.入党流程阶段) {
    return member.入党流程阶段;
  }
  
  if (member.processStage) {
    return member.processStage;
  }
  
  // 根据入党时间字段判断
  if (member.转正时间) {
    return '中共党员';
  } else if (member.支部大会) {
    return '中共预备党员';
  } else if (member.确定为发展对象日期) {
    return '确定为发展对象';
  } else if (member.积极分子时间) {
    return '入党积极分子';
  } else if (member.递交入党申请书) {
    return '入党申请人';
  }
  
  // 检查是否有积极分子相关信息
  if (member.积极分子所在支部 || member.积极分子批次) {
    return '入党积极分子';
  }
  
  // 检查是否有申请记录
  if (member.递交入党申请书) {
    return '入党申请人';
  }
  
  return '未开始';
}

/**
 * 格式化成员数据以供前端使用
 * @param {Array} members - 原始成员数据
 * @returns {Array} 格式化后的成员数据
 */
export function formatMembersData(members) {
  if (!Array.isArray(members)) return [];
  
  return members.map((member, index) => {
    // 计算入党阶段
    const processStage = calculateProcessStage(member);
    
    // 格式化日期字段
    const 入党申请书日期 = formatDate(member.递交入党申请书);
    const 积极分子时间 = formatDate(member.积极分子时间);
    const 确定为发展对象日期 = formatDate(member.确定为发展对象日期);
    const 支部大会时间 = formatDate(member.支部大会);
    const 转正时间 = formatDate(member.转正时间);
    const 入团时间 = formatDate(member.入团时间);
    
    return {
      // 基础信息
      id: member.id || member.学号 || index,
      姓名: member.姓名 || '未命名',
      学号: member.学号 || '',
      班级: member.班级 || '',
      年级: member.年级 || '',
      性别: member.性别 || '',
      学籍状态: member.学籍状态 || '未知',
      更新时间: member.更新时间,
      
      // 政治面貌和阶段
      政治面貌: member.政治面貌 || '未填写',
      入党流程阶段: processStage,
      
      // 入党相关信息（格式化日期）
      递交入党申请书: 入党申请书日期,
      积极分子时间: 积极分子时间,
      确定为发展对象日期: 确定为发展对象日期,
      支部大会: 支部大会时间,
      转正时间: 转正时间,
      
      // 积极分子信息
      积极分子所在支部: member.积极分子所在支部,
      积极分子批次: member.积极分子批次,
      
      // 团员信息
      入团时间: 入团时间,
      
      // 成绩信息
      结业成绩: member.结业成绩,
      '600题考试成绩': member['600题成绩'] || member['600题考试成绩'] || null,
      综测排名: member.综测排名,
      绩点: member.绩点,
      
      // 证书信息
      英语四级成绩: member.英语四级成绩,
      四级考试时间: formatDate(member.四级考试时间),
      计算机二级成绩: member.计算机二级成绩,
      二级考试时间: formatDate(member.二级考试时间),
      
      // 计算字段
      processStage: processStage,
      isActiveMember: member.isActiveMember || false,
      isPrePartyMember: member.isPrePartyMember || false,
      isPartyMember: member.isPartyMember || false,
      
      // 活动时数
      活动时数: member.活动时数 || 0,
      修正党时: member.修正党时 || 0,
      备注: member.备注 || ''
    };
  });
}

/**
 * 统计各阶段人数
 * @param {Array} members - 成员列表
 * @returns {Object} 各阶段人数统计
 */
export function countByStage(members) {
  const counts = {
    '入党申请人': 0,
    '入党积极分子': 0,
    '确定为发展对象': 0,
    '中共预备党员': 0,
    '中共党员': 0,
    '未开始': 0
  };
  
  members.forEach(member => {
    const stage = calculateProcessStage(member);
    counts[stage] = (counts[stage] || 0) + 1;
  });
  
  return counts;
}

/**
 * 获取班级列表
 * @param {Array} members - 成员列表
 * @returns {Array} 班级列表
 */
export function getClassList(members) {
  const classes = new Set();
  members.forEach(member => {
    if (member.班级) {
      classes.add(member.班级);
    }
  });
  return Array.from(classes).sort();
}

/**
 * 获取政治面貌列表
 * @param {Array} members - 成员列表
 * @returns {Array} 政治面貌列表
 */
export function getPoliticalStatusList(members) {
  const statuses = new Set();
  members.forEach(member => {
    if (member.政治面貌 && member.政治面貌 !== '未填写') {
      statuses.add(member.政治面貌);
    }
  });
  return Array.from(statuses).sort();
}

export default {
  calculateProcessStage,
  formatMembersData,
  countByStage,
  getClassList,
  getPoliticalStatusList
};