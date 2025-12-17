// 党建管理系统 - 优化后的主逻辑文件
// 用户上传Excel文件后自动生成图表

class PartyBuildingSystem {
    constructor() {
        // 全局变量
        this.allData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentSection = 'dashboard';
        this.charts = {};
        this.hasData = false;
        
        // 初始化
        this.init();
    }
    
    async init() {
        // 初始化界面
        this.initUI();
        this.initEvents();
        this.initCharts();
        
        // 显示欢迎引导界面
        this.showWelcomeGuide();
        
        // 显示默认页面
        this.showSection('dashboard');
    }
    
    // 显示欢迎引导界面
    showWelcomeGuide() {
        const guide = document.getElementById('welcome-guide');
        guide.style.display = 'flex';
        
        // 设置文件上传事件
        const fileInput = document.getElementById('welcome-file-input');
        const uploadArea = document.getElementById('upload-area');
        
        // 拖放功能
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                this.handleFileUpload({ target: { files: e.dataTransfer.files } });
            }
        });
        
        // 文件选择功能
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
    }
    
    // 隐藏欢迎引导界面
    hideWelcomeGuide() {
        const guide = document.getElementById('welcome-guide');
        guide.style.display = 'none';
        this.hasData = true;
    }
    
    // 处理文件上传
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        const validTypes = ['.xlsx', '.xls', '.csv'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            this.showNotification('请上传Excel或CSV文件', 'error');
            return;
        }
        
        // 检查文件大小（限制10MB）
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('文件大小不能超过10MB', 'error');
            return;
        }
        
        this.showLoading('正在解析数据文件...');
        
        try {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    let data = [];
                    
                    if (fileExtension === '.csv') {
                        // 处理CSV文件
                        const text = e.target.result;
                        const workbook = XLSX.read(text, { type: 'string' });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        data = XLSX.utils.sheet_to_json(worksheet);
                    } else {
                        // 处理Excel文件
                        const dataArray = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(dataArray, { type: 'array' });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        data = XLSX.utils.sheet_to_json(worksheet);
                    }
                    
                    // 数据处理
                    this.allData = this.processData(data);
                    this.filteredData = [...this.allData];
                    
                    // 隐藏引导界面，显示主界面
                    this.hideWelcomeGuide();
                    
                    // 更新界面
                    this.updateDashboard();
                    this.updateMemberTable();
                    this.updateDataStats();
                    this.updateClassFilterOptions();
                    
                    this.hideLoading();
                    
                    // 显示成功通知
                    this.showNotification(`数据导入成功！共加载 ${this.allData.length} 条记录`, 'success');
                    
                    // 添加日志
                    this.addLog('数据导入', `成功导入 ${file.name} 文件，共 ${this.allData.length} 条记录`);
                    
                } catch (error) {
                    console.error('解析数据失败:', error);
                    this.showError('解析数据文件失败，请检查文件格式是否正确');
                    this.hideLoading();
                }
            };
            
            reader.onerror = () => {
                this.showError('读取文件失败');
                this.hideLoading();
            };
            
            if (fileExtension === '.csv') {
                reader.readAsText(file, 'UTF-8');
            } else {
                reader.readAsArrayBuffer(file);
            }
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('无法加载数据文件，请检查文件格式');
            this.hideLoading();
        }
    }
    
    // 数据清洗和转换
    processData(data) {
        if (!Array.isArray(data) || data.length === 0) return [];
        
        return data.map(item => {
            // 创建处理后的数据对象
            const processedItem = { ...item };
            
            // 处理数值字段
            processedItem['活动时数'] = this.parseNumber(item['活动时数']);
            processedItem['修正党时'] = this.parseNumber(item['修正党时']);
            processedItem['600题考试成绩'] = this.parseNumber(item['600题考试成绩']);
            processedItem['积极分子结业成绩'] = this.parseNumber(item['积极分子结业成绩']);
            processedItem['递交入党申请书年龄（岁）'] = this.parseNumber(item['递交入党申请书年龄（岁）']);
            
            // 处理日期字段
            processedItem['出生年月日'] = this.formatDate(item['出生年月日']);
            processedItem['入校时间'] = this.formatDate(item['入校时间']);
            processedItem['申请入党时间'] = this.formatDate(item['申请入党时间']);
            processedItem['600题考试时间'] = this.formatDate(item['600题考试时间']);
            processedItem['党支部接收入党积极分子时间'] = this.formatDate(item['党支部接收入党积极分子时间']);
            processedItem['入团时间'] = this.formatDate(item['入团时间']);
            
            // 计算状态
            processedItem['状态'] = this.calculateStatus(item);
            
            // 确保重要字段有默认值
            if (!processedItem['政治面貌'] || processedItem['政治面貌'].trim() === '') {
                processedItem['政治面貌'] = '群众';
            }
            
            if (!processedItem['入党流程阶段'] || processedItem['入党流程阶段'].trim() === '') {
                processedItem['入党流程阶段'] = '未开始';
            }
            
            // 处理班级信息
            if (!processedItem['班级'] || processedItem['班级'].trim() === '') {
                processedItem['班级'] = '未分配';
            }
            
            // 处理学号
            if (!processedItem['学号'] || processedItem['学号'].trim() === '') {
                processedItem['学号'] = '未知学号';
            }
            
            // 处理姓名
            if (!processedItem['姓名'] || processedItem['姓名'].trim() === '') {
                processedItem['姓名'] = '未知姓名';
            }
            
            return processedItem;
        });
    }
    
    // 计算状态
    calculateStatus(item) {
        const politicalStatus = item['政治面貌'] || '';
        const processStage = item['入党流程阶段'] || '';
        
        if (politicalStatus === '中共党员') return '正式党员';
        if (politicalStatus === '中共预备党员') return '预备党员';
        
        if (processStage.includes('积极分子')) return '积极分子';
        if (processStage.includes('申请人')) return '入党申请人';
        if (processStage.includes('通过600题')) return '600题通过';
        
        return '群众';
    }
    
    parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        
        // 如果是字符串，尝试解析
        if (typeof value === 'string') {
            // 移除可能的非数字字符
            const cleaned = value.replace(/[^\d.-]/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        }
        
        // 如果已经是数字，直接返回
        if (typeof value === 'number') return value;
        
        return 0;
    }
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        const str = dateStr.toString().trim();
        
        // 如果是8位数字格式（如20021204）
        if (str.length === 8 && /^\d{8}$/.test(str)) {
            return `${str.substr(0,4)}-${str.substr(4,2)}-${str.substr(6,2)}`;
        }
        
        // 如果是日期对象或已格式化的日期字符串
        try {
            const date = new Date(str);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (e) {
            // 如果解析失败，返回原始字符串
        }
        
        return str;
    }
    
    // UI初始化
    initUI() {
        // 更新时间显示
        this.updateTimeDisplay();
        
        // 初始化表格
        this.initTable();
        
        // 设置当前年份
        const currentYear = new Date().getFullYear();
        document.getElementById('current-year').textContent = `${currentYear}年数据`;
    }
    
    initEvents() {
        // 导航菜单
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                this.showSection(target);
            });
        });
        
        // 侧边栏切换
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });
        
        // 主题切换
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // 刷新按钮
        document.getElementById('refresh-btn').addEventListener('click', () => {
            if (this.allData.length > 0) {
                this.applyFilters();
                this.showNotification('数据已刷新', 'success');
            } else {
                this.showNotification('暂无数据可刷新，请先上传数据文件', 'warning');
            }
        });
        
        // 筛选器事件
        document.getElementById('class-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('political-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('process-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('sort-by')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input')?.addEventListener('input', () => this.applyFilters());
        
        // 分页事件
        document.getElementById('prev-page')?.addEventListener('click', () => this.prevPage());
        document.getElementById('next-page')?.addEventListener('click', () => this.nextPage());
        document.getElementById('first-page')?.addEventListener('click', () => this.goToPage(1));
        document.getElementById('last-page')?.addEventListener('click', () => this.goToPage(this.getTotalPages()));
        document.getElementById('page-size-select')?.addEventListener('change', () => this.changePageSize());
        
        // 数据管理页面的文件上传
        const dataFileInput = document.getElementById('file-input');
        const dataUploadArea = document.getElementById('file-upload-area');
        
        if (dataFileInput && dataUploadArea) {
            // 拖放功能
            dataUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dataUploadArea.classList.add('dragover');
            });
            
            dataUploadArea.addEventListener('dragleave', () => {
                dataUploadArea.classList.remove('dragover');
            });
            
            dataUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dataUploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files.length) {
                    dataFileInput.files = e.dataTransfer.files;
                    this.handleFileUpload({ target: { files: e.dataTransfer.files } });
                }
            });
            
            // 文件选择功能
            dataFileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }
        
        // 重置筛选按钮
        document.getElementById('reset-filters')?.addEventListener('click', () => this.resetFilters());
        
        // 清除搜索按钮
        document.getElementById('clear-search')?.addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            this.applyFilters();
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
        
        // 图表类型切换
        this.initChartControls();
    }
    
    // 图表初始化
    initCharts() {
        // 初始化所有图表容器
        this.initChart('political-chart', 'pie');
        this.initChart('process-chart', 'bar');
        this.initChart('class-chart', 'bar');
        this.initChart('activity-distribution-chart', 'bar');
        this.initChart('activity-trend-chart', 'line');
        this.initChart('class-activity-chart', 'pie');
        this.initChart('score-analysis-chart', 'histogram');
        this.initChart('correlation-analysis-chart', 'scatter');
        this.initChart('grade-analysis-chart', 'line');
        this.initChart('evolution-analysis-chart', 'line');
        this.initChart('process-flow', 'sankey');
        this.initChart('correlation-chart', 'heatmap');
    }
    
    initChart(chartId, type) {
        const chartDom = document.getElementById(chartId);
        if (!chartDom) return;
        
        this.charts[chartId] = echarts.init(chartDom);
        
        // 设置默认空状态
        this.setEmptyChart(chartId);
    }
    
    // 初始化图表控制
    initChartControls() {
        // 政治面貌图表切换
        document.querySelectorAll('[data-chart="pie"], [data-chart="bar"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.updatePoliticalChart(chartType);
                
                // 更新按钮状态
                document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // 入党流程图表切换
        document.querySelectorAll('[data-chart="progress"], [data-chart="funnel"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.updateProcessChart(chartType);
                
                // 更新按钮状态
                document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // 班级图表类型选择
        document.getElementById('class-chart-type')?.addEventListener('change', (e) => {
            this.updateClassChart(e.target.value);
        });
    }
    
    // 页面切换
    showSection(sectionId) {
        // 更新导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + sectionId) {
                item.classList.add('active');
            }
        });
        
        // 切换内容
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // 更新当前页面内容
            this.updateCurrentSection();
            
            // 重置图表大小
            setTimeout(() => {
                this.resizeCharts();
            }, 100);
        }
    }
    
    updateCurrentSection() {
        if (!this.hasData || this.allData.length === 0) {
            // 如果没有数据，显示空状态
            this.updateEmptyState();
            return;
        }
        
        switch(this.currentSection) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'members':
                this.updateMemberTable();
                break;
            case 'process':
                this.updateProcessView();
                break;
            case 'activities':
                this.updateActivityView();
                break;
            case 'analysis':
                this.updateAnalysisView();
                break;
            case 'data':
                this.updateDataView();
                break;
        }
    }
    
    updateEmptyState() {
        // 更新统计卡片为0
        document.getElementById('total-count').textContent = '0';
        document.getElementById('party-member-count').textContent = '0';
        document.getElementById('activist-count').textContent = '0';
        document.getElementById('avg-hours').textContent = '0';
        
        // 隐藏趋势箭头
        document.querySelectorAll('.stat-trend').forEach(trend => {
            trend.style.visibility = 'hidden';
        });
        
        // 设置空图表
        Object.keys(this.charts).forEach(chartId => {
            this.setEmptyChart(chartId);
        });
    }
    
    setEmptyChart(chartId) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        chart.setOption({
            title: {
                text: '暂无数据',
                left: 'center',
                top: 'center',
                textStyle: {
                    color: 'var(--text-disabled)',
                    fontSize: 18,
                    fontWeight: 'normal'
                }
            },
            graphic: {
                type: 'text',
                left: 'center',
                top: '60%',
                style: {
                    text: '请先上传数据文件',
                    fill: 'var(--text-disabled)',
                    fontSize: 14
                }
            }
        });
    }
    
    // 仪表盘更新
    updateDashboard() {
        if (!this.hasData || this.allData.length === 0) {
            this.updateEmptyState();
            return;
        }
        
        // 更新统计卡片
        this.updateStats();
        
        // 更新图表数据
        this.updateCharts();
    }
    
    updateStats() {
        const data = this.filteredData;
        
        // 总人数
        document.getElementById('total-count').textContent = data.length.toLocaleString();
        
        // 党员数（中共党员 + 中共预备党员）
        const partyMembers = data.filter(item => {
            const status = item['政治面貌'] || '';
            return status.includes('党员');
        }).length;
        document.getElementById('party-member-count').textContent = partyMembers.toLocaleString();
        
        // 积极分子数
        const activists = data.filter(item => {
            const process = item['入党流程阶段'] || '';
            const status = item['状态'] || '';
            return process.includes('积极分子') || status.includes('积极分子');
        }).length;
        document.getElementById('activist-count').textContent = activists.toLocaleString();
        
        // 平均活动时数
        const validHoursData = data.filter(item => item['活动时数'] > 0);
        const avgHours = validHoursData.length > 0 ? 
            (validHoursData.reduce((sum, item) => sum + (item['活动时数'] || 0), 0) / validHoursData.length).toFixed(1) : 
            0;
        document.getElementById('avg-hours').textContent = avgHours;
        
        // 显示趋势箭头（这里可以添加与上次数据的比较逻辑）
        document.querySelectorAll('.stat-trend').forEach(trend => {
            trend.style.visibility = 'visible';
            // 暂时设置为0%
            trend.innerHTML = '<i class="fas fa-arrow-up"></i> 0%';
        });
    }
    
    updateCharts() {
        if (!this.hasData || this.allData.length === 0) return;
        
        // 更新所有图表
        this.updatePoliticalChart('pie');
        this.updateProcessChart('bar');
        this.updateClassChart('bar');
    }
    
    updatePoliticalChart(type = 'pie') {
        const chart = this.charts['political-chart'];
        if (!chart) return;
        
        const data = this.filteredData;
        const distribution = {};
        
        // 统计政治面貌分布
        data.forEach(item => {
            const status = item['政治面貌'] || '未知';
            distribution[status] = (distribution[status] || 0) + 1;
        });
        
        // 转换为图表数据格式
        const chartData = Object.entries(distribution).map(([name, value]) => ({
            name,
            value,
            itemStyle: {
                color: this.getStatusColor(name)
            }
        }));
        
        // 按数量排序
        chartData.sort((a, b) => b.value - a.value);
        
        const colors = chartData.map(item => item.itemStyle.color);
        const names = chartData.map(item => item.name);
        const values = chartData.map(item => item.value);
        
        if (type === 'pie') {
            // 饼图配置
            chart.setOption({
                title: {
                    text: '政治面貌分布',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c}人 ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'center',
                    textStyle: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: [{
                    name: '政治面貌',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: chartData,
                    color: colors
                }]
            });
        } else {
            // 柱状图配置
            chart.setOption({
                title: {
                    text: '政治面貌分布',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: names,
                    axisLabel: {
                        color: 'var(--text-secondary)',
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: [{
                    name: '人数',
                    type: 'bar',
                    data: values.map((value, index) => ({
                        value,
                        itemStyle: {
                            color: colors[index]
                        }
                    })),
                    barWidth: '60%',
                    label: {
                        show: true,
                        position: 'top'
                    }
                }]
            });
        }
    }
    
    updateProcessChart(type = 'bar') {
        const chart = this.charts['process-chart'];
        if (!chart) return;
        
        const data = this.filteredData;
        const processData = {
            '未开始': 0,
            '入党申请人': 0,
            '入党积极分子': 0,
            '积极分子培训结业': 0,
            '通过600题': 0
        };
        
        // 统计入党流程阶段分布
        data.forEach(item => {
            const process = item['入党流程阶段'] || '未开始';
            let matched = false;
            
            for (const key in processData) {
                if (process.includes(key)) {
                    processData[key]++;
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                processData['未开始']++;
            }
        });
        
        const xData = Object.keys(processData);
        const yData = Object.values(processData);
        const colors = xData.map(key => this.getProcessColor(key));
        
        if (type === 'bar') {
            // 柱状图配置
            chart.setOption({
                title: {
                    text: '入党流程阶段分布',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: '{b}: {c}人'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    axisLabel: {
                        color: 'var(--text-secondary)',
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: [{
                    name: '人数',
                    type: 'bar',
                    data: yData.map((value, index) => ({
                        value,
                        itemStyle: {
                            color: colors[index]
                        }
                    })),
                    barWidth: '60%',
                    label: {
                        show: true,
                        position: 'top'
                    }
                }]
            });
        } else if (type === 'funnel') {
            // 漏斗图配置
            const funnelData = xData.map((name, index) => ({
                name,
                value: yData[index],
                itemStyle: {
                    color: colors[index]
                }
            })).filter(item => item.value > 0);
            
            chart.setOption({
                title: {
                    text: '入党流程阶段分布（漏斗图）',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c}人'
                },
                legend: {
                    bottom: 10,
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: [{
                    name: '入党流程',
                    type: 'funnel',
                    left: '10%',
                    top: 60,
                    bottom: 60,
                    width: '80%',
                    min: 0,
                    max: Math.max(...yData),
                    minSize: '0%',
                    maxSize: '100%',
                    sort: 'descending',
                    gap: 2,
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    labelLine: {
                        length: 10,
                        lineStyle: {
                            width: 1,
                            type: 'solid'
                        }
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    emphasis: {
                        label: {
                            fontSize: 20
                        }
                    },
                    data: funnelData
                }]
            });
        }
    }
    
    updateClassChart(type = 'bar') {
        const chart = this.charts['class-chart'];
        if (!chart) return;
        
        const data = this.filteredData;
        const classData = {};
        
        // 统计各班级人数
        data.forEach(item => {
            const className = item['班级'] || '未知班级';
            classData[className] = (classData[className] || 0) + 1;
        });
        
        // 转换为数组并排序
        const sortedClasses = Object.entries(classData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15); // 最多显示15个班级
        
        const xData = sortedClasses.map(([name]) => name);
        const yData = sortedClasses.map(([, value]) => value);
        
        if (type === 'bar') {
            // 柱状图配置
            chart.setOption({
                title: {
                    text: '各班级人数分布',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: '{b}: {c}人'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    axisLabel: {
                        color: 'var(--text-secondary)',
                        rotate: 45,
                        fontSize: 12
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: [{
                    name: '人数',
                    type: 'bar',
                    data: yData,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#d32f2f' },
                            { offset: 1, color: '#ff6659' }
                        ])
                    },
                    barWidth: '60%',
                    label: {
                        show: true,
                        position: 'top',
                        fontSize: 12
                    }
                }]
            });
        } else if (type === 'line') {
            // 折线图配置
            chart.setOption({
                title: {
                    text: '各班级人数分布',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}: {c}人'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    axisLabel: {
                        color: 'var(--text-secondary)',
                        rotate: 45,
                        fontSize: 12
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: [{
                    name: '人数',
                    type: 'line',
                    data: yData,
                    itemStyle: {
                        color: '#d32f2f'
                    },
                    lineStyle: {
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8,
                    label: {
                        show: true,
                        position: 'top',
                        fontSize: 12
                    }
                }]
            });
        } else if (type === 'stack') {
            // 堆叠图配置（按政治面貌）
            const politicalStatuses = ['中共党员', '中共预备党员', '共青团员', '群众'];
            const seriesData = politicalStatuses.map(status => {
                const statusData = {};
                xData.forEach(className => {
                    statusData[className] = 0;
                });
                
                data.forEach(item => {
                    const className = item['班级'] || '未知班级';
                    const itemStatus = item['政治面貌'] || '群众';
                    if (itemStatus === status && xData.includes(className)) {
                        statusData[className] = (statusData[className] || 0) + 1;
                    }
                });
                
                return {
                    name: status,
                    type: 'bar',
                    stack: 'total',
                    data: xData.map(className => statusData[className]),
                    itemStyle: {
                        color: this.getStatusColor(status)
                    }
                };
            });
            
            chart.setOption({
                title: {
                    text: '各班级政治面貌分布',
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-primary)',
                        fontSize: 16
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    bottom: 10,
                    left: 'center',
                    textStyle: {
                        color: 'var(--text-secondary)'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    axisLabel: {
                        color: 'var(--text-secondary)',
                        rotate: 45,
                        fontSize: 12
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: 'var(--text-secondary)'
                    }
                },
                series: seriesData
            });
        }
    }
    
    // 表格更新
    updateMemberTable() {
        const tableBody = document.getElementById('member-table-body');
        if (!tableBody) return;
        
        if (!this.hasData || this.filteredData.length === 0) {
            document.getElementById('empty-state').style.display = 'flex';
            tableBody.innerHTML = '';
            this.updatePagination();
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredData.length);
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        let html = '';
        
        pageData.forEach((item, index) => {
            const rowNumber = startIndex + index + 1;
            const activityHours = item['活动时数'] || 0;
            const progressWidth = Math.min(activityHours, 100);
            
            html += `
            <tr>
                <td>
                    <div class="table-cell">
                        <span>${this.escapeHtml(item['姓名'] || '--')}</span>
                    </div>
                </td>
                <td>${this.escapeHtml(item['学号'] || '--')}</td>
                <td>${this.escapeHtml(item['班级'] || '--')}</td>
                <td>
                    <span class="status-badge status-${this.getStatusClass(item['政治面貌'])}">
                        ${this.escapeHtml(item['政治面貌'] || '--')}
                    </span>
                </td>
                <td>${this.escapeHtml(item['入党流程阶段'] || '--')}</td>
                <td>
                    <div class="progress-cell">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressWidth}%"></div>
                        </div>
                        <span>${activityHours}</span>
                    </div>
                </td>
                <td>${this.escapeHtml(item['申请入党时间'] || '--')}</td>
                <td>
                    <span class="status-badge status-${this.getStatusClass(item['状态'])}">
                        ${this.escapeHtml(item['状态'])}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="system.showDetail('${item['学号']}')" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="system.editMember('${item['学号']}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
            `;
        });
        
        document.getElementById('empty-state').style.display = 'none';
        tableBody.innerHTML = html;
        
        // 更新分页信息
        this.updatePagination();
    }
    
    updatePagination() {
        const totalPages = this.getTotalPages();
        
        document.getElementById('current-page').textContent = this.currentPage;
        document.getElementById('total-pages').textContent = totalPages;
        
        const start = this.filteredData.length > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
        const end = Math.min(start + this.pageSize - 1, this.filteredData.length);
        
        document.getElementById('page-start').textContent = start;
        document.getElementById('page-end').textContent = end;
        document.getElementById('total-records').textContent = this.filteredData.length;
        
        // 更新按钮状态
        const firstPageBtn = document.getElementById('first-page');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const lastPageBtn = document.getElementById('last-page');
        
        if (firstPageBtn) firstPageBtn.disabled = this.currentPage <= 1 || this.filteredData.length === 0;
        if (prevPageBtn) prevPageBtn.disabled = this.currentPage <= 1 || this.filteredData.length === 0;
        if (nextPageBtn) nextPageBtn.disabled = this.currentPage >= totalPages || this.filteredData.length === 0;
        if (lastPageBtn) lastPageBtn.disabled = this.currentPage >= totalPages || this.filteredData.length === 0;
    }
    
    getTotalPages() {
        return this.filteredData.length > 0 ? Math.max(1, Math.ceil(this.filteredData.length / this.pageSize)) : 1;
    }
    
    // 筛选功能
    applyFilters() {
        if (!this.hasData || this.allData.length === 0) {
            this.filteredData = [];
            this.updateMemberTable();
            return;
        }
        
        this.filteredData = [...this.allData];
        
        // 获取筛选条件
        const classFilter = document.getElementById('class-filter')?.value;
        const politicalFilter = document.getElementById('political-filter')?.value;
        const processFilter = document.getElementById('process-filter')?.value;
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase();
        const sortBy = document.getElementById('sort-by')?.value;
        
        // 应用筛选
        if (classFilter && classFilter !== '') {
            this.filteredData = this.filteredData.filter(item => item['班级'] === classFilter);
        }
        
        if (politicalFilter && politicalFilter !== '') {
            this.filteredData = this.filteredData.filter(item => item['政治面貌'] === politicalFilter);
        }
        
        if (processFilter && processFilter !== '') {
            this.filteredData = this.filteredData.filter(item => 
                item['入党流程阶段'] && item['入党流程阶段'].includes(processFilter)
            );
        }
        
        if (searchTerm) {
            this.filteredData = this.filteredData.filter(item => 
                (item['姓名'] && item['姓名'].toLowerCase().includes(searchTerm)) ||
                (item['学号'] && item['学号'].toLowerCase().includes(searchTerm)) ||
                (item['班级'] && item['班级'].toLowerCase().includes(searchTerm))
            );
        }
        
        // 应用排序
        if (sortBy) {
            this.filteredData.sort((a, b) => {
                switch(sortBy) {
                    case 'name':
                        return (a['姓名'] || '').localeCompare(b['姓名'] || '');
                    case 'id':
                        return (a['学号'] || '').localeCompare(b['学号'] || '');
                    case 'hours':
                        return (b['活动时数'] || 0) - (a['活动时数'] || 0);
                    case 'date':
                        const dateA = new Date(a['申请入党时间'] || 0);
                        const dateB = new Date(b['申请入党时间'] || 0);
                        return dateB - dateA;
                    default:
                        return 0;
                }
            });
        }
        
        // 重置到第一页
        this.currentPage = 1;
        
        // 更新当前页面
        this.updateCurrentSection();
    }
    
    // 重置筛选
    resetFilters() {
        document.getElementById('class-filter').value = '';
        document.getElementById('political-filter').value = '';
        document.getElementById('process-filter').value = '';
        document.getElementById('sort-by').value = 'name';
        document.getElementById('search-input').value = '';
        
        this.applyFilters();
    }
    
    // 分页功能
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateMemberTable();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
            this.updateMemberTable();
        }
    }
    
    goToPage(page) {
        if (page >= 1 && page <= this.getTotalPages()) {
            this.currentPage = page;
            this.updateMemberTable();
        }
    }
    
    changePageSize() {
        const select = document.getElementById('page-size-select');
        this.pageSize = parseInt(select.value);
        this.currentPage = 1;
        this.updateMemberTable();
    }
    
    // 初始化班级筛选器选项
    updateClassFilterOptions() {
        const classFilter = document.getElementById('class-filter');
        if (!classFilter) return;
        
        // 清空现有选项
        classFilter.innerHTML = '<option value="">班级（全部）</option>';
        
        if (!this.hasData || this.allData.length === 0) return;
        
        // 获取所有不重复的班级并排序
        const classes = [...new Set(this.allData.map(item => item['班级']).filter(Boolean))].sort();
        
        // 添加班级选项
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    }
    
    // 数据导出
    exportData() {
        if (!this.hasData || this.allData.length === 0) {
            this.showNotification('暂无数据可导出，请先上传数据文件', 'warning');
            return;
        }
        
        try {
            const worksheet = XLSX.utils.json_to_sheet(this.allData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "党建数据");
            
            const date = new Date();
            const filename = `党建数据_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}.xlsx`;
            
            XLSX.writeFile(workbook, filename);
            this.showNotification('数据导出成功', 'success');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showNotification('导出数据失败，请重试', 'error');
        }
    }
    
    // 下载示例文件
    downloadSample() {
        // 创建示例数据
        const sampleData = [
            {
                '姓名': '张三',
                '学号': '20210001',
                '班级': '大数据2201',
                '政治面貌': '中共党员',
                '入党流程阶段': '通过600题',
                '活动时数': 120,
                '修正党时': -50,
                '出生年月日': '20001204',
                '入校时间': '20220903',
                '申请入党时间': '20220905',
                '递交入党申请书年龄（岁）': 19,
                '600题考试成绩': 95,
                '600题考试时间': '20250319',
                '党支部接收入党积极分子时间': '20230428',
                '积极分子结业成绩': 88,
                '备注': ''
            },
            {
                '姓名': '李四',
                '学号': '20210002',
                '班级': '大数据2201',
                '政治面貌': '中共预备党员',
                '入党流程阶段': '积极分子培训结业',
                '活动时数': 85,
                '修正党时': -30,
                '出生年月日': '20010812',
                '入校时间': '20220903',
                '申请入党时间': '20220910',
                '递交入党申请书年龄（岁）': 20,
                '600题考试成绩': 0,
                '600题考试时间': '',
                '党支部接收入党积极分子时间': '20230428',
                '积极分子结业成绩': 92,
                '备注': ''
            },
            {
                '姓名': '王五',
                '学号': '20210003',
                '班级': '大数据2202',
                '政治面貌': '共青团员',
                '入党流程阶段': '入党积极分子',
                '活动时数': 65,
                '修正党时': -20,
                '出生年月日': '20020305',
                '入校时间': '20220903',
                '申请入党时间': '20230120',
                '递交入党申请书年龄（岁）': 20,
                '600题考试成绩': 0,
                '600题考试时间': '',
                '党支部接收入党积极分子时间': '20230428',
                '积极分子结业成绩': 0,
                '备注': ''
            }
        ];
        
        try {
            const worksheet = XLSX.utils.json_to_sheet(sampleData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "党建数据示例");
            
            XLSX.writeFile(workbook, "党建数据示例文件.xlsx");
            this.showNotification('示例文件下载成功', 'success');
        } catch (error) {
            console.error('下载示例文件失败:', error);
            this.showNotification('下载示例文件失败', 'error');
        }
    }
    
    // 工具函数
    getStatusColor(status) {
        switch(status) {
            case '中共党员': return '#d32f2f';
            case '中共预备党员': return '#ff9800';
            case '共青团员': return '#2196f3';
            case '群众': return '#4caf50';
            default: return '#9e9e9e';
        }
    }
    
    getProcessColor(process) {
        switch(process) {
            case '入党申请人': return '#4caf50';
            case '入党积极分子': return '#2196f3';
            case '积极分子培训结业': return '#ff9800';
            case '通过600题': return '#9c27b0';
            case '未开始': return '#9e9e9e';
            default: return '#607d8b';
        }
    }
    
    getStatusClass(status) {
        if (!status) return '';
        
        const statusStr = status.toString().toLowerCase();
        if (statusStr.includes('党员')) return 'party';
        if (statusStr.includes('预备')) return 'probationary';
        if (statusStr.includes('积极分子')) return 'activist';
        if (statusStr.includes('申请人')) return 'applicant';
        if (statusStr.includes('群众')) return 'mass';
        return '';
    }
    
    escapeHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // UI辅助函数
    showLoading(message = '加载中...') {
        let loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <p>${message}</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.querySelector('p').textContent = message;
            loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // 自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    updateTimeDisplay() {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const updateTimeElement = document.getElementById('update-time');
        const lastUpdateTimeElement = document.getElementById('last-update-time');
        
        if (updateTimeElement) updateTimeElement.textContent = timeStr;
        if (lastUpdateTimeElement) lastUpdateTimeElement.textContent = timeStr;
    }
    
    updateDataStatus() {
        const dataStatusElement = document.getElementById('data-status');
        const dataCountElement = document.getElementById('data-count');
        
        if (this.hasData && this.allData.length > 0) {
            if (dataStatusElement) {
                dataStatusElement.textContent = '已就绪';
                dataStatusElement.className = 'info-value status-ready';
            }
            if (dataCountElement) {
                dataCountElement.textContent = this.allData.length.toLocaleString();
            }
        } else {
            if (dataStatusElement) {
                dataStatusElement.textContent = '待上传';
                dataStatusElement.className = 'info-value status-empty';
            }
            if (dataCountElement) {
                dataCountElement.textContent = '0';
            }
        }
    }
    
    updateDataStats() {
        const data = this.allData;
        
        // 更新数据总量
        document.getElementById('data-total').textContent = data.length.toLocaleString();
        
        // 更新字段数量
        const columns = data.length > 0 ? Object.keys(data[0]).length : 0;
        document.getElementById('data-columns').textContent = columns;
        
        // 计算数据完整率（姓名、学号、班级都有的记录）
        let completeness = 0;
        if (data.length > 0) {
            const completeRecords = data.filter(item => {
                return item['姓名'] && item['姓名'].trim() !== '' && 
                       item['学号'] && item['学号'].trim() !== '' && 
                       item['班级'] && item['班级'].trim() !== '';
            }).length;
            completeness = Math.round((completeRecords / data.length) * 100);
        }
        
        document.getElementById('data-completeness').textContent = completeness + '%';
        
        // 更新数据状态
        this.updateDataStatus();
    }
    
    addLog(action, message) {
        const logList = document.getElementById('log-list');
        if (!logList) return;
        
        const now = new Date();
        const timeAgo = this.getTimeAgo(now);
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.innerHTML = `
            <div class="log-icon">
                <i class="fas fa-${action.includes('导入') ? 'file-import' : action.includes('导出') ? 'file-export' : 'info-circle'}"></i>
            </div>
            <div class="log-content">
                <h4>${action}</h4>
                <p>${message}</p>
            </div>
            <div class="log-time">${timeAgo}</div>
        `;
        
        logList.insertBefore(logItem, logList.firstChild);
        
        // 限制日志数量
        while (logList.children.length > 10) {
            logList.removeChild(logList.lastChild);
        }
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 30) return `${diffDays}天前`;
        return '1月前';
    }
    
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        
        // 更新图标
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // 保存主题偏好
        localStorage.setItem('theme', newTheme);
        
        // 重新渲染图表
        setTimeout(() => {
            this.resizeCharts();
        }, 100);
    }
    
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }
    
    handleResize() {
        this.resizeCharts();
    }
    
    // 初始化表格
    initTable() {
        this.updateMemberTable();
    }
    
    // 其他页面更新函数（简化为空状态处理）
    updateProcessView() {
        if (!this.hasData || this.allData.length === 0) {
            // 显示空状态
            document.getElementById('process-applicants').textContent = '0';
            document.getElementById('process-activists').textContent = '0';
            document.getElementById('process-candidates').textContent = '0';
            document.getElementById('process-probationary').textContent = '0';
            document.getElementById('process-formal').textContent = '0';
            
            for (let i = 1; i <= 5; i++) {
                const element = document.getElementById(`stage-${i}-count`);
                if (element) element.textContent = '0';
            }
            return;
        }
        
        // 实际数据处理代码...
    }
    
    updateActivityView() {
        if (!this.hasData || this.allData.length === 0) {
            // 显示空状态
            document.getElementById('total-activity-hours').textContent = '0';
            document.getElementById('avg-participation-rate').textContent = '0%';
            document.getElementById('activity-count').textContent = '0';
            document.getElementById('top-activist').textContent = '--';
            return;
        }
        
        // 实际数据处理代码...
    }
    
    updateAnalysisView() {
        if (!this.hasData || this.allData.length === 0) {
            // 显示空状态
            const tableBody = document.getElementById('analysis-table-body');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">暂无数据，请先上传数据文件</td></tr>';
            }
            return;
        }
        
        // 实际数据处理代码...
    }
    
    updateDataView() {
        // 数据管理页面总是显示
        this.updateDataStats();
    }
    
    // 成员详情
    showDetail(studentId) {
        if (!this.hasData || this.allData.length === 0) {
            this.showNotification('暂无数据，请先上传数据文件', 'warning');
            return;
        }
        
        const member = this.allData.find(item => item['学号'] === studentId);
        if (!member) {
            this.showNotification('未找到该成员信息', 'warning');
            return;
        }
        
        // 创建详情模态框
        this.createDetailModal(member);
    }
    
    createDetailModal(member) {
        // 创建模态框内容
        const modalContent = `
            <div class="modal-overlay" id="detail-modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-circle"></i> 成员详细信息</h3>
                        <button class="modal-close" onclick="system.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="member-detail">
                            <div class="detail-header">
                                <div class="member-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="member-info">
                                    <h2>${this.escapeHtml(member['姓名'])}</h2>
                                    <p class="member-id">学号: ${this.escapeHtml(member['学号'])}</p>
                                    <p class="member-class">班级: ${this.escapeHtml(member['班级'])}</p>
                                </div>
                                <div class="member-status">
                                    <span class="status-badge status-${this.getStatusClass(member['政治面貌'])}">
                                        ${this.escapeHtml(member['政治面貌'])}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="detail-grid">
                                <div class="detail-section">
                                    <h4><i class="fas fa-id-card"></i> 基本信息</h4>
                                    <div class="detail-item">
                                        <span class="detail-label">出生日期</span>
                                        <span class="detail-value">${this.escapeHtml(member['出生年月日'] || '--')}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">入校时间</span>
                                        <span class="detail-value">${this.escapeHtml(member['入校时间'] || '--')}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">入团时间</span>
                                        <span class="detail-value">${this.escapeHtml(member['入团时间'] || '--')}</span>
                                    </div>
                                </div>
                                
                                <div class="detail-section">
                                    <h4><i class="fas fa-flag"></i> 入党信息</h4>
                                    <div class="detail-item">
                                        <span class="detail-label">申请入党时间</span>
                                        <span class="detail-value">${this.escapeHtml(member['申请入党时间'] || '--')}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">入党流程阶段</span>
                                        <span class="detail-value">${this.escapeHtml(member['入党流程阶段'] || '--')}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">党支部接收时间</span>
                                        <span class="detail-value">${this.escapeHtml(member['党支部接收入党积极分子时间'] || '--')}</span>
                                    </div>
                                </div>
                                
                                <div class="detail-section">
                                    <h4><i class="fas fa-chart-line"></i> 活动与成绩</h4>
                                    <div class="detail-item">
                                        <span class="detail-label">活动时数</span>
                                        <span class="detail-value">${member['活动时数'] || 0}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">600题考试成绩</span>
                                        <span class="detail-value">${member['600题考试成绩'] || 0}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">积极分子结业成绩</span>
                                        <span class="detail-value">${member['积极分子结业成绩'] || 0}</span>
                                    </div>
                                </div>
                                
                                <div class="detail-section">
                                    <h4><i class="fas fa-sticky-note"></i> 备注信息</h4>
                                    <div class="detail-item full-width">
                                        <span class="detail-label">团员资料备注</span>
                                        <span class="detail-value">${this.escapeHtml(member['团员资料备注'] || '--')}</span>
                                    </div>
                                    <div class="detail-item full-width">
                                        <span class="detail-label">备注</span>
                                        <span class="detail-value">${this.escapeHtml(member['备注'] || '--')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="system.closeModal()">
                            <i class="fas fa-times"></i> 关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = modalContent;
        
        // 显示模态框
        document.getElementById('detail-modal').style.display = 'flex';
    }
    
    closeModal() {
        const modal = document.getElementById('detail-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }
    
    editMember(studentId) {
        if (!this.hasData || this.allData.length === 0) {
            this.showNotification('暂无数据，请先上传数据文件', 'warning');
            return;
        }
        
        // 编辑成员信息
        console.log('编辑成员:', studentId);
        this.showNotification('编辑功能开发中...', 'info');
    }
    
    // 其他功能占位方法
    showReminders() {
        this.showNotification('提醒功能开发中...', 'info');
    }
    
    addMember() {
        this.showNotification('添加党员功能开发中...', 'info');
    }
    
    addActivity() {
        this.showNotification('添加活动功能开发中...', 'info');
    }
    
    showProcessGuide() {
        this.showNotification('流程说明功能开发中...', 'info');
    }
    
    generateAnalysisReport() {
        if (!this.hasData || this.allData.length === 0) {
            this.showNotification('暂无数据可生成报告，请先上传数据文件', 'warning');
            return;
        }
        this.showNotification('生成报告功能开发中...', 'info');
    }
    
    backupData() {
        if (!this.hasData || this.allData.length === 0) {
            this.showNotification('暂无数据可备份，请先上传数据文件', 'warning');
            return;
        }
        this.showNotification('数据备份功能开发中...', 'info');
    }
    
    exportExcel() {
        this.exportData();
    }
    
    exportCSV() {
        if (!this.hasData || this.allData.length === 0) {
            this.showNotification('暂无数据可导出，请先上传数据文件', 'warning');
            return;
        }
        
        try {
            // 转换为CSV格式
            const headers = Object.keys(this.allData[0]);
            const csvContent = [
                headers.join(','),
                ...this.allData.map(row => 
                    headers.map(header => 
                        JSON.stringify(row[header] || '')
                    ).join(',')
                )
            ].join('\n');
            
            // 创建下载链接
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `党建数据_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('CSV导出成功', 'success');
        } catch (error) {
            console.error('导出CSV失败:', error);
            this.showNotification('导出CSV失败，请重试', 'error');
        }
    }
    
    exportPDF() {
        this.showNotification('PDF导出功能开发中...', 'info');
    }
    
    exportTable() {
        this.exportData();
    }
    
    printTable() {
        this.showNotification('打印功能开发中...', 'info');
    }
    
    toggleColumnVisibility() {
        this.showNotification('列设置功能开发中...', 'info');
    }
    
    cleanData() {
        this.showNotification('数据清理功能开发中...', 'info');
    }
    
    validateData() {
        this.showNotification('数据验证功能开发中...', 'info');
    }
    
    mergeData() {
        this.showNotification('数据合并功能开发中...', 'info');
    }
    
    checkDuplicates() {
        this.showNotification('查重检测功能开发中...', 'info');
    }
}

// 初始化系统
let system;

document.addEventListener('DOMContentLoaded', () => {
    system = new PartyBuildingSystem();
    
    // 恢复主题偏好
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 更新主题图标
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // 添加加载层样式
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
        }
        
        .loading-content {
            text-align: center;
        }
        
        .loading-spinner {
            margin-bottom: 20px;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #d32f2f;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .notification {
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            border-left: 4px solid #2196f3;
        }
        
        .notification-success {
            border-left-color: #4caf50;
        }
        
        .notification-error {
            border-left-color: #f44336;
        }
        
        .notification-warning {
            border-left-color: #ff9800;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
        }
    `;
    document.head.appendChild(style);
});

// 全局函数供HTML调用
function downloadSample() {
    system.downloadSample();
}