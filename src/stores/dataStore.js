// src/stores/dataStore.js
import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

export const useDataStore = defineStore('data', {
  state: () => ({
    members: [],
    statistics: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchMembers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.getMembers();
        this.members = response.data || [];
      } catch (err) {
        this.error = err.message || '获取成员数据失败';
        console.error('获取成员数据失败:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchStatistics() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.getStatistics();
        this.statistics = response.data || null;
      } catch (err) {
        this.error = err.message || '获取统计数据失败';
        console.error('获取统计数据失败:', err);
      } finally {
        this.loading = false;
      }
    }
  },
  
  getters: {
    totalMembers: (state) => state.members.length,
    partyMembers: (state) => state.members.filter(m => 
      m.政治面貌 === '中共党员' || m.政治面貌 === '中共预备党员'
    ),
    activists: (state) => state.members.filter(m => 
      m.入党流程阶段?.includes('积极分子')
    )
  }
});