// src/services/apiService.js - 确保存在
import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// API接口定义
const API = {
  PARTY_MEMBERS: '/party-members',
  ACTIVISTS: '/activists',
  APPLICANTS: '/applicants',
  MEMBERS: '/members',
  LEAGUE_MEMBERS: '/league-members',
  STATISTICS: '/statistics',
  EXAM_SCORES: '/exam-scores',
  CERTIFICATES_ENGLISH: '/certificates/english',
  CERTIFICATES_COMPUTER: '/certificates/computer',
  ACADEMIC_RECORDS: '/academic-records'
}

// API服务方法
const apiService = {
  // 获取所有成员
  async getMembers(filters = {}) {
    try {
      const response = await apiClient.get(API.MEMBERS, { params: filters })
      return response.data
    } catch (error) {
      console.error('获取成员数据失败:', error)
      throw error
    }
  },

  // 获取统计数据
  async getStatistics() {
    try {
      const response = await apiClient.get(API.STATISTICS)
      return response.data
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  },

  // 获取党员信息
  async getPartyMembers(filters = {}) {
    try {
      const response = await apiClient.get(API.PARTY_MEMBERS, { params: filters })
      return response.data
    } catch (error) {
      console.error('获取党员信息失败:', error)
      throw error
    }
  },

  // 获取积极分子信息
  async getActivists(filters = {}) {
    try {
      const response = await apiClient.get(API.ACTIVISTS, { params: filters })
      return response.data
    } catch (error) {
      console.error('获取积极分子信息失败:', error)
      throw error
    }
  },

  // 健康检查
  async healthCheck() {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      console.error('健康检查失败:', error)
      throw error
    }
  },

  // 数据库状态
  async dbStatus() {
    try {
      const response = await apiClient.get('/db-status')
      return response.data
    } catch (error) {
      console.error('数据库状态检查失败:', error)
      throw error
    }
  }
}

export default apiService