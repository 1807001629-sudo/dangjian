// src/utils/dataParser.js
/**
 * 数据处理工具函数
 */

// 解析数据为前端可用格式
export function parseExcelData(rawData) {
  const members = rawData.map((member, index) => {
    // 处理NaN值
    const processedMember = {
      id: index + 1,
      姓名: member.姓名 || '',
      学号: member.学号 || '',
      班级: member.班级 || '',
      政治面貌: member.政治面貌 || '群众',
      入党流程阶段: member.入党流程阶段 || '',
      活动时数: handleNaN(member.活动时数, true), // true表示保持空字符串
      修正党时: handleNaN(member.修正党时, true),
      '600题考试成绩': handle600Score(member['600题考试成绩'], member.入党流程阶段),
      入团时间: formatDateStr(member.入团时间),
      出生年月日: formatDateStr(member.出生年月日),
      申请入党时间: formatDateStr(member.申请入党时间),
      '600题考试时间': formatDateStr(member['600题考试时间']),
      '党支部接收入党积极分子时间': formatDateStr(member['党支部接收入党积极分子时间']),
      积极分子结业成绩: handleNaN(member.积极分子结业成绩, false),
      '递交入党申请书年龄（岁）': handleNaN(member['递交入党申请书年龄（岁）'], false),
      四级成绩: handleNaN(member.四级成绩, false),
      计算机二级: handleNaN(member.计算机二级, false),
      不及格情况: handleFailure(member.不及格情况),
      前一学年综测百分比: handlePercentage(member.前一学年综测百分比),
      确定为发展对象日期: formatDateStr(member.确定为发展对象日期),
      支部大会: formatDateStr(member.支部大会),
      转正时间: formatDateStr(member.转正时间),
      备注: member.备注 || '',
      
      // 计算额外字段
      isActive: parseFloat(member.活动时数) > 0,
      processStage: getProcessStage(member.入党流程阶段),
      activityScore: parseFloat(member.活动时数) || 0,
      testScore: handle600Score(member['600题考试成绩'], member.入党流程阶段),
      totalScore: (parseFloat(member.活动时数) || 0) + (handle600Score(member['600题考试成绩'], member.入党流程阶段) || 0)
    };
    
    return processedMember;
  });
  
  return {
    members,
    stats: generateStats(members)
  };
}

// 处理600题成绩 - 积极分子及之后阶段默认通过
function handle600Score(score, stage) {
  const advancedStages = ['入党积极分子', '积极分子培训结业', '中共预备党员', '中共党员'];
  
  // 如果是积极分子及之后的阶段，且成绩为0或空，则默认60分
  if (advancedStages.includes(stage) && (!score || score === 'nan' || score === 'NaN' || score === 'null' || parseFloat(score) === 0)) {
    return '通过';
  }
  
  // 否则正常处理
  return handleNaN(score, false);
}

