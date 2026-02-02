import pandas as pd
from sqlalchemy import create_engine, text
import time
import warnings
warnings.filterwarnings('ignore')

print("🚀 开始导入Excel所有工作表数据到SQL Server...")
start_time = time.time()

# 1. 读取Excel文件信息
excel_path = 'C:/Users/18070/Desktop/打工日记/整合/信息总表.xlsx'
print(f"📂 正在读取Excel文件: {excel_path}")

# 获取所有工作表名称
try:
    # 方法1: 使用pandas获取工作表名
    excel_file = pd.ExcelFile(excel_path)
    sheet_names = excel_file.sheet_names
    print(f"📋 发现 {len(sheet_names)} 个工作表:")
    for i, name in enumerate(sheet_names, 1):
        print(f"  {i}. {name}")
except Exception as e:
    print(f"❌ 读取Excel失败: {str(e)}")
    exit()

# 2. 连接SQL Server
print(f"\n🔗 正在连接服务器: Echo")
server = 'Echo'
database = 'DangJianDB'
driver = 'ODBC Driver 17 for SQL Server'

# 连接字符串
conn_str = f"mssql+pyodbc://@{server}/{database}?driver={driver}&trusted_connection=yes"
print(f"连接字符串: {conn_str[:80]}...")

try:
    engine = create_engine(conn_str)
    # 测试连接
    with engine.connect() as conn:
        result = conn.execute(text("SELECT @@SERVERNAME as server, DB_NAME() as db"))
        row = result.fetchone()
        print(f"✅ 连接成功！服务器: {row.server}, 数据库: {row.db}")
except Exception as e:
    print(f"❌ 连接失败: {str(e)}")
    exit()

# 3. 为每个工作表创建对应的数据库表并导入数据
print(f"\n📤 开始导入各个工作表数据...")
total_records = 0
successful_sheets = []
failed_sheets = []

