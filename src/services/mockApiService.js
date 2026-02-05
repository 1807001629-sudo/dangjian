// src/services/mockApiService.js
/**
 * 模拟API服务 - 用于开发阶段，模拟后端API
 */
import apiService from './apiService';

// 模拟数据（从原来的data.json结构转换而来）
let mockData = {
  partyMembers: [],
  activists: [],
  applicants: [],
  members: [],
  leagueMembers: [],
  statistics: null
};

// 尝试加载本地数据作为模拟数据
async function loadMockData() {
  try {
    // 注意：这需要你有原来的data.json文件
    // const response = await fetch('/src/assets/data.json');
    // const allData = await response.json();
    
    // 临时使用空数据，实际使用时请取消注释上面的代码
    const allData = [];
    
    // 处理数据格式（从旧格式转换）
    mockData.members = allData.map((item, index) => ({
      id: item.id || index + 1,
      ...item,
      // 确保数字字段正确处理
      活动时数: parseFloat(item.活动时数) || 0,
      修正党时: parseFloat(item.修正党时) || 0,
      四级成绩: parseFloat(item.四级成绩) || 0,
      计算机二级: parseFloat(item.计算机二级) || 0
    }));
    
    // 分类数据
    mockData.partyMembers = mockData.members.filter(m => 
      m.政治面貌 === '中共党员' || m.政治面貌 === '中共预备党员'
    );
    
    mockData.activists = mockData.members.filter(m => 
      m.入党流程阶段?.includes('积极分子')
    );
    
    mockData.applicants = mockData.members.filter(m => 
      m.入党流程阶段 === '入党申请人'
    );
    
    mockData.leagueMembers = mockData.members.filter(m => 
      m.政治面貌 === '共青团员'
    );
    
    console.log('模拟数据加载完成:', {
      total: mockData.members.length,
      partyMembers: mockData.partyMembers.length,
      activists: mockData.activists.length,
      applicants: mockData.applicants.length,
      leagueMembers: mockData.leagueMembers.length
    });
    
  } catch (error) {
    console.error('加载模拟数据失败:', error);
  }
}

// 配置：是否使用模拟数据
const useMock = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

// 模拟API延迟
const simulateDelay = (ms = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// 生成模拟统计信息
function generateMockStatistics() {
  const stats = {
    total: mockData.members.length,
    partyMembers: mockData.partyMembers.length,
    activists: mockData.activists.length,
    applicants: mockData.applicants.length,
    leagueMembers: mockData.leagueMembers.length,
    byPoliticalStatus: {},
    byProcessStage: {},
    activityHours: {
      total: 0,
      average: 0
    }
  };
  
  // 政治面貌统计
  mockData.members.forEach(member => {
    const status = member.政治面貌 || '群众';
    stats.byPoliticalStatus[status] = (stats.byPoliticalStatus[status] || 0) + 1;
  });
  
  // 入党阶段统计
  mockData.members.forEach(member => {
    const stage = member.入党流程阶段 || '未开始';
    stats.byProcessStage[stage] = (stats.byProcessStage[stage] || 0) + 1;
  });
  
  // 活动时数统计
  const totalHours = mockData.members.reduce((sum, member) => 
    sum + (parseFloat(member.活动时数) || 0), 0
  );
  stats.activityHours.total = totalHours;
  stats.activityHours.average = mockData.members.length > 0 ? 
    (totalHours / mockData.members.length).toFixed(1) : 0;
  
  return stats;
}

// 增强的API服务
const enhancedApiService = {
  // ============ 党员数据 ============
  async getPartyMembers(params = {}) {
    if (!useMock) return apiService.getPartyMembers(params);
    
    await simulateDelay();
    
    let data = [...mockData.partyMembers];
    
    // 应用筛选条件
    if (params.search) {
      const search = params.search.toLowerCase();
      data = data.filter(member => 
        (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
        (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
        (member.班级 && member.班级.toLowerCase().includes(search))
      );
    }
    
    return { data };
  },
  
  // ============ 积极分子数据 ============
  async getActivists(params = {}) {
    if (!useMock) return apiService.getActivists(params);
    
    await simulateDelay();
    
    let data = [...mockData.activists];
    
    // 应用筛选条件
    if (params.search) {
      const search = params.search.toLowerCase();
      data = data.filter(member => 
        (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
        (member.学号 && member.学号.toString().toLowerCase().includes(search))
      );
    }
    
    return { data };
  },
  
  // ============ 统计信息 ============
  async getStatistics() {
    if (!useMock) return apiService.getStatistics();
    
    await simulateDelay(500);
    
    return { data: generateMockStatistics() };
  },
  
  // ============ 成员数据 ============
  async getMembers(params = {}) {
    if (!useMock) return apiService.getMembers(params);
    
    await simulateDelay();
    
    let data = [...mockData.members];
    
    // 应用筛选条件
    if (params.search) {
      const search = params.search.toLowerCase();
      data = data.filter(member => 
        (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
        (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
        (member.班级 && member.班级.toLowerCase().includes(search))
      );
    }
    
    if (params.politicalStatus) {
      data = data.filter(member => member.政治面貌 === params.politicalStatus);
    }
    
    if (params.stage) {
      data = data.filter(member => member.入党流程阶段 === params.stage);
    }
    
    return { data };
  },
  
  // ============ 积极分子资格查询 ============
  async queryQualifiedActivists(options = {}) {
    if (!useMock) return apiService.queryQualifiedActivists(options);
    
    await simulateDelay(1000);
    
    // 这里可以调用你原来的查询逻辑
    // 需要从dataTransformer导入查询函数
    try {
      const { queryQualifiedActivists } = await import('./dataTransformer.js');
      const result = queryQualifiedActivists(mockData.members, options);
      return { data: result };
    } catch (error) {
      console.error('模拟积极分子查询失败:', error);
      return { data: { 符合条件成员: [], 统计信息: {} } };
    }
  },
  
  // ============ 更新修正党时 ============
  async updateCorrection(id, correction, reason = '') {
    if (!useMock) return apiService.updateCorrection(id, correction, reason);
    
    await simulateDelay();
    
    // 模拟更新
    const member = mockData.members.find(m => m.id === id || m.学号 === id);
    if (member) {
      member.修正党时 = correction;
      console.log('模拟更新修正党时:', { id, correction, reason });
      return { data: { success: true, member } };
    }
    
    return { data: { success: false, error: '成员不存在' } };
  }
};

// 初始化模拟数据
if (useMock) {
  loadMockData();
}

export default enhancedApiService;