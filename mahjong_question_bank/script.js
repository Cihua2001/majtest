// 麻将策略题库管理系统 - JavaScript交互逻辑

class MahjongQuestionBank {
    constructor() {
        this.questions = [];
        this.filteredQuestions = [];
        this.currentIndex = 0;
        this.currentFilter = 'all';
        this.isAnswerVisible = false;
        
        // DOM元素
        this.elements = {
            questionImage: document.getElementById('question-image'),
            questionImagePlaceholder: document.getElementById('question-image-placeholder'),
            answerImage: document.getElementById('answer-image'),
            answerImagePlaceholder: document.getElementById('answer-image-placeholder'),
            questionType: document.getElementById('question-type'),
            questionUrl: document.getElementById('question-url'),
            originalLink: document.getElementById('original-link'),
            questionAnalyse: document.getElementById('question-analyse'),
            toggleAnswerBtn: document.getElementById('toggle-answer'),
            answerContent: document.getElementById('answer-content'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            currentIndex: document.getElementById('current-index'),
            totalQuestions: document.getElementById('total-questions'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            randomBtn: document.querySelector('.random-btn'),
            currentType: document.querySelector('.current-type')
        };
        
        this.init();
    }
    
    // 初始化应用
    async init() {
        await this.loadQuestions();
        
        if (this.questions.length === 0) {
            this.showNoQuestionsMessage();
            return;
        }
        
        this.setupEventListeners();
        this.updateUI();
    }
    
    // 加载题库数据
    async loadQuestions() {
        return new Promise((resolve) => {
            // 方法1：尝试使用fetch
            fetch('questions.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.handleLoadedData(data);
                    resolve();
                })
                .catch(fetchError => {
                    console.warn('Fetch失败，尝试XHR:', fetchError.message);
                    
                    // 方法2：尝试使用XMLHttpRequest（更好的本地文件支持）
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', 'questions.json', true);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200 || xhr.status === 0) {
                                try {
                                    const data = JSON.parse(xhr.responseText);
                                    this.handleLoadedData(data);
                                    resolve();
                                } catch (parseError) {
                                    console.error('数据解析失败:', parseError);
                                    this.handleLoadError();
                                    resolve();
                                }
                            } else {
                                this.handleLoadError();
                                resolve();
                            }
                        }
                    };
                    
                    xhr.timeout = 5000;
                    xhr.ontimeout = () => {
                        this.handleLoadError();
                        resolve();
                    };
                    
                    xhr.send();
                });
        });
    }
    
    // 处理加载成功的数据
    handleLoadedData(data) {
        if (!Array.isArray(data)) {
            console.error('数据不是数组格式');
            this.questions = [];
            this.filteredQuestions = [];
            return;
        }
        
        this.questions = data;
        this.filteredQuestions = [...this.questions];
    }
    
    // 处理加载失败
    handleLoadError() {
        console.error('题库数据加载失败');
        this.questions = [];
        this.filteredQuestions = [];
    }
    
    // 默认数据（后备）
    getDefaultQuestions() {
        return [
            {
                question_pic: "https://via.placeholder.com/800x400/3498db/ffffff?text=题目示例1",
                question_type: "听牌判断",
                question_urlori: "https://example.com/question1",
                question_answer: "https://via.placeholder.com/800x150/2ecc71/ffffff?text=答案示例1",
                question_analyse: "这是一道听牌判断题示例。请确保questions.json文件正确加载以查看真实题目。"
            },
            {
                question_pic: "https://via.placeholder.com/800x400/9b59b6/ffffff?text=题目示例2",
                question_type: "和牌选择",
                question_urlori: "https://example.com/question2",
                question_answer: "https://via.placeholder.com/800x150/e74c3c/ffffff?text=答案示例2",
                question_analyse: "这是一道和牌选择题示例。请确保questions.json文件正确加载以查看真实题目。"
            }
        ];
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 筛选按钮
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                if (type) {
                    this.filterQuestions(type);
                }
            });
        });
        
        // 随机抽题按钮
        this.elements.randomBtn.addEventListener('click', () => {
            this.selectRandomQuestion();
        });
        
        // 显示/隐藏答案按钮
        this.elements.toggleAnswerBtn.addEventListener('click', () => {
            this.toggleAnswer();
        });
        
        // 上一题/下一题按钮
        this.elements.prevBtn.addEventListener('click', () => {
            this.prevQuestion();
        });
        
        this.elements.nextBtn.addEventListener('click', () => {
            this.nextQuestion();
        });
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevQuestion();
            } else if (e.key === 'ArrowRight') {
                this.nextQuestion();
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.toggleAnswer();
            } else if (e.key === 'r' || e.key === 'R') {
                this.selectRandomQuestion();
            }
        });
    }
    
    // 筛选题目
    filterQuestions(type) {
        this.currentFilter = type;
        this.currentIndex = 0;
        this.isAnswerVisible = false;
        
        // 更新筛选按钮状态
        this.elements.filterButtons.forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 筛选题目
        if (type === 'all') {
            this.filteredQuestions = [...this.questions];
        } else {
            this.filteredQuestions = this.questions.filter(q => q.question_type === type);
        }
        
        // 更新当前类型显示
        const typeText = type === 'all' ? '全部题目' : type;
        this.elements.currentType.textContent = `当前类型：${typeText}`;
        
        // 更新UI
        this.updateUI();
        
        // 如果没有题目，显示提示
        if (this.filteredQuestions.length === 0) {
            this.showNoQuestionsMessage();
        }
    }
    
    // 随机抽题
    selectRandomQuestion() {
        if (this.filteredQuestions.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.filteredQuestions.length);
        this.currentIndex = randomIndex;
        this.isAnswerVisible = false;
        this.updateUI();
        
        // 显示随机抽题提示
        this.showNotification('已随机抽取一道题目');
    }
    
    // 切换答案显示
    toggleAnswer() {
        this.isAnswerVisible = !this.isAnswerVisible;
        
        if (this.isAnswerVisible) {
            this.elements.answerContent.classList.remove('hidden');
            this.elements.toggleAnswerBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏答案';
            this.elements.toggleAnswerBtn.classList.add('showing');
            
            // 确保解析内容是最新的
            if (this.filteredQuestions.length > 0) {
                const currentQuestion = this.filteredQuestions[this.currentIndex];
                this.elements.questionAnalyse.textContent = currentQuestion.question_analyse || '暂无解析内容';
            }
            
            // 加载答案图片
            this.loadAnswerImage();
        } else {
            this.elements.answerContent.classList.add('hidden');
            this.elements.toggleAnswerBtn.innerHTML = '<i class="fas fa-eye"></i> 显示答案';
            this.elements.toggleAnswerBtn.classList.remove('showing');
        }
    }
    
    // 上一题
    prevQuestion() {
        if (this.filteredQuestions.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.filteredQuestions.length) % this.filteredQuestions.length;
        this.isAnswerVisible = false;
        this.updateUI();
    }
    
    // 下一题
    nextQuestion() {
        if (this.filteredQuestions.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.filteredQuestions.length;
        this.isAnswerVisible = false;
        this.updateUI();
    }
    
    // 更新UI
    updateUI() {
        if (this.filteredQuestions.length === 0) {
            this.showNoQuestionsMessage();
            return;
        }
        
        const currentQuestion = this.filteredQuestions[this.currentIndex];
        
        // 更新题目信息
        this.elements.questionType.textContent = currentQuestion.question_type;
        this.elements.questionUrl.href = currentQuestion.question_urlori;
        this.elements.questionUrl.textContent = '点击查看';
        this.elements.originalLink.href = currentQuestion.question_urlori;
        this.elements.questionAnalyse.textContent = currentQuestion.question_analyse || '暂无解析内容';
        
        // 更新导航信息
        this.elements.currentIndex.textContent = this.currentIndex + 1;
        this.elements.totalQuestions.textContent = this.filteredQuestions.length;
        
        // 更新按钮状态
        this.elements.prevBtn.disabled = this.filteredQuestions.length <= 1;
        this.elements.nextBtn.disabled = this.filteredQuestions.length <= 1;
        
        // 加载题目图片
        this.loadQuestionImage();
        
        // 重置答案区域
        if (!this.isAnswerVisible) {
            this.elements.answerContent.classList.add('hidden');
            this.elements.toggleAnswerBtn.innerHTML = '<i class="fas fa-eye"></i> 显示答案';
            this.elements.toggleAnswerBtn.classList.remove('showing');
        } else {
            this.elements.answerContent.classList.remove('hidden');
            this.elements.toggleAnswerBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏答案';
            this.elements.toggleAnswerBtn.classList.add('showing');
            this.loadAnswerImage();
        }
        
        // 隐藏占位符，显示图片
        setTimeout(() => {
            this.elements.questionImage.style.display = 'block';
            this.elements.questionImagePlaceholder.style.display = 'none';
        }, 500);
    }
    
    // 加载题目图片
    loadQuestionImage() {
        const currentQuestion = this.filteredQuestions[this.currentIndex];
        
        // 显示加载占位符
        this.elements.questionImage.style.display = 'none';
        this.elements.questionImagePlaceholder.style.display = 'flex';
        
        // 预加载图片
        const img = new Image();
        const imageUrl = this.fixImagePath(currentQuestion.question_pic);
        
        // 设置超时处理
        const timeoutId = setTimeout(() => {
            console.warn('题目图片加载超时:', imageUrl);
            this.elements.questionImage.src = 'https://via.placeholder.com/800x400/95a5a6/ffffff?text=图片加载超时';
            this.elements.questionImage.alt = '图片加载超时';
            this.elements.questionImage.style.display = 'block';
            this.elements.questionImagePlaceholder.style.display = 'none';
        }, 5000); // 5秒超时
        
        img.onload = () => {
            clearTimeout(timeoutId);
            console.log('题目图片加载成功:', imageUrl);
            this.elements.questionImage.src = imageUrl;
            this.elements.questionImage.alt = `麻将策略题目 - ${currentQuestion.question_type}`;
            this.elements.questionImage.style.display = 'block';
            this.elements.questionImagePlaceholder.style.display = 'none';
        };
        img.onerror = (e) => {
            clearTimeout(timeoutId);
            console.error('题目图片加载失败:', imageUrl, e);
            this.elements.questionImage.src = 'https://via.placeholder.com/800x400/95a5a6/ffffff?text=图片加载失败';
            this.elements.questionImage.alt = '图片加载失败';
            this.elements.questionImage.style.display = 'block';
            this.elements.questionImagePlaceholder.style.display = 'none';
        };
        console.log('开始加载题目图片:', imageUrl);
        img.src = imageUrl;
    }
    
    // 修复图片路径
    fixImagePath(path) {
        // 如果路径已经是完整URL，直接返回
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        
        // 处理相对路径
        let fixedPath = path;
        
        // 如果路径以./开头，去掉./
        if (fixedPath.startsWith('./')) {
            fixedPath = fixedPath.substring(2);
        }
        
        // 如果路径没有以/开头，添加/
        if (!fixedPath.startsWith('/')) {
            fixedPath = '/' + fixedPath;
        }
        
        // 确保路径相对于当前页面
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        return baseUrl + fixedPath;
    }
    
    // 加载答案图片
    loadAnswerImage() {
        const currentQuestion = this.filteredQuestions[this.currentIndex];
        
        // 显示加载占位符
        this.elements.answerImage.style.display = 'none';
        this.elements.answerImagePlaceholder.style.display = 'flex';
        
        // 预加载图片
        const img = new Image();
        const imageUrl = this.fixImagePath(currentQuestion.question_answer);
        
        // 设置超时处理
        const timeoutId = setTimeout(() => {
            console.warn('答案图片加载超时:', imageUrl);
            this.elements.answerImage.src = 'https://via.placeholder.com/800x150/95a5a6/ffffff?text=答案图片加载超时';
            this.elements.answerImage.alt = '答案图片加载超时';
            this.elements.answerImage.style.display = 'block';
            this.elements.answerImagePlaceholder.style.display = 'none';
        }, 5000); // 5秒超时
        
        img.onload = () => {
            clearTimeout(timeoutId);
            console.log('答案图片加载成功:', imageUrl);
            this.elements.answerImage.src = imageUrl;
            this.elements.answerImage.alt = `题目答案 - ${currentQuestion.question_type}`;
            this.elements.answerImage.style.display = 'block';
            this.elements.answerImagePlaceholder.style.display = 'none';
        };
        img.onerror = (e) => {
            clearTimeout(timeoutId);
            console.error('答案图片加载失败:', imageUrl, e);
            this.elements.answerImage.src = 'https://via.placeholder.com/800x150/95a5a6/ffffff?text=答案图片加载失败';
            this.elements.answerImage.alt = '答案图片加载失败';
            this.elements.answerImage.style.display = 'block';
            this.elements.answerImagePlaceholder.style.display = 'none';
        };
        console.log('开始加载答案图片:', imageUrl);
        img.src = imageUrl;
    }
    
    // 显示无题目消息
    showNoQuestionsMessage() {
        this.elements.questionImage.style.display = 'none';
        this.elements.questionImagePlaceholder.innerHTML = `
            <i class="fas fa-inbox"></i>
            <p>当前筛选条件下暂无题目</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">请尝试选择其他类型或使用"全部题目"</p>
        `;
        this.elements.questionImagePlaceholder.style.display = 'flex';
        
        this.elements.questionType.textContent = '暂无';
        this.elements.questionUrl.href = '#';
        this.elements.questionUrl.textContent = '暂无';
        this.elements.originalLink.href = '#';
        this.elements.questionAnalyse.textContent = '当前筛选条件下暂无题目，请尝试选择其他题目类型。';
        
        this.elements.currentIndex.textContent = '0';
        this.elements.totalQuestions.textContent = '0';
        
        this.elements.prevBtn.disabled = true;
        this.elements.nextBtn.disabled = true;
        this.elements.toggleAnswerBtn.disabled = true;
    }
    
    // 显示通知
    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        `;
        
        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // 3秒后移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }
    
    // 获取当前题目
    getCurrentQuestion() {
        return this.filteredQuestions[this.currentIndex];
    }
    
    // 获取题目总数
    getTotalQuestions() {
        return this.filteredQuestions.length;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new MahjongQuestionBank();
    
    // 将应用实例附加到window对象，方便调试
    window.mahjongApp = app;
    
    // 显示欢迎提示
    setTimeout(() => {
        app.showNotification('麻将策略题库管理系统已加载完成！');
    }, 1000);
});

// 键盘快捷键提示
console.log(`
=== 麻将策略题库管理系统快捷键 ===
← 左箭头: 上一题
→ 右箭头: 下一题
空格/回车: 显示/隐藏答案
R: 随机抽题
=======================
`);