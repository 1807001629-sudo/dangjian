// src/utils/activistQuery.js - 主查询函数
import { queryQualifiedActivists } from './dataParser.js'

/**
 * 一键查询符合条件的积极分子
 * @param {Array} members 所有成员数据
 * @returns {Object} 查询结果
 */
export function oneClickActivistQuery(members) {
  const currentDate = new Date()
  console.log('开始一键查询积极分子资格...')
  console.log('当前日期:', currentDate.toLocaleDateString())
  console.log('数据总数:', members.length)
  
  // 过滤出积极分子培训结业的成员
  const activists = members.filter(member => 
    member.入党流程阶段 === '积极分子培训结业'
  )
  console.log('积极分子培训结业人数:', activists.length)
  
  // 查询符合条件的积极分子
  const qualified = queryQualifiedActivists(activists, currentDate)
  console.log('符合条件的积极分子人数:', qualified.length)
  
  // 生成详细报告
  const report = {
    查询时间: currentDate.toLocaleString(),
    当前日期: currentDate.toLocaleDateString(),
    数据总数: members.length,
    积极分子总数: activists.length,
    符合条件人数: qualified.length,
    符合条件比例: activists.length > 0 ? 
                  ((qualified.length / activists.length) * 100).toFixed(1) + '%' : '0%',
    详细结果: qualified.map(member => ({
      姓名: member.姓名,
      学号: member.学号,
      班级: member.班级,
      四级成绩: member.四级成绩,
      计算机二级: member.计算机二级,
      不及格情况: member.不及格情况,
      综测百分比: member.前一学年综测百分比,
      积极分子时间: member.党支部接收入党积极分子时间
    }))
  }
  
  return {
    qualifiedMembers: qualified,
    report: report
  }
}

export default {
  queryQualifiedActivists,
  oneClickActivistQuery
}