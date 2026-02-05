// src/stores/dataStore.js - 确保存在
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiService from '@/services/apiService'

export const useDataStore = defineStore('data', () => {
  // 状态
  const members = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 操作
  const fetchMembers = async (filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.getMembers(filters)
      if (response && response.data) {
        members.value = response.data
        console.log('数据存储：成功获取', members.value.length, '条成员数据')
      } else {
        console.warn('数据存储：API返回空数据')
        members.value = []
      }
    } catch (err) {
      console.error('数据存储：获取成员数据失败', err)
      error.value = err.message || '未知错误'
      members.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    members,
    loading,
    error,
    fetchMembers
  }
})