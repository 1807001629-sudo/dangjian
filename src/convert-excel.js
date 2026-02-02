const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function convertExcelToJson() {
  // 配置路径
  const excelPath = 'C:/Users/18070/Desktop/打工日记/整合/信息总表.xlsx';
  const jsonOutputPath = path.join(__dirname, '../src/assets/data.json');
  
  console.log('🚀 开始Excel到JSON转换...');
  console.log(`输入文件: ${excelPath}`);
  console.log(`输出文件: ${jsonOutputPath}`);
  
  try {
    // 1. 读取Excel文件
    console.log('📖 正在读取Excel文件...');
    const workbook = XLSX.readFile(excelPath);
    
    // 2. 查找正确的工作表（支持多种工作表名称）
    let sheetName = workbook.SheetNames.find(name => 
      name.includes('信息汇总') || 
      name.includes('❤️') ||
      name.toLowerCase().includes('sheet')
    ) || workbook.SheetNames[0]; // 如果没有找到，使用第一个工作表
    
    console.log(`📄 使用工作表: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    
    // 3. 转换为JSON
    console.log('🔄 正在转换为JSON...');
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // 获取格式化后的值
      defval: ''  // 空单元格的默认值
    });
    
    console.log(`📊 共读取到 ${data.length} 条记录`);
    
    // 4. 处理数据（修复日期和数字格式）
    console.log('⚙️ 正在处理数据格式...');
    const processedData = data.map((record, index) => {
      const newRecord = {};
      
      Object.keys(record).forEach(key => {
        let value = record[key];
        
        // 处理空值
        if (value === null || value === undefined || value === '') {
          newRecord[key] = '';
          return;
        }
        
        // 如果是字符串，处理.0后缀
        if (typeof value === 'string') {
          // 去除空格
          value = value.trim();
          
          // 处理.0后缀
          if (value.endsWith('.0')) {
            value = value.replace(/\.0$/, '');
          }
          
          // 尝试解析数字
          if (!isNaN(value) && value !== '') {
            // 如果是整数，保留为数字
            if (value.includes('.')) {
              const num = parseFloat(value);
              newRecord[key] = isNaN(num) ? value : num;
            } else {
              const num = parseInt(value);
              newRecord[key] = isNaN(num) ? value : num;
            }
          } else {
            newRecord[key] = value;
          }
        } else if (typeof value === 'number') {
          // 如果是数字，检查是否为整数
          if (Number.isInteger(value)) {
            newRecord[key] = value;
          } else {
            newRecord[key] = value;
          }
        } else {
          newRecord[key] = value;
        }
      });
      
      // 添加ID字段
      newRecord.id = index + 1;
      
      return newRecord;
    });
    
    // 5. 保存JSON文件
    console.log('💾 正在保存JSON文件...');
    const jsonString = JSON.stringify(processedData, null, 2);
    fs.writeFileSync(jsonOutputPath, jsonString, 'utf8');
    
    console.log(`✅ 转换完成！保存了 ${processedData.length} 条记录到 data.json`);
    console.log(`📁 文件位置: ${jsonOutputPath}`);
    
    return {
      success: true,
      count: processedData.length,
      filePath: jsonOutputPath
    };
    
  } catch (error) {
    console.error('❌ 转换过程中发生错误:');
    console.error(error.message);
    console.error('错误堆栈:', error.stack);
    
    // 创建空的数据文件，防止程序崩溃
    try {
      fs.writeFileSync(jsonOutputPath, '[]', 'utf8');
      console.log('⚠️ 已创建空的data.json文件，防止程序崩溃');
    } catch (fileError) {
      console.error('无法创建空的JSON文件:', fileError.message);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  convertExcelToJson();
}

module.exports = { convertExcelToJson };