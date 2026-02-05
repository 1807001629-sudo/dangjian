// src/services/apiService.js
/**
 * API服务 - 统一管理所有数据API调用
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求失败:', error);
    
    // 统一错误处理
    let errorMessage = '网络请求失败';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          break;
        case 403:
          errorMessage = '权限不足';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = error.response.data?.message || `请求失败 (${error.response.status})`;
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络设置';
    } else {
      errorMessage = error.message;
    }
    
    return Promise.reject({
      message: errorMessage,
      code: error.response?.status,
      original: error
    });
  }
);

// API端点定义
const API = {
  // 党员相关
  PARTY_MEMBERS: '/party-members',
  ACTIVISTS: '/activists',
  APPLICANTS: '/applicants',
  
  // 成员相关
  MEMBERS: '/members',
  LEAGUE_MEMBERS: '/league-members',
  
  // 成绩相关
  EXAM_SCORES: '/exam-scores',
  CERTIFICATES: '/certificates',
  ACADEMIC_RECORDS: '/academic-records',
  
  // 统计相关
  STATISTICS: '/statistics',
  PROCESS_STATS: '/process-stats',
  
  // 导出相关
  EXPORT: '/export',
};

export default {
  // ============ 党员数据 ============
  
  /**
   * 获取所有党员信息
   * @param {Object} params - 查询参数
   * @returns {Promise} 党员列表
   */
  getPartyMembers(params = {}) {
    return apiClient.get(API.PARTY_MEMBERS, { params });
  },
  
  /**
   * 获取积极分子信息
   * @param {Object} params - 查询参数
   * @returns {Promise} 积极分子列表
   */
  getActivists(params = {}) {
    return apiClient.get(API.ACTIVISTS, { params });
  },
  
  /**
   * 获取入党申请人信息
   * @param {Object} params - 查询参数
   * @returns {Promise} 申请人列表
   */
  getApplicants(params = {}) {
    return apiClient.get(API.APPLICANTS, { params });
  },
  
  // ============ 成员数据 ============
  
  /**
   * 获取所有成员信息
   * @param {Object} params - 查询参数
   * @returns {Promise} 成员列表
   */
  getMembers(params = {}) {
    return apiClient.get(API.MEMBERS, { params });
  },
  
  /**
   * 获取团员信息
   * @param {Object} params - 查询参数
   * @returns {Promise} 团员列表
   */
  getLeagueMembers(params = {}) {
    return apiClient.get(API.LEAGUE_MEMBERS, { params });
  },
  
  /**
   * 根据ID获取单个成员信息
   * @param {String|Number} id - 成员ID
   * @returns {Promise} 成员详情
   */
  getMemberById(id) {
    return apiClient.get(`${API.MEMBERS}/${id}`);
  },
  
  // ============ 成绩数据 ============
  
  /**
   * 获取600题考试成绩
   * @param {Object} params - 查询参数
   * @returns {Promise} 成绩列表
   */
  getExamScores(params = {}) {
    return apiClient.get(API.EXAM_SCORES, { params });
  },
  
  /**
   * 获取证书成绩
   * @param {String} type - 证书类型 (cet4, computer2)
   * @param {Object} params - 查询参数
   * @returns {Promise} 证书成绩列表
   */
  getCertificateScores(type, params = {}) {
    return apiClient.get(`${API.CERTIFICATES}/${type}`, { params });
  },
  
  /**
   * 获取学业记录
   * @param {Object} params - 查询参数
   * @returns {Promise} 学业记录列表
   */
  getAcademicRecords(params = {}) {
    return apiClient.get(API.ACADEMIC_RECORDS, { params });
  },
  
  // ============ 统计数据 ============
  
  /**
   * 获取综合统计数据
   * @returns {Promise} 统计数据
   */
  getStatistics() {
    return apiClient.get(API.STATISTICS);
  },
  
  /**
   * 获取入党流程统计
   * @returns {Promise} 流程统计数据
   */
  getProcessStats() {
    return apiClient.get(API.PROCESS_STATS);
  },
  
  // ============ 导出功能 ============
  
  /**
   * 导出数据
   * @param {String} type - 数据类型
   * @param {String} format - 格式 (excel, json)
   * @param {Object} params - 查询参数
   * @returns {Promise} 文件下载
   */
  exportData(type, format = 'excel', params = {}) {
    return apiClient.get(`${API.EXPORT}/${type}`, {
      params: { ...params, format },
      responseType: 'blob'
    });
  },
  
  // ============ 积极分子查询相关 ============
  
  /**
   * 查询符合条件的积极分子
   * @param {Object} options - 查询选项
   * @returns {Promise} 查询结果
   */
  queryQualifiedActivists(options = {}) {
    return apiClient.post('/query/activists', options);
  },
  
  // ============ 数据更新 ============
  
  /**
   * 更新成员信息
   * @param {String|Number} id - 成员ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  updateMember(id, data) {
    return apiClient.put(`${API.MEMBERS}/${id}`, data);
  },
  
  /**
   * 更新修正党时
   * @param {String|Number} id - 成员ID
   * @param {Number} correction - 修正党时
   * @param {String} reason - 修正原因
   * @returns {Promise} 更新结果
   */
  updateCorrection(id, correction, reason = '') {
    return apiClient.put(`${API.MEMBERS}/${id}/correction`, {
      correction,
      reason
    });
  }
};