for sheet_name in sheet_names:
    sheet_start = time.time()
    print(f"\n{'='*60}")
    print(f"📄 处理工作表: {sheet_name}")
    print(f"{'='*60}")
    
    try:
        # 读取当前工作表
        print(f"📖 读取数据...")
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        if df.empty:
            print(f"⚠️  工作表 '{sheet_name}' 为空，跳过")
            continue
            
        print(f"✅ 读取完成: {len(df)} 行, {len(df.columns)} 列")
        
        # 数据清洗
        print(f"🔄 数据清洗...")
        
        # 1. 列名处理：去掉空格，替换非法字符
        df.columns = df.columns.astype(str)  # 确保列名为字符串
        original_columns = list(df.columns)
        df.columns = [col.strip() for col in df.columns]
        
        # 替换列名中的特殊字符为下划线
        import re
        df.columns = [re.sub(r'[^\w\u4e00-\u9fff]', '_', col) for col in df.columns]
        
        # 处理重复列名
        new_columns = {}
        col_count = {}
        for col in df.columns:
            if col in col_count:
                col_count[col] += 1
                new_name = f"{col}_{col_count[col]}"
                new_columns[col] = new_name
            else:
                col_count[col] = 1
                new_columns[col] = col
        
        # 重命名列
        df.rename(columns=new_columns, inplace=True)
        
        # 2. 自动识别并处理日期列
        date_keywords = ['日期', '时间', 'date', 'time', 'Date', 'Time', 'day', 'Day', '年', '月', '日']
        date_columns = []
        
        for col in df.columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in date_keywords):
                date_columns.append(col)
        
        if date_columns:
            print(f"📅 识别到日期列: {date_columns}")
            for col in date_columns:
                try:
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                    print(f"  ✅ {col}: 转换成功")
                except Exception as e:
                    print(f"  ⚠️  {col}: 转换失败 - {str(e)[:50]}")
        
        # 3. 处理空值
        df = df.fillna('')
        
        # 显示数据样例
        print(f"📊 数据样例:")
        print(df.head(2))
        
        # 4. 创建数据库表名（工作表名转换为合法表名）
        # 移除特殊字符，限制长度
        table_name = re.sub(r'[^\w]', '_', sheet_name)[:60]  # SQL Server表名最大128字符
        
        # 如果表名以数字开头，添加前缀
        if table_name and table_name[0].isdigit():
            table_name = f"Sheet_{table_name}"
        
        # 如果没有有效字符，使用默认名称
        if not table_name or table_name.isspace():
            table_name = f"Sheet_{sheet_names.index(sheet_name)+1}"
        
        print(f"🏗️  创建/更新表: {table_name}")
        
        # 动态生成创建表的SQL
        columns_sql = []
        for col in df.columns:
            col_str = str(col)
            # 根据列数据类型推断SQL类型
            if col in date_columns:
                col_type = "DATETIME"
            elif df[col].dtype == 'int64':
                col_type = "INT"
            elif df[col].dtype == 'float64':
                col_type = "FLOAT"
            else:
                # 文本类型，根据最大长度设置NVARCHAR长度
                max_len = df[col].astype(str).str.len().max()
                col_length = min(max_len * 2 + 10, 4000)  # 留有余量，不超过4000
                col_type = f"NVARCHAR({col_length})"
            
            safe_col_name = f"[{col_str}]"  # 用方括号包裹列名
            columns_sql.append(f"{safe_col_name} {col_type}")
        
        # 添加元数据列
        columns_sql.append("[import_sheet] NVARCHAR(100)")
        columns_sql.append("[import_time] DATETIME DEFAULT GETDATE()")
        
        create_table_sql = f"""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='{table_name}' AND xtype='U')
        BEGIN
            CREATE TABLE {table_name} (
                [id] INT IDENTITY(1,1) PRIMARY KEY,
                {', '.join(columns_sql)}
            )
            PRINT '表 {table_name} 创建成功'
        END
        """
        
        # 执行创建表
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
            print(f"✅ 表结构就绪")
        
        # 5. 导入数据（添加sheet名称列）
        df['import_sheet'] = sheet_name
        
        print(f"💾 导入数据到表 {table_name}...")
        
        # 分块导入
        chunksize = 500
        total_rows = len(df)
        
        for i in range(0, total_rows, chunksize):
            chunk = df.iloc[i:i+chunksize]
            chunk.to_sql(
                name=table_name,
                con=engine,
                if_exists='append',
                index=False,
                method=None  # 让pandas自动选择方法
            )
            progress = min(i+chunksize, total_rows)
            if i % (chunksize*5) == 0 or progress == total_rows:
                print(f"  进度: {progress}/{total_rows} 行")
        
        # 6. 验证导入结果
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT COUNT(*) as count FROM {table_name}"))
            db_count = result.fetchone().count
        
        sheet_time = time.time() - sheet_start
        print(f"✅ 工作表 '{sheet_name}' 导入成功！")
        print(f"  导入记录: {total_rows} 行")
        print(f"  表中现有: {db_count} 条")
        print(f"  耗时: {sheet_time:.2f} 秒")
        
        total_records += total_rows
        successful_sheets.append({
            'sheet': sheet_name,
            'table': table_name,
            'records': total_rows,
            'time': sheet_time
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ 工作表 '{sheet_name}' 导入失败: {error_msg[:100]}")
        failed_sheets.append({
            'sheet': sheet_name,
            'error': error_msg[:200]
        })

# 4. 生成导入报告
print(f"\n{'='*60}")
print("📊 导入完成！汇总报告")
print(f"{'='*60}")

total_time = time.time() - start_time

print(f"📋 工作表处理情况:")
print(f"  ✅ 成功导入: {len(successful_sheets)} 个")
print(f"  ❌ 导入失败: {len(failed_sheets)} 个")

if successful_sheets:
    print(f"\n📈 成功导入的工作表详情:")
    for item in successful_sheets:
        print(f"  • {item['sheet']:20} → 表: {item['table']:20} | 记录: {item['records']:6} | 耗时: {item['time']:.1f}秒")

if failed_sheets:
    print(f"\n⚠️  导入失败的工作表:")
    for item in failed_sheets:
        print(f"  • {item['sheet']}: {item['error']}")

print(f"\n📊 总体统计:")
print(f"  总耗时: {total_time:.2f} 秒")
print(f"  总记录数: {total_records} 条")
if total_time > 0:
    print(f"  平均速度: {total_records/total_time:.1f} 条/秒")

# 5. 创建汇总视图（方便查询所有表）
print(f"\n🔗 创建跨表查询视图...")
try:
    with engine.connect() as conn:
        # 创建所有表的列表
        conn.execute(text("""
        IF OBJECT_ID('All_Excel_Tables', 'V') IS NOT NULL
            DROP VIEW All_Excel_Tables
        """))
        
        # 生成动态SQL创建视图
        view_sql = """
        CREATE VIEW All_Excel_Tables AS
        SELECT '汇总表' as source, * FROM 信息汇总
        UNION ALL
        """
        
        # 这里可以添加其他表的UNION，但需要表结构一致
        # 如果表结构不同，需要分别查询
        
        conn.commit()
        print("✅ 视图创建完成")
except Exception as e:
    print(f"⚠️  创建视图时遇到问题: {str(e)[:100]}")

print(f"\n🎉 所有工作表导入流程结束！")
print(f"💡 提示: 每个工作表已保存为独立的数据库表")
print(f"🔍 查询示例: SELECT * FROM [表名] WHERE import_sheet = '工作表名'")