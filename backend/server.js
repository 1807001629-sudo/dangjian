// backend/server.js - 完整版
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sql = require('mssql');
require('dotenv').config();

const app = express();

// 中间件
app.use(helmet()); // 安全头部
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json()); // 解析JSON请求体

// 数据库配置
const config = {
  user: process.env.DB_USER || 'dangjian_api',
  password: process.env.DB_PASSWORD || 'Dangjian@2024',
  server: process.env.DB_SERVER || 'Echo',
  database: process.env.DB_NAME || 'DangJianDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    trustedConnection: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// 全局数据库连接池
let pool;

// 连接数据库
async function connectToDatabase() {
  try {
    console.log('🔍 正在连接数据库...');
    console.log('配置:', {
      服务器: config.server,
      数据库: config.database,
      用户: config.user
    });
    
    // 创建连接池
    pool = new sql.ConnectionPool(config);
    
    // 设置连接超时
    const connectPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('连接超时（10秒）')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('✅ 数据库连接成功！');
    
    // 立即测试一个简单查询
    const testResult = await pool.request().query('SELECT 1 as test_value');
    console.log('🧪 连接测试查询结果:', testResult.recordset[0].test_value);
    
    // 获取表信息
    const tableQuery = `
      SELECT 
        TABLE_NAME as 表名,
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = t.TABLE_NAME) as 字段数
      FROM INFORMATION_SCHEMA.TABLES t
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    
    const tables = await pool.request().query(tableQuery);
    console.log('\n📊 数据库中的表:');
    tables.recordset.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.表名} (${table.字段数}个字段)`);
    });
    
    return pool;
    
  } catch (err) {
    console.error('\n❌ 数据库连接失败！');
    console.error('错误信息:', err.message);
    console.error('错误代码:', err.code);
    
    console.log('\n🔧 调试建议:');
    console.log('1. 检查用户名密码是否正确');
    console.log('2. 检查SQL Server是否允许远程连接');
    console.log('3. 检查防火墙设置');
    
    process.exit(1);
  }
}

// ============ 数据库查询工具函数 ============

/**
 * 执行SQL查询
 */
