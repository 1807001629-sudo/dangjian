// 解析数据为前端可用格式
export function parseExcelData(rawData) {
  // rawData 已经是对象数组，不需要额外的解析
  const members = rawData.map((member, index) => {
    // 确保所有字段都有值
    const processedMember = {
      id: index + 1,
      姓名: member.姓名 || '',
      学号: member.学号 || '',
      班级: member.班级 || '',
      政治面貌: member.政治面貌 || '群众',
      入党流程阶段: member.入党流程阶段 || '',
      活动时数: parseFloat(member.活动时数) || 0,
      修正党时: parseFloat(member.修正党时) || 0,
      '600题考试成绩': parseFloat(member['600题考试成绩']) || 0,
      入团时间: member.入团时间 || '',
      出生年月日: member.出生年月日 || '',
      申请入党时间: member.申请入党时间 || '',
      备注: member.备注 || '',
      
      // 计算额外字段
      isActive: parseFloat(member.活动时数) > 0,
      processStage: getProcessStage(member.入党流程阶段),
      activityScore: parseFloat(member.活动时数) || 0,
      testScore: parseFloat(member['600题考试成绩']) || 0,
      totalScore: (parseFloat(member.活动时数) || 0) + (parseFloat(member['600题考试成绩']) || 0)
    };
    
    return processedMember;
  });
  
  return {
    members,
    stats: generateStats(members)
  };
}

// 获取流程阶段编号（简化版）
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

// 其他函数保持不变...