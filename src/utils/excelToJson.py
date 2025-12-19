import pandas as pd
import json
import os
from datetime import datetime

def excel_to_json():
    # 路径配置
    excel_path = r'C:\Users\18070\Desktop\打工日记\整合\信息总表.xlsx'
    json_output_path = r'C:\Users\18070\Desktop\web\dangjian\党建管理系统\src\assets\data.json'
    
    try:
        # 读取Excel文件的指定工作表
        print(f"正在读取Excel文件: {excel_path}")
        df = pd.read_excel(excel_path, sheet_name='❤️信息汇总')
        
        # 处理时间格式 - 将类似20251218.0的格式转换为20251218
        for column in df.columns:
            # 检查列中是否有浮点数格式的日期
            if df[column].dtype in ['float64', 'int64']:
                # 尝试转换为字符串并去除.0
                df[column] = df[column].astype(str).str.replace(r'\.0$', '', regex=True)
        
        # 转换为JSON格式
        # orient='records' 会创建记录列表
        json_data = df.to_json(orient='records', force_ascii=False, indent=2)
        
        # 解析JSON字符串为Python对象，确保正确处理
        data = json.loads(json_data)
        
        # 进一步处理所有字段中的.0后缀
        for record in data:
            for key, value in record.items():
                if isinstance(value, str) and value.endswith('.0'):
                    record[key] = value[:-2]
        
        # 保存到JSON文件
        print(f"正在保存JSON文件到: {json_output_path}")
        with open(json_output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"转换完成！共转换 {len(data)} 条记录")
        print(f"文件已保存到: {json_output_path}")
        
    except Exception as e:
        print(f"转换过程中发生错误: {str(e)}")

if __name__ == "__main__":
    excel_to_json()
	