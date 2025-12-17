<template>
  <div class="member-detail">
    <div class="detail-header">
      <h3 class="detail-title">成员详情</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <div class="detail-body">
      <div class="member-profile">
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-text">{{ member.姓名?.charAt(0) || '?' }}</div>
          </div>
          <div class="profile-info">
            <h2 class="member-name">{{ member.姓名 }}</h2>
            <div class="member-tags">
              <span class="tag tag-status" :class="getStatusClass(member.政治面貌)">
                {{ member.政治面貌 }}
              </span>
              <span class="tag tag-class">{{ member.班级 }}</span>
              <span class="tag tag-stage">{{ member.入党流程阶段 || '未开始' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-grid">
        <BaseCard title="基本信息" class="info-card">
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">学号：</span>
              <span class="info-value">{{ member.学号 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">出生年月日：</span>
              <span class="info-value">{{ formatDate(member.出生年月日) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入校时间：</span>
              <span class="info-value">{{ formatDate(member.入校时间) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请入党时间：</span>
              <span class="info-value">{{ formatDate(member.申请入党时间) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">递交入党申请书年龄：</span>
              <span class="info-value">{{ member['递交入党申请书年龄（岁）'] || '未知' }}岁</span>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard title="入团信息" class="info-card">
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">入团时间：</span>
              <span class="info-value">{{ formatDate(member.入团时间) || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">团员资料备注：</span>
              <span class="info-value">{{ member.团员资料备注 || '无' }}</span>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard title="考核成绩" class="info-card">
          <div class="score-grid">
            <div class="score-item">
              <div class="score-label">活动时数</div>
              <div class="score-value">{{ member.活动时数 || 0 }}小时</div>
            </div>
            <div class="score-item">
              <div class="score-label">修正党时</div>
              <div class="score-value">{{ member.修正党时 || 0 }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">600题成绩</div>
              <div class="score-value">{{ member['600题考试成绩'] || '未考试' }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">600题考试时间</div>
              <div class="score-value">{{ formatDate(member['600题考试时间']) }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">积极分子结业成绩</div>
              <div class="score-value">{{ member.积极分子结业成绩 || '未结业' }}</div>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard title="入党流程时间线" class="info-card">
          <div class="timeline">
            <div class="timeline-item" :class="{ active: member.申请入党时间 }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">申请入党</div>
                <div class="timeline-date">{{ formatDate(member.申请入党时间) || '未申请' }}</div>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: member['600题考试成绩'] }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">600题考试</div>
                <div class="timeline-date">{{ formatDate(member['600题考试时间']) || '未考试' }}</div>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: member['党支部接收入党积极分子时间'] }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">成为入党积极分子</div>
                <div class="timeline-date">{{ formatDate(member['党支部接收入党积极分子时间']) || '未成为' }}</div>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: member.积极分子结业成绩 }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">积极分子培训结业</div>
                <div class="timeline-date">{{ member.积极分子结业成绩 ? '已结业' : '未结业' }}</div>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: member.政治面貌?.includes('预备党员') }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">成为预备党员</div>
                <div class="timeline-date">{{ member.政治面貌?.includes('预备党员') ? '已成为' : '未成为' }}</div>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: member.政治面貌 === '中共党员' }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">转为正式党员</div>
                <div class="timeline-date">{{ member.政治面貌 === '中共党员' ? '已转正' : '未转正' }}</div>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <BaseCard title="备注信息" class="info-card full-width">
          <div class="remarks">
            {{ member.备注 || '暂无备注' }}
          </div>
        </BaseCard>
      </div>
    </div>
    
    <div class="detail-footer">
      <button class="btn btn-secondary" @click="$emit('close')">关闭</button>
      <button class="btn btn-primary" @click="editMember">编辑信息</button>
    </div>
  </div>
</template>

<script setup>
import BaseCard from '@/components/ui/BaseCard.vue';

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'edit']);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  
  // 处理YYYYMMDD格式的日期
  if (/^\d{8}$/.test(dateStr)) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  // 处理其他格式
  return dateStr;
};

const getStatusClass = (status) => {
  const statusClasses = {
    '中共党员': 'status-party-member',
    '中共预备党员': 'status-candidate',
    '共青团员': 'status-youth',
    '群众': 'status-masses'
  };
  return statusClasses[status] || 'status-unknown';
};

const editMember = () => {
  emit('edit', props.member);
};
</script>

<style scoped>
.member-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fffafa;
}

.detail-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #fff1f0;
  border-radius: 50%;
  color: #ff4d4f;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #ffccc7;
  transform: rotate(90deg);
}

.detail-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.member-profile {
  margin-bottom: 32px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 32px;
  font-weight: bold;
}

.profile-info {
  flex: 1;
}

.member-name {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 600;
  color: #262626;
}

.member-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.tag-status {
  background: #fff1f0;
  color: #c7000a;
  border: 1px solid #ffa39e;
}

.tag-class {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.tag-stage {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.info-card {
  height: 100%;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #8c8c8c;
  flex-shrink: 0;
}

.info-value {
  color: #262626;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.score-item {
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.score-item:hover {
  background: #fffafa;
  transform: translateY(-2px);
}

.score-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.score-value {
  font-size: 18px;
  font-weight: 600;
  color: #c7000a;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #f0f0f0;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.timeline-item.active .timeline-dot {
  background: #c7000a;
  box-shadow: 0 2px 8px rgba(199, 0, 10, 0.3);
}

.timeline-content {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.timeline-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 12px;
  color: #8c8c8c;
}

.full-width {
  grid-column: 1 / -1;
}

.remarks {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  min-height: 100px;
  color: #595959;
  line-height: 1.6;
}

.detail-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: white;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: white;
  border: 1px solid #f0f0f0;
  color: #595959;
}

.btn-secondary:hover {
  border-color: #ffa39e;
  color: #c7000a;
}

.btn-primary {
  background: linear-gradient(45deg, #c7000a, #ff4d4f);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #8a0000, #c7000a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 0, 10, 0.3);
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .member-tags {
    justify-content: center;
  }
  
  .detail-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>