// 处理NaN值
function handleNaN(value, keepEmpty = false) {
  if (!value || value === 'nan' || value === 'NaN' || value === 'null') {
    return keepEmpty ? '' : 0;
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? (keepEmpty ? '' : 0) : num;
}

// 处理不及格情况
function handleFailure(failure) {
  if (!failure || failure === 'nan' || failure === 'NaN' || failure === 'null') {
    return '无';
  }
  return failure;
}

// 处理百分比
function handlePercentage(percentage) {
  if (!percentage || percentage === 'nan' || percentage === 'NaN' || percentage === 'null') {
    return '';
  }
  
  // 确保有%符号
  const value = percentage.toString();
  return value.includes('%') ? value : value + '%';
}

// 日期格式化函数
export function formatDateStr(dateStr) {
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

// 获取流程阶段编号
function getProcessStage(stage) {
  const stages = {
    '': 0,
    '入党申请人': 1,
    '通过600题': 2,
    '入党积极分子': 3,
    '积极分子培训结业': 4,
    '中共预备党员': 5,
    '中共党员': 6
  };
  return stages[stage] || 0;
}

// 生成统计信息
export function generateStats(members) {
  const stats = {
    total: members.length,
    byPoliticalStatus: {},
    byClass: {},
    byProcessStage: {},
    byGrade: {},
    activityHours: {
      total: 0,
      average: 0,
      max: 0,
      min: 0
    },
    testScores: {
      total: 0,
      count: 0,
      average: 0,
      max: 0,
      min: 0
    }
  };
  
  // 初始化政治面貌统计
  const statusTypes = ['中共党员', '中共预备党员', '共青团员', '群众'];
  statusTypes.forEach(status => {
    stats.byPoliticalStatus[status] = 0;
  });
  
  // 统计成员数据
  members.forEach(member => {
    // 政治面貌统计
    const status = member.政治面貌 || '群众';
    stats.byPoliticalStatus[status] = (stats.byPoliticalStatus[status] || 0) + 1;
    
    // 班级统计
    const className = member.班级 || '未知班级';
    if (!stats.byClass[className]) {
      stats.byClass[className] = {
        total: 0,
        byStatus: {}
      };
    }
    stats.byClass[className].total++;
    
    // 流程阶段统计
    const stage = member.入党流程阶段 || '未开始';
    stats.byProcessStage[stage] = (stats.byProcessStage[stage] || 0) + 1;
    
    // 活动时数统计
    const hours = parseFloat(member.活动时数) || 0;
    stats.activityHours.total += hours;
    if (hours > stats.activityHours.max) stats.activityHours.max = hours;
    
    // 考试成绩统计
    const score = parseFloat(member['600题考试成绩']) || 0;
    if (score > 0) {
      stats.testScores.total += score;
      stats.testScores.count++;
      if (score > stats.testScores.max) stats.testScores.max = score;
    }
  });
  
  // 计算平均值
  stats.activityHours.average = stats.total > 0 ? 
    stats.activityHours.total / stats.total : 0;
  stats.testScores.average = stats.testScores.count > 0 ? 
    stats.testScores.total / stats.testScores.count : 0;
  
  // 设置最小值
  stats.activityHours.min = 0;
  stats.testScores.min = 0;
  
  return stats;
}

// ==== 积极分子资格查询函数 ====

/**
 * 检查积极分子资格（可配置条件）
 * @param {Object} member 成员数据
 * @param {Object} options 查询选项
 * @param {Date} currentDate 当前日期（可选）
 * @returns {Object} 包含各项条件和总体结果的对象
 */
export function checkActivistQualification(member, options = {}, currentDate = new Date()) {
  const defaultOptions = {
    checkFullYear: true,      // 检查满一年
    checkCET4: true,          // 检查四级
    checkComputer: true,      // 检查计算机二级
    checkFailures: true,      // 检查不及格情况
    checkComprehensive: true, // 检查综测
    strictMode: false         // 严格模式（必须全部通过）
  };
  
  const settings = { ...defaultOptions, ...options };
  
  const result = {
    积极分子培训结业: member.入党流程阶段 === '积极分子培训结业',
    满一年: false,
    四级达标: false,
    计算机二级达标: false,
    无不及格: false,
    综测达标: false,
    总体符合: false,
    详细信息: {},
    启用的条件: [],
    使用的选项: settings
  };
  
  // 记录启用的条件
  if (settings.checkFullYear) result.启用的条件.push('满一年');
  if (settings.checkCET4) result.启用的条件.push('四级达标');
  if (settings.checkComputer) result.启用的条件.push('计算机二级达标');
  if (settings.checkFailures) result.启用的条件.push('无不及格');
  if (settings.checkComprehensive) result.启用的条件.push('综测达标');
  
  // 检查积极分子培训结业
  if (!result.积极分子培训结业) {
    return {
      ...result,
      总体符合: false,
      失败原因: '不是积极分子培训结业'
    };
  }
  
  // 检查满一年条件
  if (settings.checkFullYear) {
    const activistTime = member['党支部接收入党积极分子时间'];
    let fullYearPass = false;
    
    if (activistTime && activistTime !== '') {
      try {
        const daysSince = getDaysSinceActivist(member);
        fullYearPass = daysSince >= 365;
        result.详细信息.成为积极分子天数 = daysSince;
        result.详细信息.积极分子时间 = activistTime;
      } catch (e) {
        console.error('计算积极分子时间错误:', e);
      }
    }
    
    result.满一年 = fullYearPass;
    
    if (!fullYearPass && settings.strictMode) {
      return {
        ...result,
        总体符合: false,
        失败原因: '积极分子培训结业未满一年'
      };
    }
  } else {
    result.满一年 = true; // 条件未启用，视为通过
  }
  
  // 检查四级
  if (settings.checkCET4) {
    const cet4Score = parseFloat(member.四级成绩 || 0);
    const cet4Pass = cet4Score >= 425;
    result.四级达标 = cet4Pass;
    result.详细信息.四级成绩 = cet4Score;
    
    if (!cet4Pass && settings.strictMode) {
      return {
        ...result,
        总体符合: false,
        失败原因: '四级成绩未达标'
      };
    }
  } else {
    result.四级达标 = true; // 条件未启用，视为通过
  }
  
  // 检查计算机二级
  if (settings.checkComputer) {
    const className = member.班级 || '';
    const computerScore = parseFloat(member.计算机二级 || 0);
    let computerPass = false;
    let requirement = '';
    
    if (className.includes('大数据')) {
      computerPass = true;
      requirement = '大数据专业不要求';
    } else if (className.includes('高分子')) {
      computerPass = computerScore >= 60;
      requirement = '高分子专业需≥60分';
    } else {
      computerPass = true;
      requirement = '其他专业暂不要求';
    }
    
    result.计算机二级达标 = computerPass;
    result.详细信息.计算机二级要求 = requirement;
    result.详细信息.计算机二级成绩 = computerScore;
    result.详细信息.专业 = className;
    
    if (!computerPass && settings.strictMode) {
      return {
        ...result,
        总体符合: false,
        失败原因: '计算机二级未达标'
      };
    }
  } else {
    result.计算机二级达标 = true; // 条件未启用，视为通过
  }
  
  // 检查不及格情况
  if (settings.checkFailures) {
    const failure = member.不及格情况;
    const noFailures = failure === '无' || !failure || failure === '';
    result.无不及格 = noFailures;
    result.详细信息.不及格情况 = failure;
    
    if (!noFailures && settings.strictMode) {
      return {
        ...result,
        总体符合: false,
        失败原因: '有不及格情况'
      };
    }
  } else {
    result.无不及格 = true; // 条件未启用，视为通过
  }
  
  // 检查综测百分比
  if (settings.checkComprehensive) {
    const percentage = member.前一学年综测百分比;
    let comprehensivePass = false;
    
    if (percentage && percentage !== '') {
      try {
        const percentNum = parseFloat(percentage.replace('%', ''));
        if (!isNaN(percentNum)) {
          const className = member.班级 || '';
          let gradeLevel = 0;
          let maxPercent = 100;
          let requirement = '';
          
          if (className.includes('大二') || /22/.test(className)) {
            gradeLevel = 2;
            maxPercent = 40;
            requirement = '专业前40%';
          } else if (className.includes('大三') || /21/.test(className)) {
            gradeLevel = 3;
            maxPercent = 50;
            requirement = '专业前50%';
          } else if (className.includes('大四') || /20/.test(className)) {
            gradeLevel = 4;
            maxPercent = 60;
            requirement = '专业前60%';
          }
          
          comprehensivePass = percentNum <= maxPercent;
          result.详细信息.综测要求 = requirement;
          result.详细信息.综测百分比 = percentage;
          result.详细信息.年级 = gradeLevel;
          
          if (!comprehensivePass && settings.strictMode) {
            return {
              ...result,
              总体符合: false,
              失败原因: '综测百分比未达标'
            };
          }
        }
      } catch (e) {
        console.error('解析综测百分比错误:', e);
      }
    }
    
    result.综测达标 = comprehensivePass;
  } else {
    result.综测达标 = true; // 条件未启用，视为通过
  }
  
  // 计算总体符合条件
  const enabledConditions = [];
  if (settings.checkFullYear) enabledConditions.push(result.满一年);
  if (settings.checkCET4) enabledConditions.push(result.四级达标);
  if (settings.checkComputer) enabledConditions.push(result.计算机二级达标);
  if (settings.checkFailures) enabledConditions.push(result.无不及格);
  if (settings.checkComprehensive) enabledConditions.push(result.综测达标);
  
  // 严格模式下必须全部通过，否则看是否全部启用的条件都通过
  if (settings.strictMode) {
    result.总体符合 = enabledConditions.every(condition => condition === true);
  } else {
    result.总体符合 = enabledConditions.length === 0 ? false : enabledConditions.every(condition => condition === true);
  }
  
  return result;
}

/**
 * 批量查询符合条件的积极分子
 * @param {Array} members 成员数组
 * @param {Object} options 查询选项
 * @param {Date} currentDate 当前日期
 * @returns {Object} 查询结果
 */
export function queryQualifiedActivists(members, options = {}, currentDate = new Date()) {
  const allResults = [];
  const qualified = [];
  const disqualified = [];
  
  // 首先过滤出积极分子培训结业的成员
  const activists = members.filter(member => 
    member.入党流程阶段 === '积极分子培训结业'
  );
  
  // 检查每个积极分子
  activists.forEach(member => {
    const qualification = checkActivistQualification(member, options, currentDate);
    const result = {
      成员: member,
      资格: qualification,
      符合条件: qualification.总体符合
    };
    
    allResults.push(result);
    
    if (qualification.总体符合) {
      qualified.push(member);
    } else {
      disqualified.push({
        成员: member,
        资格: qualification,
        失败原因: qualification.失败原因 || getFailureReasons(qualification, options)
      });
    }
  });
  
  return {
    符合条件成员: qualified,
    不符合条件成员: disqualified,
    所有结果: allResults,
    查询选项: options,
    统计信息: {
      积极分子总数: activists.length,
      符合条件人数: qualified.length,
      不符合条件人数: disqualified.length,
      符合条件比例: activists.length > 0 ? 
                    ((qualified.length / activists.length) * 100).toFixed(1) + '%' : '0%',
      启用的条件数: Object.values(options).filter(v => v === true).length
    }
  };
}

/**
 * 获取失败原因
 * @param {Object} qualification 资格检查结果
 * @param {Object} options 查询选项
 * @returns {Array} 失败原因数组
 */
function getFailureReasons(qualification, options) {
  const reasons = [];
  
  if (!qualification.积极分子培训结业) {
    reasons.push('不是积极分子培训结业');
  }
  
  if (options.checkFullYear && !qualification.满一年) {
    reasons.push('积极分子培训结业未满一年');
  }
  
  if (options.checkCET4 && !qualification.四级达标) {
    reasons.push('四级成绩未达标');
  }
  
  if (options.checkComputer && !qualification.计算机二级达标) {
    reasons.push('计算机二级未达标');
  }
  
  if (options.checkFailures && !qualification.无不及格) {
    reasons.push('有不及格情况');
  }
  
  if (options.checkComprehensive && !qualification.综测达标) {
    reasons.push('综测百分比未达标');
  }
  
  return reasons;
}

/**
 * 一键查询符合条件的积极分子
 * @param {Array} members 所有成员数据
 * @param {Object} options 查询选项
 * @returns {Object} 查询结果
 */
export function oneClickActivistQuery(members, options = {}) {
  const currentDate = new Date();
  return queryQualifiedActivists(members, options, currentDate);
}

/**
 * 格式化日期字符串（用于显示）
 * @param {String} dateStr 日期字符串
 * @returns {String} 格式化后的日期
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr === '') return '-';
  return formatDateStr(dateStr);
}

/**
 * 计算成为积极分子至今的天数
 * @param {Object} member 成员数据
 * @returns {Number} 天数
 */
export function getDaysSinceActivist(member) {
  const activistTime = member['党支部接收入党积极分子时间'];
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