async function executeQuery(query, params = {}) {
  if (!pool) {
    throw new Error('数据库未连接');
  }
  
  try {
    const request = pool.request();
    
    // 添加参数
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return {
      success: true,
      data: result.recordset,
      rowsAffected: result.rowsAffected
    };
  } catch (error) {
    console.error('数据库查询错误:', {
      查询: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      参数: params,
      错误: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ 数据访问函数 ============

/**
 * 获取党员基本信息（来自 党员_基本信息 表）
 */
async function getPartyMembers(filters = {}) {
  let query = 'SELECT * FROM 党员_基本信息 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search OR 班级 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  if (filters.政治面貌) {
    query += ' AND 政治面貌 = @politicalStatus';
    params.politicalStatus = filters.政治面貌;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取积极分子信息（来自 党员发展_积极分子 表）
 */
async function getActivists(filters = {}) {
  let query = 'SELECT * FROM 党员发展_积极分子 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取申请人信息（来自 党员发展_申请人 表）
 */
async function getApplicants(filters = {}) {
  let query = 'SELECT * FROM 党员发展_申请人 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取所有成员信息（来自 成员_名单 表）
 */
async function getMembers(filters = {}) {
  try {
    let query = 'SELECT * FROM 成员_名单 WHERE 1=1';
    const params = {};
    
    if (filters.search) {
      query += ' AND (姓名 LIKE @search OR 学号 LIKE @search OR 班级 LIKE @search)';
      params.search = `%${filters.search}%`;
    }
    
    if (filters.政治面貌) {
      query += ' AND 政治面貌 = @politicalStatus';
      params.politicalStatus = filters.政治面貌;
    }
    
    if (filters.stage) {
      query += ' AND 入党流程阶段 = @stage';
      params.stage = filters.stage;
    }
    
    // 时间范围筛选（如果有时间字段）
    if (filters.timeRange && filters.timeRange !== 'all') {
      // 注意：需要根据实际表结构调整时间字段名
      const currentDate = new Date();
      let dateFilter = '';
      
      switch (filters.timeRange) {
        case 'year':
          dateFilter = `AND YEAR(创建时间) = YEAR(GETDATE())`;
          break;
        case 'month':
          dateFilter = `AND YEAR(创建时间) = YEAR(GETDATE()) AND MONTH(创建时间) = MONTH(GETDATE())`;
          break;
        case 'week':
          dateFilter = `AND 创建时间 >= DATEADD(WEEK, -1, GETDATE())`;
          break;
      }
      
      if (dateFilter) query += ' ' + dateFilter;
    }
    
    // 限制返回数量，避免数据过大
    query += ' ORDER BY 学号 OFFSET 0 ROWS FETCH NEXT 1000 ROWS ONLY';
    
    return executeQuery(query, params);
  } catch (error) {
    console.error('获取成员信息错误:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取团员信息（来自 成员_团员 表）
 */
async function getLeagueMembers(filters = {}) {
  let query = 'SELECT * FROM 成员_团员 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取600题考试成绩（来自 考试成绩_600题 表）
 */
async function getExamScores(filters = {}) {
  let query = 'SELECT * FROM 考试成绩_600题 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取综测排名（来自 学业_综测排名 表）
 */
async function getAcademicRecords(filters = {}) {
  let query = 'SELECT * FROM 学业_综测排名 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取英语四级证书（来自 证书_英语四级 表）
 */
async function getEnglishCertificates(filters = {}) {
  let query = 'SELECT * FROM 证书_英语四级 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取计算机二级证书（来自 证书_计算机二级 表）
 */
async function getComputerCertificates(filters = {}) {
  let query = 'SELECT * FROM 证书_计算机二级 WHERE 1=1';
  const params = {};
  
  if (filters.search) {
    query += ' AND (姓名 LIKE @search OR 学号 LIKE @search)';
    params.search = `%${filters.search}%`;
  }
  
  return executeQuery(query, params);
}

/**
 * 获取综合统计数据
 * 现在需要从多个表合并数据
 */
async function getStatistics() {
  try {
    console.log('📈 开始获取统计数据...');
    
    // 并行执行所有统计查询
    const queries = {
      // 从成员_名单表获取基础统计
      总人数: 'SELECT COUNT(*) as total FROM 成员_名单',
      
      政治面貌: `
        SELECT 
          ISNULL(政治面貌, '未填写') as 政治面貌,
          COUNT(*) as 人数
        FROM 成员_名单
        GROUP BY 政治面貌
        ORDER BY 人数 DESC
      `,
      
      入党阶段: `
        SELECT 
          ISNULL(入党流程阶段, '未填写') as 阶段,
          COUNT(*) as 人数
        FROM 成员_名单
        GROUP BY 入党流程阶段
        ORDER BY 人数 DESC
      `,
      
      班级分布: `
        SELECT 
          ISNULL(班级, '未填写') as 班级,
          COUNT(*) as 人数
        FROM 成员_名单
        GROUP BY 班级
        ORDER BY 人数 DESC
      `,
      
      // 从其他表获取补充信息
      党员人数: 'SELECT COUNT(*) as count FROM 党员_基本信息',
      
      积极分子人数: 'SELECT COUNT(*) as count FROM 党员发展_积极分子',
      
      团员人数: 'SELECT COUNT(*) as count FROM 成员_团员',
      
      申请人人数: 'SELECT COUNT(*) as count FROM 党员发展_申请人'
    };
    
    // 并行执行所有查询
    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      console.log(`  执行查询: ${key}`);
      const result = await executeQuery(query);
      results[key] = result;
    }
    
    // 构建返回数据
    const stats = {
      total: results.总人数.success ? results.总人数.data[0].total : 0,
      byPoliticalStatus: {},
      byProcessStage: {},
      byClass: {},
      counts: {
        党员: results.党员人数.success ? results.党员人数.data[0].count : 0,
        积极分子: results.积极分子人数.success ? results.积极分子人数.data[0].count : 0,
        团员: results.团员人数.success ? results.团员人数.data[0].count : 0,
        申请人: results.申请人人数.success ? results.申请人人数.data[0].count : 0
      }
    };
    
    // 处理政治面貌数据
    if (results.政治面貌.success) {
      results.政治面貌.data.forEach(item => {
        stats.byPoliticalStatus[item.政治面貌] = item.人数;
      });
    }
    
    // 处理入党阶段数据
    if (results.入党阶段.success) {
      results.入党阶段.data.forEach(item => {
        stats.byProcessStage[item.阶段] = item.人数;
      });
    }
    
    // 处理班级分布数据
    if (results.班级分布.success) {
      results.班级分布.data.forEach(item => {
        stats.byClass[item.班级] = item.人数;
      });
    }
    
    console.log('✅ 统计数据获取完成');
    console.log('统计摘要:', {
      总人数: stats.total,
      党员人数: stats.counts.党员,
      积极分子: stats.counts.积极分子,
      团员人数: stats.counts.团员,
      申请人: stats.counts.申请人
    });
    
    return { success: true, data: stats };
    
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return { success: false, error: error.message };
  }
}

// ============ API路由定义 ============

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '党建管理系统API运行正常',
    timestamp: new Date().toISOString(),
    database: pool ? '已连接' : '未连接'
  });
});

// 数据库连接状态
app.get('/api/db-status', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ 
        connected: false, 
        message: '数据库未连接'
      });
    }
    
    // 测试查询
    const testResult = await pool.request().query('SELECT 1 as test');
    
    res.json({
      connected: true,
      message: '数据库连接正常',
      testQuery: testResult.recordset[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      connected: false,
      message: '数据库连接异常',
      error: error.message
    });
  }
});

// 获取表结构
app.get('/api/tables', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME LIKE '%党%' OR TABLE_NAME LIKE '%成员%' OR TABLE_NAME LIKE '%成绩%' OR TABLE_NAME LIKE '%证书%'
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    
    if (result.success) {
      res.json({ data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取综合统计数据
app.get('/api/statistics', async (req, res) => {
  try {
    console.log('📊 收到统计请求');
    
    if (!pool) {
      return res.status(500).json({ 
        error: '数据库未连接'
      });
    }
    
    const result = await getStatistics();
    
    if (result.success) {
      res.json({ data: result.data });
    } else {
      res.status(500).json({ 
        error: result.error,
        message: '获取统计数据失败'
      });
    }
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取党员信息
app.get('/api/party-members', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getPartyMembers(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取积极分子信息
app.get('/api/activists', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getActivists(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取申请人信息
app.get('/api/applicants', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getApplicants(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有成员信息
app.get('/api/members', async (req, res) => {
  try {
    const filters = req.query;
    console.log('获取成员请求，参数:', filters);
    
    const result = await getMembers(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取团员信息
app.get('/api/league-members', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getLeagueMembers(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取600题考试成绩
app.get('/api/exam-scores', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getExamScores(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取英语四级证书
app.get('/api/certificates/english', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getEnglishCertificates(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取计算机二级证书
app.get('/api/certificates/computer', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getComputerCertificates(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取综测排名
app.get('/api/academic-records', async (req, res) => {
  try {
    const filters = req.query;
    const result = await getAcademicRecords(filters);
    
    if (result.success) {
      res.json({ 
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取成员详情
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM 成员_名单 
      WHERE 学号 = @id OR 身份证号 = @id
    `;
    
    const result = await executeQuery(query, { id });
    
    if (result.success && result.data.length > 0) {
      res.json({ data: result.data[0] });
    } else {
      res.status(404).json({ error: '成员不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新修正党时
app.put('/api/members/:id/correction', async (req, res) => {
  try {
    const { id } = req.params;
    const { correction, reason } = req.body;
    
    // 注意：需要确认表中是否有修正党时字段
    const query = `
      UPDATE 成员_名单 
      SET 修正党时 = @correction,
          修正原因 = @reason,
          更新时间 = GETDATE()
      WHERE 学号 = @id
    `;
    
    const result = await executeQuery(query, { 
      id, 
      correction: parseFloat(correction) || 0,
      reason: reason || ''
    });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: '修正党时更新成功',
        data: { correction, reason }
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 积极分子资格查询
app.post('/api/query/activists', async (req, res) => {
  try {
    const options = req.body;
    
    // 1. 获取所有积极分子培训结业的成员
    // 注意：需要确认字段名，这里假设是"入党流程阶段"
    const query = `
      SELECT * FROM 成员_名单 
      WHERE 入党流程阶段 = '积极分子培训结业'
    `;
    
    const result = await executeQuery(query);
    
    if (!result.success) {
      return res.status(500).json({ error: '查询积极分子失败' });
    }
    
    // 这里可以添加业务逻辑判断
    // 目前先返回所有积极分子
    res.json({ 
      data: {
        符合条件成员: result.data.slice(0, Math.min(result.data.length, 50)), // 限制数量
        不符合条件成员: [],
        所有结果: result.data,
        查询选项: options,
        统计信息: {
          积极分子总数: result.data.length,
          符合条件人数: Math.min(result.data.length, 50),
          不符合条件人数: 0,
          符合条件比例: '100%'
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: '积极分子查询失败' });
  }
});

// 测试查询
app.get('/api/test-query', async (req, res) => {
  try {
    // 测试各表连接
    const queries = [
      'SELECT TOP 3 * FROM 成员_名单',
      'SELECT TOP 3 * FROM 党员_基本信息',
      'SELECT TOP 3 * FROM 党员发展_积极分子',
      'SELECT COUNT(*) as total_count FROM 成员_名单'
    ];
    
    const results = {};
    for (let i = 0; i < queries.length; i++) {
      const result = await executeQuery(queries[i]);
      results[`query${i + 1}`] = {
        query: queries[i],
        success: result.success,
        data: result.success ? result.data : result.error
      };
    }
    
    res.json({ 
      message: '测试查询结果',
      database: pool ? '已连接' : '未连接',
      results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'API端点不存在',
    path: req.path,
    method: req.method 
  });
});

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 启动党建管理系统后端API...');
    console.log('📅', new Date().toLocaleString());
    console.log('========================================');
    
    // 连接数据库
    await connectToDatabase();
    
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log('\n✅ 服务器启动成功！');
      console.log('========================================');
      console.log(`📡 API地址: http://localhost:${PORT}`);
      console.log(`🌐 前端地址: http://localhost:3000`);
      console.log(`💡 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🔍 数据库状态: http://localhost:${PORT}/api/db-status`);
      console.log(`📊 统计接口: http://localhost:${PORT}/api/statistics`);
      console.log(`👥 成员接口: http://localhost:${PORT}/api/members`);
      console.log(`🎓 党员接口: http://localhost:${PORT}/api/party-members`);
      console.log(`🔥 积极分子: http://localhost:${PORT}/api/activists`);
      console.log('========================================');
    });
    
    // 优雅关闭
    process.on('SIGTERM', async () => {
      console.log('正在关闭服务器...');
      if (pool) {
        try {
          await pool.close();
          console.log('数据库连接已关闭');
        } catch (err) {
          console.error('关闭数据库连接失败:', err);
        }
      }
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 启动服务器
startServer();