// backend/test-field-names.js
const sql = require('mssql');

const config = {
  user: 'dangjian_api',
  password: 'Dangjian@2024',
  server: 'Echo',
  database: 'DangJianDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function testFieldNames() {
  console.log('🔍 检查字段名映射...\n');
  
  try {
    const pool = await sql.connect(config);
    
    // 1. 检查成员_名单表的字段
    console.log('📋 成员_名单表字段:');
    const memberFields = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '成员_名单'
      ORDER BY ORDINAL_POSITION
    `);
    
    memberFields.recordset.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.COLUMN_NAME} (${field.DATA_TYPE})`);
    });
    
    // 2. 检查关键字段是否存在
    const keyFields = ['入团时间', '申请入党时间', '600题考试时间', '党支部接收入党积极分子时间', '入党流程阶段'];
    console.log('\n🔑 检查关键字段是否存在:');
    
    const existingFields = memberFields.recordset.map(f => f.COLUMN_NAME);
    keyFields.forEach(field => {
      const exists = existingFields.includes(field);
      console.log(`  ${field}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
      
      if (!exists) {
        // 尝试找相似的字段
        const similar = existingFields.filter(f => f.includes(field.replace(/时间|阶段/, '')));
        if (similar.length > 0) {
          console.log(`    可能对应: ${similar.join(', ')}`);
        }
      }
    });
    
    // 3. 查看前2条数据示例
    console.log('\n📊 数据示例（前2条）:');
    const sampleData = await pool.request().query(`
      SELECT TOP 2 * FROM 成员_名单
    `);
    
    sampleData.recordset.forEach((row, rowIndex) => {
      console.log(`\n  记录 ${rowIndex + 1}:`);
      // 只显示关键字段
      const displayFields = ['学号', '姓名', '班级', '政治面貌', '入党流程阶段'];
      displayFields.forEach(field => {
        if (row[field] !== undefined) {
          console.log(`    ${field}: ${row[field]}`);
        }
      });
    });
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

testFieldNames();