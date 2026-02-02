import pandas as pd
from sqlalchemy import create_engine, text
import time

print("🔄 开始将英文表名转换为中文表名...")

# 连接数据库
服务器地址 = 'Echo'
数据库名称 = 'DangJianDB'
驱动程序 = 'ODBC Driver 17 for SQL Server'
连接字符串 = f"mssql+pyodbc://@{服务器地址}/{数据库名称}?driver={驱动程序}&trusted_connection=yes"

try:
    # 创建数据库连接引擎
    数据库引擎 = create_engine(连接字符串)
    
    with 数据库引擎.connect() as 数据库连接:
        # 1. 先查看当前所有表
        print("\n📋 第一步：检查当前数据库中的表")
        
        查看表SQL = """
        SELECT 
            t.name as 表名,
            SUM(p.rows) as 记录数
        FROM sys.tables t
        LEFT JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
        WHERE t.type = 'U'  -- 用户表
        GROUP BY t.name
        ORDER BY t.name
        """
        
        表结果 = 数据库连接.execute(text(查看表SQL))
        所有表 = 表结果.fetchall()
        
        print("当前数据库中的表:")
        for 表 in 所有表:
            print(f"  {表.表名:30} - {表.记录数 or 0:6} 条记录")
        
        # 2. 英文转中文的映射表
        print("\n🏷️  第二步：将英文表名转换为中文表名")
        
        英文转中文映射 = {
            # 英文表名: 中文表名
            'exam_600_questions': '考试成绩_600题',
            'academic_failed_courses': '学业记录_不及格',
            'party_members_info': '党员_基本信息',
            'party_activists': '党员发展_积极分子',
            'exam_activist_results': '成绩_积极分子结业',
            'cert_computer_level2': '证书_计算机二级',
            'members_list': '成员_名单',
            'academic_comprehensive_scores': '学业_综测排名',
            'party_applicants': '党员发展_申请人',
            'league_members': '成员_团员',
            'cert_cet4_scores': '证书_英语四级',
            'political_status': '成员_政治面貌',
            'PartyMembers': '信息汇总_总表'  # 额外的表
        }
        
        # 检查并重命名每个表
        成功重命名数 = 0
        
        for 英文表名, 中文表名 in 英文转中文映射.items():
            try:
                # 检查英文表是否存在
                检查SQL = f"SELECT COUNT(*) as 是否存在 FROM sys.tables WHERE name = '{英文表名}'"
                检查结果 = 数据库连接.execute(text(检查SQL))
                表是否存在 = 检查结果.fetchone().是否存在
                
                if 表是否存在:
                    # 检查中文表是否已存在
                    检查中文表SQL = f"SELECT COUNT(*) as 是否存在 FROM sys.tables WHERE name = '{中文表名}'"
                    检查结果2 = 数据库连接.execute(text(检查中文表SQL))
                    中文表是否存在 = 检查结果2.fetchone().是否存在
                    
                    if 中文表是否存在:
                        # 中文表已存在，询问是否覆盖（这里先跳过，不覆盖）
                        print(f"  ⚠️  中文表 '{中文表名}' 已存在，跳过重命名")
                        continue
                    
                    # 执行重命名
                    重命名SQL = f"EXEC sp_rename '{英文表名}', '{中文表名}'"
                    数据库连接.execute(text(重命名SQL))
                    print(f"  ✅ {英文表名:30} → {中文表名}")
                    成功重命名数 += 1
                else:
                    print(f"  ⚠️  英文表不存在: {英文表名}")
                    
            except Exception as 错误:
                错误信息 = str(错误)
                if '无法重命名' in 错误信息 or 'already exists' in 错误信息.lower():
                    print(f"  ⚠️  表已存在或无法重命名: {英文表名} -> {中文表名}")
                else:
                    print(f"  ❌ 重命名 {英文表名} 失败: {错误信息[:80]}")
        
        数据库连接.commit()
        print(f"\n✅ 共成功重命名 {成功重命名数} 个表")
        
        # 3. 为所有表添加中文注释
        print("\n📝 第三步：为中文表添加注释说明")
        
        中文表注释 = {
            '考试成绩_600题': '600题考试成绩表',
            '学业记录_不及格': '不及格课程记录表',
            '党员_基本信息': '党员基本信息表',
            '党员发展_积极分子': '积极分子信息表',
            '成绩_积极分子结业': '积极分子结业成绩表',
            '证书_计算机二级': '计算机二级证书成绩表',
            '成员_名单': '全体成员名单表',
            '学业_综测排名': '综测成绩排名表',
            '党员发展_申请人': '入党申请人信息表',
            '成员_团员': '团员信息表',
            '证书_英语四级': '英语四级成绩表',
            '成员_政治面貌': '政治面貌信息表',
            '信息汇总_总表': '党员信息总表（原始导入）'
        }
        
        for 表名, 注释 in 中文表注释.items():
            try:
                # 检查表是否存在
                检查表SQL = f"SELECT COUNT(*) as 是否存在 FROM sys.tables WHERE name = '{表名}'"
                检查结果 = 数据库连接.execute(text(检查表SQL))
                表是否存在 = 检查结果.fetchone().是否存在
                
                if 表是否存在:
                    # 删除旧的扩展属性（如果存在）
                    try:
                        删除注释SQL = f"""
                        EXEC sp_dropextendedproperty 
                            @name = N'MS_Description', 
                            @level0type = N'SCHEMA', @level0name = N'dbo',
                            @level1type = N'TABLE', @level1name = N'{表名}'
                        """
                        数据库连接.execute(text(删除注释SQL))
                    except:
                        pass  # 忽略错误
                    
                    # 添加新的中文注释
                    添加注释SQL = f"""
                    EXEC sp_addextendedproperty 
                        @name = N'MS_Description', 
                        @value = N'{注释}',
                        @level0type = N'SCHEMA', @level0name = N'dbo',
                        @level1type = N'TABLE', @level1name = N'{表名}'
                    """
                    数据库连接.execute(text(添加注释SQL))
                    print(f"  ✅ 已添加注释: {表名} - {注释}")
                    
            except Exception as 错误:
                print(f"  ⚠️  为 {表名} 添加注释失败: {str(错误)[:50]}")
        
        数据库连接.commit()
        
        # 4. 验证最终结果
        print("\n🔍 第四步：验证最终表结构")
        
        验证SQL = """
        SELECT 
            t.name as 表名,
            CAST(ep.value AS NVARCHAR(500)) as 表注释,
            SUM(p.rows) as 记录数,
            t.create_date as 创建时间
        FROM sys.tables t
        LEFT JOIN sys.extended_properties ep 
            ON ep.major_id = t.object_id 
            AND ep.minor_id = 0 
            AND ep.name = 'MS_Description'
        LEFT JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
        WHERE t.type = 'U'
        GROUP BY t.name, ep.value, t.create_date
        ORDER BY t.name
        """
        
        验证结果 = 数据库连接.execute(text(验证SQL))
        最终表信息 = 验证结果.fetchall()
        
        print("\n📊 数据库最终表结构:")
        print("=" * 90)
        print(f"{'表名':25} | {'记录数':8} | {'注释说明':45} | {'创建时间'}")
        print("=" * 90)
        
        总记录数 = 0
        for 表信息 in 最终表信息:
            表名 = 表信息.表名
            注释 = 表信息.表注释 if 表信息.表注释 else '（无注释）'
            记录数 = 表信息.记录数 if 表信息.记录数 else 0
            创建时间 = 表信息.创建时间.strftime('%Y-%m-%d %H:%M') if 表信息.创建时间 else '未知'
            总记录数 += 记录数
            
            print(f"{表名:25} | {记录数:8} | {注释:45} | {创建时间}")
        
        print("=" * 90)
        print(f"{'总计':25} | {总记录数:8} | 共 {len(最终表信息)} 个表")
        
        # 5. 生成实用的查询示例
        print("\n💡 实用的SQL查询示例:")
        print("-" * 70)
        print("-- 1. 查看所有表的基本信息")
        print("SELECT * FROM [党员_基本信息];")
        print("\n-- 2. 查询特定人员的所有信息")
        print("""
        -- 假设要查询'张三'的信息
        SELECT '党员信息' as 来源, * FROM [党员_基本信息] WHERE 姓名 = '张三'
        UNION ALL
        SELECT '积极分子', * FROM [党员发展_积极分子] WHERE 姓名 = '张三'
        UNION ALL
        SELECT '英语四级', * FROM [证书_英语四级] WHERE 姓名 = '张三'
        UNION ALL
        SELECT '团员信息', * FROM [成员_团员] WHERE 姓名 = '张三';
        """)
        
        print("\n-- 3. 统计各类人员数量")
        print("""
        SELECT '党员' as 类别, COUNT(*) as 人数 FROM [党员_基本信息]
        UNION ALL
        SELECT '积极分子', COUNT(*) FROM [党员发展_积极分子]
        UNION ALL
        SELECT '入党申请人', COUNT(*) FROM [党员发展_申请人]
        UNION ALL
        SELECT '团员', COUNT(*) FROM [成员_团员]
        ORDER BY 人数 DESC;
        """)
        
        print("\n-- 4. 查找不及格的学生（关联查询）")
        print("""
        SELECT 
            f.姓名,
            f.课程名称,
            f.成绩,
            f.学期,
            m.班级,
            m.政治面貌
        FROM [学业记录_不及格] f
        LEFT JOIN [成员_名单] m ON f.姓名 = m.姓名
        ORDER BY f.姓名;
        """)
        
        print("\n-- 5. 查看表结构（字段信息）")
        print("""
        SELECT 
            TABLE_NAME as 表名,
            COLUMN_NAME as 字段名,
            DATA_TYPE as 数据类型,
            IS_NULLABLE as 允许空值,
            CHARACTER_MAXIMUM_LENGTH as 最大长度
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME IN (
            SELECT name FROM sys.tables
        )
        ORDER BY TABLE_NAME, ORDINAL_POSITION;
        """)
        
except Exception as 错误:
    print(f"❌ 脚本执行失败: {str(错误)}")
    print("\n💡 如果遇到权限问题，请确保：")
    print("1. SQL Server服务正在运行")
    print("2. 使用Windows身份验证登录")
    print("3. 有足够的数据库权限")

print("\n" + "="*60)
print("🎉 英文表名转换完成！")
print("✅ 已将英文表名转换为中文表名")
print("✅ 已为所有表添加中文注释")
print("✅ 数据库现在完全使用中文表名")
print("="*60)
print("\n📌 提示：在SQL查询中，中文表名需要用方括号[]括起来")
print("📌 示例: SELECT * FROM [党员_基本信息] WHERE 政治面貌 = '中共党员'")