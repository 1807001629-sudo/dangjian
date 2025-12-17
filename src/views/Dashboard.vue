<template>
  <div class="dashboard" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 简洁头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2 class="page-title">数据看板</h2>
        <div class="page-subtitle">实时监控 · 智能分析</div>
      </div>
      <div class="header-right">
        <div class="date-info">
          <span class="date-icon">📅</span>
          <span class="current-date">{{ currentDate }}</span>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="exportAllData" title="导出全部数据">
            <span class="action-icon">📥</span>
          </button>
          <button class="action-btn" @click="refreshData" title="刷新">
            <span class="action-icon">🔄</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 紧凑的统计卡片 -->
    <div class="compact-stats">
      <div class="stat-card compact">
        <div class="stat-header">
          <div class="stat-icon">👥</div>
          <div class="stat-title">总人数</div>
        </div>
        <div class="stat-value">{{ totalCount }}</div>
        <div class="stat-trend">
          <span class="trend-up">↑ 12%</span>
          <span class="trend-label">较上月</span>
        </div>
      </div>

      <div class="stat-card compact">
        <div class="stat-header">
          <div class="stat-icon">⭐</div>
          <div class="stat-title">党员人数</div>
        </div>
        <div class="stat-value">{{ partyMemberCount }}</div>
        <div class="stat-breakdown">
          <span class="breakdown-item">
            <span class="breakdown-dot" style="background: #c7000a;"></span>
            正式 {{ stats.partyMember || 0 }}
          </span>
          <span class="breakdown-item">
            <span class="breakdown-dot" style="background: #fa8c16;"></span>
            预备 {{ stats.partyCandidate || 0 }}
          </span>
        </div>
      </div>

      <div class="stat-card compact">
        <div class="stat-header">
          <div class="stat-icon">🌱</div>
          <div class="stat-title">共青团员</div>
        </div>
        <div class="stat-value">{{ stats.youthLeague || 0 }}</div>
        <div class="stat-percentage">
          <div class="percentage-bar">
            <div class="percentage-fill" :style="{ width: youthLeaguePercentage + '%' }"></div>
          </div>
          <div class="percentage-text">占总数 {{ youthLeaguePercentage }}%</div>
        </div>
      </div>

      <div class="stat-card compact">
        <div class="stat-header">
          <div class="stat-icon">⏱️</div>
          <div class="stat-title">活动总时数</div>
        </div>
        <div class="stat-value">{{ totalActivityHours }}</div>
        <div class="stat-average">人均 {{ averageActivityHours }} 小时</div>
      </div>
    </div>

    <!-- 左右并排的图表 -->
    <div class="chart-row">
      <!-- 左：政治面貌分布 -->
      <div class="chart-container">
        <BaseCard title="政治面貌分布" class="compact-card">
          <div class="chart-content">
            <div class="chart-wrapper">
              <PieChart
                :data="politicalStatusData"
                :colors="['#c7000a', '#fa8c16', '#52c41a', '#1890ff']"
                height="220px"
                @slice-click="handlePoliticalStatusClick"
              />
            </div>
            <div class="chart-legend">
              <div 
                class="legend-item" 
                v-for="item in politicalStatusData" 
                :key="item.name"
                @click="handlePoliticalStatusLegendClick(item.name)"
              >
                <div class="legend-dot" :style="{ backgroundColor: getStatusColor(item.name) }"></div>
                <div class="legend-label">{{ item.name }}</div>
                <div class="legend-value">{{ item.value }}人</div>
                <div class="legend-percentage">{{ getPercentage(item.value) }}%</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 右：入党流程阶段分布 -->
      <div class="chart-container">
        <BaseCard title="入党流程阶段分布" class="compact-card">
          <div class="chart-content">
            <div class="chart-wrapper">
              <BarChart
                :data="processStageData"
                :x-axis="processStageLabels"
                color="#c7000a"
                height="220px"
                @bar-click="handleStageClick"
              />
            </div>
            <!-- 右边合并后的条状图 -->
            <div class="merged-progress">
              <div class="progress-group" @click="handleGroupClick('入党申请人')">
                <div class="group-header">
                  <div class="group-title">入党申请人</div>
                  <div class="group-count">{{ applicantCount }}人</div>
                </div>
                <div class="group-breakdown">
                  <span class="breakdown-item">入党申请人: {{ stats.applicant || 0 }}人</span>
                  <span class="breakdown-item">通过600题: {{ stats.passed600 || 0 }}人</span>
                </div>
              </div>
              <div class="progress-group" @click="handleGroupClick('入党积极分子')">
                <div class="group-header">
                  <div class="group-title">入党积极分子</div>
                  <div class="group-count">{{ activistCount }}人</div>
                </div>
                <div class="group-breakdown">
                  <span class="breakdown-item">入党积极分子: {{ stats.activist || 0 }}人</span>
                  <span class="breakdown-item">培训结业: {{ stats.trainingComplete || 0 }}人</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- 双栏排行榜 -->
    <div class="ranking-row">
      <!-- 左：活动时数排行榜 -->
      <div class="ranking-container">
        <BaseCard title="活动时数排行榜" class="compact-card">
          <div class="ranking-header">
            <span class="ranking-icon">🏆</span>
            <span>活动积极分子</span>
            <button class="view-all-btn" @click="openActivityHoursModal">查看全部</button>
          </div>
          <div class="ranking-list">
            <div v-if="activityRanking.length === 0" class="empty-ranking">
              暂无活动数据
            </div>
            <div v-else v-for="item in activityRanking" :key="item.rank" class="ranking-item">
              <div class="item-rank" :class="{
                'rank-1': item.rank === 1,
                'rank-2': item.rank === 2,
                'rank-3': item.rank === 3
              }">{{ item.rank }}</div>
              <div class="item-avatar">{{ item.name.charAt(0) }}</div>
              <div class="item-details">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-meta">
                  <span class="item-class">{{ item.class }}</span>
                  <span class="item-status">{{ item.status }}</span>
                </div>
              </div>
              <div class="item-score">{{ item.hours }}h</div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 右：考试成绩排行榜 -->
      <div class="ranking-container">
        <BaseCard title="考试成绩排行榜" class="compact-card">
          <div class="ranking-header">
            <span class="ranking-icon">📚</span>
            <span>学习标兵</span>
            <button class="view-all-btn" @click="openTestScoreModal">查看全部</button>
          </div>
          <div class="ranking-list">
            <div v-if="testScoreRanking.length === 0" class="empty-ranking">
              暂无成绩数据
            </div>
            <div v-else v-for="item in testScoreRanking" :key="item.rank" class="ranking-item">
              <div class="item-rank" :class="{
                'rank-1': item.rank === 1,
                'rank-2': item.rank === 2,
                'rank-3': item.rank === 3
              }">{{ item.rank }}</div>
              <div class="item-avatar">{{ item.name.charAt(0) }}</div>
              <div class="item-details">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-meta">
                  <span class="item-class">{{ item.class }}</span>
                  <span class="item-status">{{ item.status }}</span>
                </div>
              </div>
              <div class="item-score">{{ item.score }}分</div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- 底部统计 -->
    <div class="bottom-stats">
      <BaseCard title="数据摘要" class="compact-card">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-icon">📊</div>
            <div class="summary-content">
              <div class="summary-label">班级数量</div>
              <div class="summary-value">{{ classCount }}</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon">🎯</div>
            <div class="summary-content">
              <div class="summary-label">活动参与率</div>
              <div class="summary-value">{{ activityParticipationRate }}%</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon">✅</div>
            <div class="summary-content">
              <div class="summary-label">考试通过率</div>
              <div class="summary-value">{{ testPassRate }}%</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon">📅</div>
            <div class="summary-content">
              <div class="summary-label">数据更新</div>
              <div class="summary-value">{{ latestUpdate }}</div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 活动时数弹窗 -->
    <div v-if="showActivityHoursModalFlag" class="modal-overlay" @click.self="closeActivityHoursModal">
      <div class="ranking-modal">
        <div class="modal-header">
          <h3 class="modal-title">活动时数排行榜</h3>
          <button class="modal-close" @click="closeActivityHoursModal">×</button>
        </div>
        
        <div class="modal-content">
          <div class="summary-info">
            <div class="summary-card">
              <div class="summary-value">{{ activityHoursTotalCount }}人</div>
              <div class="summary-label">参与活动总人数</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ averageActivityHoursModal }}h</div>
              <div class="summary-label">平均活动时数</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ totalActivityHoursModal }}h</div>
              <div class="summary-label">活动总时数</div>
            </div>
          </div>
          
          <div class="search-section">
            <div class="search-box">
              <input
                v-model="activityHoursSearchText"
                type="text"
                placeholder="搜索姓名、学号或班级..."
                class="search-input"
                @keyup.enter="performActivityHoursSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
            <div class="filter-actions">
              <button 
                class="filter-btn" 
                :class="{ 'active': filterByActivist }"
                @click="toggleActivistFilter"
              >
                {{ filterByActivist ? '取消筛选' : '积极分子' }}
              </button>
              <button 
                class="filter-btn" 
                :class="{ 'active': filterByCandidate }"
                @click="toggleCandidateFilter"
              >
                {{ filterByCandidate ? '取消筛选' : '预备党员' }}
              </button>
              <div class="sort-options">
                <label class="sort-label">
                  <input type="radio" v-model="activityHoursSortBy" value="total" />
                  按总时数排序
                </label>
                <label class="sort-label">
                  <input type="radio" v-model="activityHoursSortBy" value="adjusted" />
                  按修正党时排序
                </label>
              </div>
            </div>
          </div>
          
          <div class="member-list">
            <div v-if="activityHoursFilteredList.length === 0" class="empty-list">
              暂无活动时数数据
            </div>
            <div v-else class="table-container">
              <table class="member-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>姓名</th>
                    <th>学号</th>
                    <th>班级</th>
                    <th>政治面貌</th>
                    <th>总活动时数</th>
                    <th>修正党时</th>
                    <th>积极分子时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(member, index) in activityHoursPaginatedList" :key="getActivityHoursKey(member, index)">
                    <td>{{ (activityHoursCurrentPage - 1) * activityHoursPageSize + index + 1 }}</td>
                    <td>{{ member.姓名 || '未知' }}</td>
                    <td>{{ member.学号 || '-' }}</td>
                    <td>{{ member.班级 || '-' }}</td>
                    <td>{{ member.政治面貌 || '-' }}</td>
                    <td>
                      <span class="hours-badge">{{ member.活动时数 || 0 }}h</span>
                    </td>
                    <td>
                      <span class="adjusted-hours">{{ getAdjustedHours(member) }}h</span>
                    </td>
                    <td>
                      <span v-if="getActivistTime(member)" class="date-badge">{{ formatDate(getActivistTime(member)) }}</span>
                      <span v-else class="no-data">-</span>
                    </td>
                    <td>
                      <button class="detail-btn" @click="viewMemberDetail(member)">详情</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination" v-if="activityHoursFilteredList.length > activityHoursPageSize">
              <button 
                class="page-btn" 
                :disabled="activityHoursCurrentPage === 1"
                @click="activityHoursCurrentPage--"
              >
                上一页
              </button>
              <span class="page-info">
                第 {{ activityHoursCurrentPage }} 页 / 共 {{ activityHoursTotalPages }} 页
              </span>
              <button 
                class="page-btn" 
                :disabled="activityHoursCurrentPage === activityHoursTotalPages"
                @click="activityHoursCurrentPage++"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-export" @click="exportActivityHoursData">
            <span class="export-icon">📊</span>
            导出Excel
          </button>
          <div class="footer-info">
            共 {{ activityHoursFilteredList.length }} 条记录
          </div>
        </div>
      </div>
    </div>

    <!-- 考试成绩弹窗 -->
    <div v-if="showTestScoreModalFlag" class="modal-overlay" @click.self="closeTestScoreModal">
      <div class="ranking-modal">
        <div class="modal-header">
          <h3 class="modal-title">600题考试成绩排行榜</h3>
          <button class="modal-close" @click="closeTestScoreModal">×</button>
        </div>
        
        <div class="modal-content">
          <div class="summary-info">
            <div class="summary-card">
              <div class="summary-value">{{ testScoreTotalCount }}人</div>
              <div class="summary-label">参加考试总人数</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ averageTestScore }}分</div>
              <div class="summary-label">平均分数</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">{{ testPassRateModal }}%</div>
              <div class="summary-label">考试通过率</div>
            </div>
          </div>
          
          <div class="search-section">
            <div class="search-box">
              <input
                v-model="testScoreSearchText"
                type="text"
                placeholder="搜索姓名、学号或班级..."
                class="search-input"
                @keyup.enter="performTestScoreSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
            <div class="filter-actions">
              <div class="score-filter">
                <span>分数范围:</span>
                <input type="number" v-model="minScore" placeholder="最低分" class="score-input" />
                <span>-</span>
                <input type="number" v-model="maxScore" placeholder="最高分" class="score-input" />
                <button class="apply-filter-btn" @click="applyScoreFilter">筛选</button>
                <button class="clear-filter-btn" @click="clearScoreFilter" v-if="scoreFilterApplied">清除</button>
              </div>
              <div class="sort-options">
                <label class="sort-label">
                  <input type="radio" v-model="testScoreSortBy" value="desc" />
                  从高到低
                </label>
                <label class="sort-label">
                  <input type="radio" v-model="testScoreSortBy" value="asc" />
                  从低到高
                </label>
              </div>
            </div>
          </div>
          
          <div class="member-list">
            <div v-if="testScoreFilteredList.length === 0" class="empty-list">
              暂无考试成绩数据
            </div>
            <div v-else class="table-container">
              <table class="member-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>姓名</th>
                    <th>学号</th>
                    <th>班级</th>
                    <th>政治面貌</th>
                    <th>600题成绩</th>
                    <th>状态</th>
                    <th>考试时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(member, index) in testScorePaginatedList" :key="getTestScoreKey(member, index)">
                    <td>{{ (testScoreCurrentPage - 1) * testScorePageSize + index + 1 }}</td>
                    <td>{{ member.姓名 || '未知' }}</td>
                    <td>{{ member.学号 || '-' }}</td>
                    <td>{{ member.班级 || '-' }}</td>
                    <td>{{ member.政治面貌 || '-' }}</td>
                    <td>
                      <span :class="{
                        'score-excellent': member['600题考试成绩'] >= 90,
                        'score-good': member['600题考试成绩'] >= 80 && member['600题考试成绩'] < 90,
                        'score-pass': member['600题考试成绩'] >= 60 && member['600题考试成绩'] < 80,
                        'score-fail': member['600题考试成绩'] < 60,
                        'no-data': !member['600题考试成绩']
                      }">
                        {{ member['600题考试成绩'] || '未考' }}
                      </span>
                    </td>
                    <td>
                      <span :class="{
                        'status-pass': member['600题考试成绩'] >= 60,
                        'status-fail': member['600题考试成绩'] < 60,
                        'status-unknown': !member['600题考试成绩']
                      }">
                        {{ member['600题考试成绩'] ? (member['600题考试成绩'] >= 60 ? '通过' : '未通过') : '未考' }}
                      </span>
                    </td>
                    <td>
                      <span v-if="member['600题考试时间']" class="date-badge">{{ formatDate(member['600题考试时间']) }}</span>
                      <span v-else class="no-data">-</span>
                    </td>
                    <td>
                      <button class="detail-btn" @click="viewMemberDetail(member)">详情</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination" v-if="testScoreFilteredList.length > testScorePageSize">
              <button 
                class="page-btn" 
                :disabled="testScoreCurrentPage === 1"
                @click="testScoreCurrentPage--"
              >
                上一页
              </button>
              <span class="page-info">
                第 {{ testScoreCurrentPage }} 页 / 共 {{ testScoreTotalPages }} 页
              </span>
              <button 
                class="page-btn" 
                :disabled="testScoreCurrentPage === testScoreTotalPages"
                @click="testScoreCurrentPage++"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-export" @click="exportTestScoreData">
            <span class="export-icon">📊</span>
            导出Excel
          </button>
          <div class="footer-info">
            共 {{ testScoreFilteredList.length }} 条记录
          </div>
        </div>
      </div>
    </div>

    <!-- 成员详情弹窗 -->
    <div v-if="showMemberDetailModal" class="modal-overlay" @click.self="closeMemberDetailModal">
      <div class="detail-modal">
        <div class="modal-header">
          <h3 class="modal-title">成员详细信息</h3>
          <button class="modal-close" @click="closeMemberDetailModal">×</button>
        </div>
        
        <div class="modal-content detail-content">
          <div v-if="selectedMember" class="member-detail">
            <div class="detail-header">
              <div class="avatar-large">{{ selectedMember.姓名?.charAt(0) || '?' }}</div>
              <div class="detail-info">
                <h4 class="member-name">{{ selectedMember.姓名 || '未知' }}</h4>
                <div class="member-id">学号: {{ selectedMember.学号 || '-' }}</div>
                <div class="member-class">班级: {{ selectedMember.班级 || '-' }}</div>
              </div>
              <div class="detail-status">
                <span class="status-badge" :style="{ backgroundColor: getStatusColor(selectedMember.政治面貌) }">
                  {{ selectedMember.政治面貌 || '群众' }}
                </span>
                <span class="process-badge">
                  {{ selectedMember.入党流程阶段 || '未开始' }}
                </span>
              </div>
            </div>
            
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">活动总时数</div>
                <div class="detail-value">{{ selectedMember.活动时数 || 0 }} 小时</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">修正党时</div>
                <div class="detail-value">{{ getAdjustedHours(selectedMember) }} 小时</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">600题成绩</div>
                <div class="detail-value" :class="{
                  'score-excellent': selectedMember['600题考试成绩'] >= 90,
                  'score-good': selectedMember['600题考试成绩'] >= 80 && selectedMember['600题考试成绩'] < 90,
                  'score-pass': selectedMember['600题考试成绩'] >= 60 && selectedMember['600题考试成绩'] < 80,
                  'score-fail': selectedMember['600题考试成绩'] < 60
                }">
                  {{ selectedMember['600题考试成绩'] || '未考' }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">积极分子时间</div>
                <div class="detail-value">
                  {{ getActivistTime(selectedMember) ? formatDate(getActivistTime(selectedMember)) : '-' }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">申请时间</div>
                <div class="detail-value">
                  {{ selectedMember.申请入党时间 ? formatDate(selectedMember.申请入党时间) : '-' }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">考试时间</div>
                <div class="detail-value">
                  {{ selectedMember['600题考试时间'] ? formatDate(selectedMember['600题考试时间']) : '-' }}
                </div>
              </div>
            </div>
            
            <div class="detail-notes" v-if="selectedMember.备注">
              <div class="detail-label">备注</div>
              <div class="notes-content">{{ selectedMember.备注 }}</div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-close" @click="closeMemberDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import PieChart from '@/components/charts/PieChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
import rawData from '@/assets/data.json';
import * as XLSX from 'xlsx';

// 监听侧边栏状态
const sidebarCollapsed = ref(false);

// 数据
const membersData = ref([]);
const stats = ref({
  partyMember: 0,
  partyCandidate: 0,
  applicant: 0,
  passed600: 0,
  activist: 0,
  trainingComplete: 0,
  youthLeague: 0,
  masses: 0
});

// 弹窗相关状态
// 活动时数弹窗
const showActivityHoursModalFlag = ref(false);
const activityHoursSearchText = ref('');
const filterByActivist = ref(false);
const filterByCandidate = ref(false);
const activityHoursSortBy = ref('total');
const activityHoursCurrentPage = ref(1);
const activityHoursPageSize = 10;

// 考试成绩弹窗
const showTestScoreModalFlag = ref(false);
const testScoreSearchText = ref('');
const minScore = ref('');
const maxScore = ref('');
const testScoreSortBy = ref('desc');
const testScoreCurrentPage = ref(1);
const testScorePageSize = 10;

// 成员详情弹窗
const showMemberDetailModal = ref(false);
const selectedMember = ref(null);

// 基础统计
const totalCount = computed(() => membersData.value.length);

const partyMemberCount = computed(() => {
  return membersData.value.filter(member => 
    member.政治面貌 === '中共党员' || member.政治面貌 === '中共预备党员'
  ).length;
});

const youthLeaguePercentage = computed(() => {
  return totalCount.value > 0 ? Math.round((stats.value.youthLeague / totalCount.value) * 100) : 0;
});

const totalActivityHours = computed(() => {
  const total = membersData.value.reduce((sum, member) => {
    const hours = member.活动时数 ? parseFloat(member.活动时数) : 0;
    return sum + hours;
  }, 0);
  return Math.round(total);
});

const averageActivityHours = computed(() => {
  return totalCount.value > 0 ? (totalActivityHours.value / totalCount.value).toFixed(1) : '0.0';
});

// 入党流程分组统计
const applicantCount = computed(() => {
  return (stats.value.applicant || 0) + (stats.value.passed600 || 0);
});

const activistCount = computed(() => {
  return (stats.value.activist || 0) + (stats.value.trainingComplete || 0);
});

const classCount = computed(() => {
  const classes = new Set();
  membersData.value.forEach(member => {
    if (member.班级) classes.add(member.班级);
  });
  return classes.size;
});

const activityParticipationRate = computed(() => {
  const participated = membersData.value.filter(member => 
    member.活动时数 && parseFloat(member.活动时数) > 0
  ).length;
  return totalCount.value > 0 ? Math.round((participated / totalCount.value) * 100) : 0;
});

const testPassRate = computed(() => {
  const passed = membersData.value.filter(member => 
    member['600题考试成绩'] && parseFloat(member['600题考试成绩']) >= 60
  ).length;
  return totalCount.value > 0 ? Math.round((passed / totalCount.value) * 100) : 0;
});

const latestUpdate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  });
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// 政治面貌数据
const politicalStatusData = computed(() => {
  const statusMap = {
    '中共党员': 0,
    '中共预备党员': 0,
    '共青团员': 0,
    '群众': 0
  };
  
  membersData.value.forEach(member => {
    const status = member.政治面貌 || '群众';
    if (statusMap[status] !== undefined) {
      statusMap[status]++;
    } else {
      statusMap['群众']++;
    }
  });
  
  return Object.entries(statusMap)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
});

// 流程阶段数据
const processStageData = computed(() => {
  const order = [
    '入党申请人',
    '通过600题', 
    '入党积极分子',
    '积极分子培训结业'
  ];
  
  const stageCounts = {};
  order.forEach(stage => {
    stageCounts[stage] = 0;
  });
  
  membersData.value.forEach(member => {
    const stage = member.入党流程阶段;
    if (stage && stageCounts.hasOwnProperty(stage)) {
      stageCounts[stage]++;
    }
  });
  
  return order.map(stage => stageCounts[stage]);
});

const processStageLabels = computed(() => {
  return ['入党申请人', '通过600题', '入党积极分子', '积极分子培训结业'];
});

// 排行榜数据
const activityRanking = computed(() => {
  return membersData.value
    .map(member => ({
      name: member.姓名 || '未知',
      class: member.班级 || '未知班级',
      hours: member.活动时数 ? parseFloat(member.活动时数) : 0,
      status: member.政治面貌 || '未知'
    }))
    .filter(member => member.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5)
    .map((member, index) => ({
      rank: index + 1,
      ...member
    }));
});

const testScoreRanking = computed(() => {
  return membersData.value
    .map(member => ({
      name: member.姓名 || '未知',
      class: member.班级 || '未知班级',
      score: member['600题考试成绩'] ? parseFloat(member['600题考试成绩']) : 0,
      status: member.政治面貌 || '未知'
    }))
    .filter(member => member.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((member, index) => ({
      rank: index + 1,
      ...member
    }));
});

// 活动时数弹窗计算属性
const activityHoursTotalCount = computed(() => {
  return membersData.value.filter(member => 
    member.活动时数 && parseFloat(member.活动时数) > 0
  ).length;
});

const averageActivityHoursModal = computed(() => {
  const membersWithHours = membersData.value.filter(member => 
    member.活动时数 && parseFloat(member.活动时数) > 0
  );
  if (membersWithHours.length === 0) return '0.0';
  const total = membersWithHours.reduce((sum, member) => {
    return sum + (parseFloat(member.活动时数) || 0);
  }, 0);
  return (total / membersWithHours.length).toFixed(1);
});

const totalActivityHoursModal = computed(() => {
  const total = membersData.value.reduce((sum, member) => {
    return sum + (parseFloat(member.活动时数) || 0);
  }, 0);
  return Math.round(total);
});

// 使用数据中的"修正党时"字段
const getAdjustedHours = (member) => {
  // 如果数据中有"修正党时"字段，直接使用
  if (member.修正党时 !== undefined && member.修正党时 !== null) {
    return parseFloat(member.修正党时) || 0;
  }
  // 否则返回原始活动时数
  return parseFloat(member.活动时数) || 0;
};

const activityHoursFilteredList = computed(() => {
  let list = membersData.value.filter(member => 
    member.活动时数 && parseFloat(member.活动时数) > 0
  );
  
  // 积极分子筛选
  if (filterByActivist.value) {
    list = list.filter(member => 
      member.入党流程阶段 === '入党积极分子' || 
      member.入党流程阶段 === '积极分子培训结业' ||
      member.入党流程阶段 === '通过600题'
    );
  }
  
  // 预备党员筛选
  if (filterByCandidate.value) {
    list = list.filter(member => 
      member.政治面貌 === '中共预备党员'
    );
  }
  
  // 搜索筛选
  if (activityHoursSearchText.value.trim()) {
    const search = activityHoursSearchText.value.toLowerCase();
    list = list.filter(member => 
      (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
      (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
      (member.班级 && member.班级.toLowerCase().includes(search))
    );
  }
  
  // 排序
  if (activityHoursSortBy.value === 'total') {
    list.sort((a, b) => {
      const aHours = parseFloat(a.活动时数) || 0;
      const bHours = parseFloat(b.活动时数) || 0;
      return bHours - aHours;
    });
  } else if (activityHoursSortBy.value === 'adjusted') {
    list.sort((a, b) => {
      const aAdjusted = getAdjustedHours(a);
      const bAdjusted = getAdjustedHours(b);
      return bAdjusted - aAdjusted;
    });
  }
  
  return list;
});

const activityHoursTotalPages = computed(() => {
  return Math.ceil(activityHoursFilteredList.value.length / activityHoursPageSize);
});

const activityHoursPaginatedList = computed(() => {
  const start = (activityHoursCurrentPage.value - 1) * activityHoursPageSize;
  const end = start + activityHoursPageSize;
  return activityHoursFilteredList.value.slice(start, end);
});

// 考试成绩弹窗计算属性
const testScoreTotalCount = computed(() => {
  return membersData.value.filter(member => 
    member['600题考试成绩'] !== undefined && member['600题考试成绩'] !== null
  ).length;
});

const averageTestScore = computed(() => {
  const membersWithScore = membersData.value.filter(member => 
    member['600题考试成绩'] !== undefined && member['600题考试成绩'] !== null
  );
  if (membersWithScore.length === 0) return '0';
  const total = membersWithScore.reduce((sum, member) => {
    return sum + (parseFloat(member['600题考试成绩']) || 0);
  }, 0);
  return (total / membersWithScore.length).toFixed(1);
});

const testPassRateModal = computed(() => {
  const membersWithScore = membersData.value.filter(member => 
    member['600题考试成绩'] !== undefined && member['600题考试成绩'] !== null
  );
  if (membersWithScore.length === 0) return 0;
  const passed = membersWithScore.filter(member => 
    member['600题考试成绩'] >= 60
  ).length;
  return Math.round((passed / membersWithScore.length) * 100);
});

const scoreFilterApplied = computed(() => {
  return minScore.value !== '' || maxScore.value !== '';
});

const testScoreFilteredList = computed(() => {
  let list = membersData.value.filter(member => 
    member['600题考试成绩'] !== undefined && member['600题考试成绩'] !== null
  );
  
  // 分数范围筛选
  if (minScore.value !== '' || maxScore.value !== '') {
    const min = minScore.value === '' ? 0 : parseInt(minScore.value);
    const max = maxScore.value === '' ? 100 : parseInt(maxScore.value);
    list = list.filter(member => {
      const score = parseFloat(member['600题考试成绩']) || 0;
      return score >= min && score <= max;
    });
  }
  
  // 搜索筛选
  if (testScoreSearchText.value.trim()) {
    const search = testScoreSearchText.value.toLowerCase();
    list = list.filter(member => 
      (member.姓名 && member.姓名.toLowerCase().includes(search)) ||
      (member.学号 && member.学号.toString().toLowerCase().includes(search)) ||
      (member.班级 && member.班级.toLowerCase().includes(search))
    );
  }
  
  // 排序
  if (testScoreSortBy.value === 'desc') {
    list.sort((a, b) => {
      const aScore = parseFloat(a['600题考试成绩']) || 0;
      const bScore = parseFloat(b['600题考试成绩']) || 0;
      return bScore - aScore;
    });
  } else if (testScoreSortBy.value === 'asc') {
    list.sort((a, b) => {
      const aScore = parseFloat(a['600题考试成绩']) || 0;
      const bScore = parseFloat(b['600题考试成绩']) || 0;
      return aScore - bScore;
    });
  }
  
  return list;
});

const testScoreTotalPages = computed(() => {
  return Math.ceil(testScoreFilteredList.value.length / testScorePageSize);
});

const testScorePaginatedList = computed(() => {
  const start = (testScoreCurrentPage.value - 1) * testScorePageSize;
  const end = start + testScorePageSize;
  return testScoreFilteredList.value.slice(start, end);
});

// 工具函数
const getStatusColor = (status) => {
  const colors = {
    '中共党员': '#c7000a',
    '中共预备党员': '#fa8c16',
    '共青团员': '#52c41a',
    '群众': '#1890ff'
  };
  return colors[status] || '#722ed1';
};

const getPercentage = (value) => {
  return totalCount.value > 0 ? Math.round((value / totalCount.value) * 100) : 0;
};

// 从数据中获取积极分子时间 - 使用正确的字段名
const getActivistTime = (member) => {
  return member.党支部接收入党积极分子时间 || null;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('zh-CN');
  } catch (e) {
    return dateString;
  }
};

const getActivityHoursKey = (member, index) => {
  return `activity-${member.id || member.学号 || member.姓名 || index}`;
};

const getTestScoreKey = (member, index) => {
  return `test-${member.id || member.学号 || member.姓名 || index}`;
};

// 事件处理函数
const openActivityHoursModal = () => {
  showActivityHoursModalFlag.value = true;
  resetActivityHoursModalState();
};

const openTestScoreModal = () => {
  showTestScoreModalFlag.value = true;
  resetTestScoreModalState();
};

const closeActivityHoursModal = () => {
  showActivityHoursModalFlag.value = false;
};

const closeTestScoreModal = () => {
  showTestScoreModalFlag.value = false;
};

const toggleActivistFilter = () => {
  filterByActivist.value = !filterByActivist.value;
  activityHoursCurrentPage.value = 1;
};

const toggleCandidateFilter = () => {
  filterByCandidate.value = !filterByCandidate.value;
  activityHoursCurrentPage.value = 1;
};

const applyScoreFilter = () => {
  testScoreCurrentPage.value = 1;
};

const clearScoreFilter = () => {
  minScore.value = '';
  maxScore.value = '';
  testScoreCurrentPage.value = 1;
};

const viewMemberDetail = (member) => {
  selectedMember.value = member;
  showMemberDetailModal.value = true;
};

const closeMemberDetailModal = () => {
  showMemberDetailModal.value = false;
  selectedMember.value = null;
};

const performActivityHoursSearch = () => {
  activityHoursCurrentPage.value = 1;
};

const performTestScoreSearch = () => {
  testScoreCurrentPage.value = 1;
};

// 重置弹窗状态
const resetActivityHoursModalState = () => {
  activityHoursSearchText.value = '';
  filterByActivist.value = false;
  filterByCandidate.value = false;
  activityHoursSortBy.value = 'total';
  activityHoursCurrentPage.value = 1;
};

const resetTestScoreModalState = () => {
  testScoreSearchText.value = '';
  minScore.value = '';
  maxScore.value = '';
  testScoreSortBy.value = 'desc';
  testScoreCurrentPage.value = 1;
};

// 点击事件处理（保持原有功能）
const handleStageClick = (index) => {
  const stage = processStageLabels.value[index];
  if (!stage || stage === '未开始') return;
  console.log('点击阶段:', stage);
};

const handleGroupClick = (group) => {
  console.log('点击分组:', group);
};

const handlePoliticalStatusClick = (index) => {
  const status = politicalStatusData.value[index]?.name;
  if (status) {
    console.log('点击政治面貌:', status);
  }
};

const handlePoliticalStatusLegendClick = (status) => {
  console.log('点击图例:', status);
};

// 操作方法
const refreshData = () => {
  loadData();
  console.log('数据已刷新');
};

const exportAllData = () => {
  exportMembersToExcel(membersData.value, '全体成员数据');
};

const exportActivityHoursData = () => {
  exportMembersToExcel(activityHoursFilteredList.value, '活动时数排行榜');
};

const exportTestScoreData = () => {
  exportMembersToExcel(testScoreFilteredList.value, '600题考试成绩排行榜');
};

// 导出Excel函数
const exportMembersToExcel = (members, filename) => {
  try {
    const exportData = members.map((member, index) => {
      return {
        序号: index + 1,
        姓名: member.姓名 || '',
        学号: member.学号 || '',
        班级: member.班级 || '',
        政治面貌: member.政治面貌 || '',
        入党流程阶段: member.入党流程阶段 || '',
        活动时数: member.活动时数 || '0',
        修正党时: member.修正党时 || getAdjustedHours(member),
        '600题成绩': member['600题考试成绩'] || '未考',
        积极分子时间: getActivistTime(member) ? formatDate(getActivistTime(member)) : '',
        申请时间: member.申请入党时间 ? formatDate(member.申请入党时间) : '',
        考试时间: member['600题考试时间'] ? formatDate(member['600题考试时间']) : ''
      };
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const wscols = [
      { wch: 8 },  // 序号
      { wch: 10 }, // 姓名
      { wch: 15 }, // 学号
      { wch: 12 }, // 班级
      { wch: 12 }, // 政治面貌
      { wch: 15 }, // 入党流程阶段
      { wch: 10 }, // 活动时数
      { wch: 10 }, // 修正党时
      { wch: 10 }, // 600题成绩
      { wch: 15 }, // 积极分子时间
      { wch: 15 }, // 申请时间
      { wch: 15 }  // 考试时间
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, '数据');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`已导出${exportData.length}条记录到Excel`);
    
  } catch (error) {
    console.error('导出Excel失败:', error);
    alert('导出失败，请重试');
  }
};

const loadData = () => {
  console.log('加载数据...');
  
  try {
    membersData.value = Array.isArray(rawData) ? rawData : [];
    
    const newStats = {
      partyMember: 0,
      partyCandidate: 0,
      applicant: 0,
      passed600: 0,
      activist: 0,
      trainingComplete: 0,
      youthLeague: 0,
      masses: 0
    };
    
    membersData.value.forEach(member => {
      const status = member.政治面貌;
      if (status === '中共党员') newStats.partyMember++;
      else if (status === '中共预备党员') newStats.partyCandidate++;
      else if (status === '共青团员') newStats.youthLeague++;
      else newStats.masses++;
      
      const stage = member.入党流程阶段;
      if (stage === '入党申请人') newStats.applicant++;
      else if (stage === '通过600题') newStats.passed600++;
      else if (stage === '入党积极分子') newStats.activist++;
      else if (stage === '积极分子培训结业') newStats.trainingComplete++;
    });
    
    stats.value = newStats;
    
    console.log('数据加载完成，共', membersData.value.length, '条记录');
    console.log('统计数据:', stats.value);
    
  } catch (error) {
    console.error('数据加载失败:', error);
    membersData.value = [];
  }
};

// 监听器
watch(activityHoursSearchText, () => {
  activityHoursCurrentPage.value = 1;
});

watch([filterByActivist, filterByCandidate, activityHoursSortBy], () => {
  activityHoursCurrentPage.value = 1;
});

watch(testScoreSearchText, () => {
  testScoreCurrentPage.value = 1;
});

watch([minScore, maxScore, testScoreSortBy], () => {
  testScoreCurrentPage.value = 1;
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dashboard {
  padding: 16px;
  min-height: 100%;
  background: #f5f7fa;
  transition: all 0.3s ease;
}

/* 当侧边栏收起时，内容区域可以更宽 */
.dashboard.sidebar-collapsed {
  padding: 16px 24px;
}

/* 简洁头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left .page-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.header-left .page-subtitle {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
}

.date-icon {
  font-size: 14px;
  color: #8c8c8c;
}

.current-date {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  color: #595959;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: #d9d9d9;
  background: #fafafa;
}

/* 紧凑统计卡片 */
.compact-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card.compact {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card.compact:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-title {
  font-size: 12px;
  color: #8c8c8c;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  font-size: 11px;
  color: #52c41a;
  font-weight: 500;
}

.trend-label {
  font-size: 11px;
  color: #8c8c8c;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #595959;
}

.breakdown-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-percentage {
  margin-top: 8px;
}

.percentage-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.percentage-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 2px;
  transition: width 1s ease;
}

.percentage-text {
  font-size: 11px;
  color: #8c8c8c;
}

.stat-average {
  font-size: 12px;
  color: #8c8c8c;
}

/* 图表行 */
.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.chart-container {
  height: 100%;
}

.compact-card {
  height: 100%;
  padding: 16px;
}

.chart-content {
  display: flex;
  height: 240px;
  gap: 16px;
}

.chart-wrapper {
  flex: 1;
  min-width: 0;
}

.chart-legend {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: #fafafa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: #fffafa;
  transform: translateX(4px);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  flex: 1;
  font-size: 12px;
  color: #595959;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-value {
  font-size: 12px;
  font-weight: 600;
  color: #262626;
  min-width: 30px;
  text-align: right;
}

.legend-percentage {
  font-size: 11px;
  color: #8c8c8c;
  min-width: 30px;
  text-align: right;
}

/* 合并后的进度组样式 */
.merged-progress {
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-group {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.progress-group:hover {
  background: #fffafa;
  border-color: #ffccc7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.08);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.group-count {
  font-size: 16px;
  font-weight: 700;
  color: #c7000a;
}

.group-breakdown {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #8c8c8c;
  padding-top: 4px;
  border-top: 1px dashed #f0f0f0;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
}

/* 排行榜行 */
.ranking-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.ranking-container {
  height: 100%;
}

.ranking-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

/* 查看全部按钮 */
.view-all-btn {
  padding: 4px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;
}

.view-all-btn:hover {
  background: #e6e6e6;
  color: #262626;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-ranking {
  text-align: center;
  padding: 40px 0;
  color: #bfbfbf;
  font-size: 13px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: #fffafa;
}

.item-rank {
  width: 24px;
  height: 24px;
  background: #ffccc7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #c7000a;
  margin-right: 8px;
}

.rank-1 {
  background: linear-gradient(135deg, #ff4d4f, #c7000a);
  color: white !important;
}

.rank-2 {
  background: #ffa39e;
  color: #c7000a;
}

.rank-3 {
  background: #ffccc7;
  color: #c7000a;
}

.item-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1890ff, #0050b3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-right: 8px;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  color: #262626;
  font-size: 13px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.item-class {
  color: #8c8c8c;
}

.item-status {
  color: #fa8c16;
  font-weight: 500;
}

.item-score {
  font-size: 14px;
  font-weight: 700;
  color: #c7000a;
  min-width: 40px;
  text-align: right;
}

/* 底部统计 */
.bottom-stats {
  margin-bottom: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.summary-icon {
  font-size: 20px;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.summary-value {
  font-size: 16px;
  font-weight: 700;
  color: #262626;
}

/* 弹窗样式 - 修复透明问题 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

/* 排行榜弹窗样式 */
.ranking-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fffafa 0%, #fff 100%);
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8c8c8c;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #262626;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.summary-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #c7000a;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 12px;
  color: #8c8c8c;
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #c7000a;
  box-shadow: 0 0 0 2px rgba(199, 0, 10, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
  font-size: 16px;
}

/* 筛选按钮样式 */
.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 16px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #c7000a;
  color: #c7000a;
}

.filter-btn.active {
  background: #c7000a;
  border-color: #c7000a;
  color: white;
}

/* 分数筛选样式 */
.score-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #595959;
}

.score-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.score-input:focus {
  outline: none;
  border-color: #c7000a;
}

.apply-filter-btn {
  padding: 4px 12px;
  background: #1890ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-filter-btn:hover {
  background: #40a9ff;
}

.clear-filter-btn {
  padding: 4px 12px;
  background: #ff4d4f;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filter-btn:hover {
  background: #ff7875;
}

/* 排序选项样式 */
.sort-options {
  display: flex;
  gap: 12px;
}

.sort-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
}

.sort-label input[type="radio"] {
  margin: 0;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-list {
  text-align: center;
  padding: 60px 0;
  color: #bfbfbf;
  font-size: 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #f0f0f0;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.member-table th {
  background: #fafafa;
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #262626;
  font-size: 13px;
  border-bottom: 2px solid #f0f0f0;
  white-space: nowrap;
}

.member-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #595959;
  white-space: nowrap;
}

.member-table tbody tr:hover {
  background: #fffafa;
}

/* 表格样式增强 */
.hours-badge {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #1890ff, #0050b3);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.adjusted-hours {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.date-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  font-size: 12px;
}

.no-data {
  color: #bfbfbf;
  font-style: italic;
}

.detail-btn {
  padding: 4px 12px;
  background: #1890ff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

/* 分数样式 */
.score-excellent {
  color: #52c41a;
  font-weight: 700;
  padding: 2px 6px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 3px;
}

.score-good {
  color: #1890ff;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 3px;
}

.score-pass {
  color: #fa8c16;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(250, 140, 22, 0.1);
  border-radius: 3px;
}

.score-fail {
  color: #ff4d4f;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 3px;
}

/* 状态样式 */
.status-pass {
  color: #52c41a;
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 12px;
  font-size: 12px;
}

.status-fail {
  color: #ff4d4f;
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 12px;
  font-size: 12px;
}

.status-unknown {
  color: #bfbfbf;
  font-style: italic;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.page-btn {
  padding: 6px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #c7000a;
  color: #c7000a;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #595959;
  min-width: 100px;
  text-align: center;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #c7000a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover {
  background: #d9363e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.2);
}

.export-icon {
  font-size: 16px;
}

.footer-info {
  font-size: 13px;
  color: #8c8c8c;
}

/* 成员详情弹窗样式 */
.detail-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease;
}

.detail-content {
  padding: 24px;
}

.member-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-large {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #c7000a, #ff4d4f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.detail-info {
  flex: 1;
}

.member-name {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #262626;
}

.member-id,
.member-class {
  font-size: 14px;
  color: #595959;
  margin-bottom: 4px;
}

.detail-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-align: center;
  min-width: 80px;
}

.process-badge {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #595959;
  text-align: center;
  min-width: 80px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.detail-notes {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.notes-content {
  font-size: 14px;
  color: #595959;
  line-height: 1.5;
  margin-top: 8px;
}

.btn-close {
  padding: 8px 24px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e6e6e6;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .compact-stats,
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-row,
  .ranking-row {
    grid-template-columns: 1fr;
  }
  
  .chart-content {
    flex-direction: column;
    height: auto;
  }
  
  .chart-legend,
  .merged-progress {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .legend-item,
  .progress-group {
    flex: 1;
    min-width: 120px;
  }
  
  .summary-info {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .score-filter {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-right {
    justify-content: space-between;
  }
  
  .compact-stats,
  .summary-grid,
  .summary-info {
    grid-template-columns: 1fr;
  }
  
  .stage-detail-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .member-table {
    font-size: 12px;
  }
  
  .member-table th,
  .member-table td {
    padding: 8px 12px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .footer-info {
    text-align: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-status {
    flex-direction: row;
    justify-content: center;
  }
  
  .filter-actions {
    gap: 8px;
  }
  
  .score-filter {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>