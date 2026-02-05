// backend/server.js - 简化稳定版
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// 数据库配置
const config = {
  user: 'dangjian_api',
  password: 'Dangjian@2024',
  server: 'Echo',
  database: 'DangJianDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// 全局连接池
let pool;

// 连接数据库
async function connectToDatabase() {
  try {
    console.log('🔌 连接数据库...');
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    const result = await pool.request().query('SELECT 1 as test');
    console.log('🧪 测试查询:', result.recordset[0].test);
    
    return pool;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

// 执行查询的辅助函数
async function executeQuery(query, params = {}) {
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
    console.error('查询错误:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ 核心API接口 ============

// 1. 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '党建管理系统API运行正常',
    timestamp: new Date().toISOString(),
    database: pool ? '已连接' : '未连接'
  });
});

// 2. 数据库状态
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await executeQuery('SELECT 1 as test');
    res.json({
      connected: true,
      message: '数据库连接正常',
      testResult: result.data[0].test
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// 3. 获取数据库所有表
app.get('/api/tables', async (req, res) => {
  try {
    const query = `
      SELECT 
        TABLE_NAME as 表名,
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = t.TABLE_NAME) as 字段数
      FROM INFORMATION_SCHEMA.TABLES t
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      res.json({ 
        success: true,
        tables: result.data 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 4. 获取表结构
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    const query = `
      SELECT 
        COLUMN_NAME as 字段名,
        DATA_TYPE as 数据类型,
        IS_NULLABLE as 可为空,
        COLUMN_DEFAULT as 默认值
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION
    `;
    
    const result = await executeQuery(query, { tableName });
    
    if (result.success) {
      res.json({ 
        success: true,
        tableName: tableName,
        columns: result.data 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 5. 获取成员数据（最简版本）
app.get('/api/members', async (req, res) => {
  try {
    console.log('📋 获取成员数据请求');
    
    // 先只获取成员_名单表的基础数据
    const query = `
      SELECT TOP 20 
        id,
        姓名,
        学号,
        班级,
        年级,
        性别,
        学籍状态,
        import_time as 更新时间
      FROM 成员_名单
      ORDER BY 学号
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      console.log(`✅ 返回 ${result.data.length} 条成员数据`);
      res.json({ 
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    console.error('获取成员数据错误:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 6. 获取党员数据
app.get('/api/party-members', async (req, res) => {
  try {
    const query = `
      SELECT TOP 20 
        id,
        姓名,
        递交入党申请书,
        积极分子时间,
        确定为发展对象日期,
        支部大会,
        转正时间
      FROM 党员_基本信息
      ORDER BY id
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      res.json({ 
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 7. 获取积极分子数据
app.get('/api/activists', async (req, res) => {
  try {
    const query = `
      SELECT TOP 20 
        序号,
        姓名,
        所在支部,
        性别,
        出生年月日,
        民族,
        是否宗教信仰
      FROM 党员发展_积极分子
      ORDER BY 序号
    `;
    
    const result = await executeQuery(query);
    
    if (result.success) {
      res.json({ 
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 8. 测试查询接口（用于调试）
app.get('/api/test-query', async (req, res) => {
  try {
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
      success: true,
      message: '测试查询结果',
      database: pool ? '已连接' : '未连接',
      results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 9. 根路由
app.get('/', (req, res) => {
  res.json({
    name: '党建管理系统API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/db-status',
      'GET /api/tables',
      'GET /api/tables/:tableName',
      'GET /api/members',
      'GET /api/party-members',
      'GET /api/activists',
      'GET /api/test-query'
    ],
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API端点不存在',
    path: req.path,
    availableEndpoints: [
      '/', '/api/health', '/api/db-status', '/api/tables', 
      '/api/members', '/api/party-members', '/api/activists'
    ]
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
    app.listen(PORT, () => {
      console.log('\n✅ 服务器启动成功！');
      console.log('========================================');
      console.log(`📡 API地址: http://localhost:${PORT}`);
      console.log(`🌐 前端地址: http://localhost:3000`);
      console.log('========================================');
      console.log('可用接口:');
      console.log(`  GET /              - API信息`);
      console.log(`  GET /api/health    - 健康检查`);
      console.log(`  GET /api/db-status - 数据库状态`);
      console.log(`  GET /api/tables    - 所有表信息`);
      console.log(`  GET /api/members   - 成员数据`);
      console.log(`  GET /api/party-members - 党员数据`);
      console.log(`  GET /api/activists - 积极分子数据`);
      console.log('========================================');
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动
startServer();