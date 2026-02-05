// src/services/dataTransformer.js
/**
 * 数据转换服务 - 处理数据转换和业务逻辑
 */

// ============ 日期格式化函数 ============

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

// ============ 入党流程阶段计算 ============

/**
 * 计算入党流程阶段（根据实际字段逻辑）
 */
export function calculateProcessStage(member) {
  if (!member) return '未开始';
  
  // 逻辑判断顺序（从高级别到低级别）
  if (member.转正时间 && member.转正时间 !== '') {
    return '中共党员';
  }
  
  if (member.支部大会 && member.支部大会 !== '') {
    return '中共预备党员';
  }
  
  if (member.确定为发展对象日期 && member.确定为发展对象日期 !== '') {
    return '确定为发展对象';
  }
  
  if (member.积极分子时间 && member.积极分子时间 !== '') {
    return '入党积极分子';
  }
  
  if (member.递交入党申请书 && member.递交入党申请书 !== '') {
    return '入党申请人';
  }
  
  return '未开始';
}

/**
 * 获取流程阶段显示文本（增强版）
 */
export function getProcessStageText(member) {
  if (!member) return '未开始';
  
  // 如果成员是党员，直接返回政治面貌
  if (member.政治面貌 === '中共党员' || member.政治面貌 === '中共预备党员') {
    return member.政治面貌;
  }
  
  // 否则计算入党流程阶段
  return calculateProcessStage(member);
}

/**
 * 获取流程阶段编号（用于排序）
 */
export function getProcessStageNumber(member) {
  const stage = getProcessStageText(member);
  const stageMap = {
    '未开始': 0,
    '入党申请人': 1,
    '入党积极分子': 2,
    '确定为发展对象': 3,
    '中共预备党员': 4,
    '中共党员': 5
  };
  return stageMap[stage] || 0;
}

/**
 * 获取流程阶段样式类（更新）
 */
export function getProcessStageClass(member) {
  const stage = getProcessStageText(member);
  const classes = {
    '中共党员': 'stage-party',
    '中共预备党员': 'stage-candidate',
    '确定为发展对象': 'stage-develop',
    '入党积极分子': 'stage-activist',
    '入党申请人': 'stage-applicant',
    '未开始': 'stage-none'
  };
  return classes[stage] || 'stage-none';
}

// ============ 政治面貌样式类 ============

// 获取政治面貌样式类
export function getPoliticalStatusClass(status) {
  const classes = {
    '中共党员': 'status-party',
    '中共预备党员': 'status-candidate',
    '共青团员': 'status-youth',
    '群众': 'status-masses'
  };
  return classes[status] || 'status-masses';
}

// ============ 积极分子资格检查相关函数 ============

// 判断是否应该显示600题"通过"
export function shouldShow600Pass(member) {
  const advancedStages = ['入党积极分子', '确定为发展对象', '中共预备党员', '中共党员'];
  const currentStage = getProcessStageText(member);
  
  // 如果当前阶段是积极分子及以上，显示"通过"
  return advancedStages.includes(currentStage);
}

// 处理600题成绩 - 积极分子及之后阶段默认通过
export function handle600Score(score, member) {
  const advancedStages = ['入党积极分子', '确定为发展对象', '中共预备党员', '中共党员'];
  const currentStage = getProcessStageText(member);
  
  // 如果是积极分子及之后的阶段，且成绩为0或空，则默认"通过"
  if (advancedStages.includes(currentStage) && (!score || score === 'nan' || score === 'NaN' || score === 'null' || parseFloat(score) === 0)) {
    return '通过';
  }
  
  // 否则正常处理
  return handleNaN(score, false);
}

// 处理百分比
export function handlePercentage(percentage) {
  if (!percentage || percentage === 'nan' || percentage === 'NaN' || percentage === 'null') {
    return '';
  }
  
  // 确保有%符号
  const value = percentage.toString();
  return value.includes('%') ? value : value + '%';
}

// ============ 积极分子资格检查 ============

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

// 积极分子资格检查相关的函数
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
    积极分子培训结业: getProcessStageText(member) === '确定为发展对象',
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
  
  // 检查是否是确定为发展对象
  if (!result.积极分子培训结业) {
    return {
      ...result,
      总体符合: false,
      失败原因: '不是确定为发展对象阶段'
    };
  }
  
  // 检查满一年条件
  if (settings.checkFullYear) {
    const activistTime = member.积极分子时间 || member['党支部接收入党积极分子时间'];
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
        失败原因: '积极分子时间未满一年'
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

// 批量查询符合条件的积极分子
export function queryQualifiedActivists(members, options = {}, currentDate = new Date()) {
  const allResults = [];
  const qualified = [];
  const disqualified = [];
  
  // 首先过滤出确定为发展对象的成员
  const activists = members.filter(member => 
    getProcessStageText(member) === '确定为发展对象'
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

// 一键查询符合条件的积极分子
export function oneClickActivistQuery(members, options = {}) {
  const currentDate = new Date();
  return queryQualifiedActivists(members, options, currentDate);
}

// 辅助函数
function getFailureReasons(qualification, options) {
  const reasons = [];
  
  if (!qualification.积极分子培训结业) {
    reasons.push('不是确定为发展对象阶段');
  }
  
  if (options.checkFullYear && !qualification.满一年) {
    reasons.push('积极分子时间未满一年');
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

// 辅助函数：处理NaN值
function handleNaN(value, asNumber = false) {
  if (!value || value === 'nan' || value === 'NaN' || value === 'null') {
    return asNumber ? 0 : '';
  }
  
  if (asNumber) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  
  return value.toString();
}