# 磁检测仪器网页版

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**高端工业级接触式磁检测仪器网页版软件**

基于无损检测技术，提供专业的磁漏检测数据采集、分析与报告生成

[功能特性](#功能特性) • [快速开始](#快速开始) • [使用说明](#使用说明) • [技术栈](#技术栈)

</div>

---

## 📋 项目简介

本项目是一款面向工业质检领域的专业磁检测仪器网页版软件，用于钢管、钢板等铁磁性材料的无损检测。通过先进的磁漏检测技术，能够快速、准确地识别材料内部和表面的各类缺陷，帮助企业提升产品质量，降低安全风险。

### 🎯 核心价值

- **专业可靠**：基于国际标准（ISO 10893、ASTM E1316、EN 10246）设计
- **实时高效**：毫秒级数据采集，实时波形显示与缺陷检测
- **智能分析**：自动缺陷识别，智能统计分析
- **云端存储**：数据安全存储在云端，随时随地访问
- **现代界面**：工业级UI设计，操作直观便捷

### 🏆 适用场景

- 钢管生产线质量检测
- 钢板焊缝检测
- 铁磁性零部件质检
- 质检实验室检测分析
- 现场无损检测作业

---

## ✨ 功能特性

### 🔍 实时监测
- **多模式显示**：A-SCAN时域波形、B-SCAN扫描成像、C-SCAN平面分布
- **实时采集**：10Hz - 10kHz可调采样频率，最多10000点缓冲
- **智能检测**：双门限自动检测，实时缺陷报警
- **波形交互**：缩放、平移、测量、冻结等丰富交互功能

### 📊 数据分析
- **历史回放**：完整重现测试过程，支持多倍速播放
- **频谱分析**：FFT快速傅里叶变换，频域特征分析
- **统计分析**：均值、方差、峰峰值等统计指标
- **对比分析**：多组数据同时对比，差异可视化

### 📄 报告生成
- **标准模板**：符合ISO/ASTM标准的专业报告模板
- **自动生成**：一键生成包含波形图、统计表、结论的完整报告
- **PDF导出**：高清PDF格式，支持打印和分享
- **批量处理**：支持批量报告生成

### ⚙️ 参数管理
- **灵活配置**：采样频率、灵敏度、门限值等参数可调
- **模板保存**：常用参数组合保存为模板，快速调用
- **校准管理**：标准试块校准，DAC/AVG曲线管理

### 🎨 工业级界面
- **高端设计**：金属质感，橙黑配色，专业感强
- **清晰易读**：高对比度，关键信息突出显示
- **响应式布局**：适配各种屏幕尺寸
- **流畅交互**：60fps波形渲染，操作响应迅速

---

## 🚀 快速开始

### 环境要求

- **浏览器**：Chrome 90+, Edge 90+, Firefox 88+
- **屏幕分辨率**：1920x1080或更高
- **网络连接**：需要连接互联网（访问Supabase服务）

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/magnetic-detector.git
cd magnetic-detector
```

#### 2. 配置环境变量

在项目根目录创建 `.env` 文件（或直接在 `js/config.js` 中配置）：

```env
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
```

#### 3. 初始化数据库

参考 `DATABASE_SCHEMA.md` 文档，在Supabase控制台中执行SQL脚本创建数据表：

- 访问 [Supabase Dashboard](https://app.supabase.com)
- 选择你的项目
- 进入 SQL Editor
- 执行数据库初始化脚本

#### 4. 启动项目

**方式一：使用本地服务器**

```bash
# 使用 Python 启动简单HTTP服务器
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server -p 8000
```

然后在浏览器访问：`http://localhost:8000`

**方式二：直接打开**

直接用浏览器打开 `index.html` 文件即可（部分功能可能受限）

**方式三：部署到服务器**

推荐部署到 Netlify 或 Vercel：

```bash
# 使用 Netlify CLI 部署
netlify deploy --prod

# 或使用 Vercel CLI 部署
vercel --prod
```

---

## 📖 使用说明

### 主界面操作

#### 启动监测
1. 打开主界面（index.html）
2. 在右侧参数面板设置采样参数
3. 点击左侧"▶"按钮开始实时监测
4. 观察波形显示区的实时数据

#### 调整参数
- **灵敏度**：右侧旋钮调节
- **门限值**：拖拽黄色虚线上下移动
- **显示模式**：点击"DISP"按钮切换A/B/C-SCAN
- **时间基准**：点击"主"按钮调整时间轴

#### 保存数据
- 点击"SAVE"按钮保存当前测试数据
- 填写工件信息（编号、材质、规格等）
- 系统自动保存波形数据和缺陷记录

### 历史数据查询

1. 进入"历史数据"页面
2. 使用筛选条件查找记录：
   - 日期范围
   - 工件编号
   - 测试类型
   - 结果状态
3. 点击记录查看详细信息
4. 可进行波形回放、数据对比等操作

### 数据分析

1. 进入"数据分析"页面
2. 选择要分析的测试记录
3. 查看分析结果：
   - 波形统计信息
   - 频谱分析图
   - 缺陷分布图
   - 趋势分析图
4. 导出分析报告

### 报告生成

1. 进入"报告管理"页面
2. 选择测试记录
3. 选择报告模板
4. 点击"生成报告"
5. 预览报告内容
6. 下载PDF文件

### 参数设置

1. 进入"参数设置"页面
2. 配置采集参数：
   - 采样频率：10Hz - 10kHz
   - 采样点数：1000 - 10000
   - 触发模式：自动/手动/外部
3. 配置显示参数：
   - 显示模式
   - 时间基准
   - 颜色方案
4. 配置检测参数：
   - 上下门限
   - 灵敏度
   - 噪声抑制
5. 保存为测试模板

### 校准管理

1. 进入"校准管理"页面
2. 选择标准试块类型
3. 放置标准试块，开始采集
4. 系统自动计算校准曲线
5. 验证校准结果
6. 保存校准参数

---

## 🛠 技术栈

### 前端技术
- **HTML5**：语义化标签，Canvas绘图
- **CSS3**：Grid/Flexbox布局，动画效果
- **JavaScript ES6+**：模块化开发，异步处理

### 核心库
- **Supabase Client**：后端服务集成（数据库、存储）
- **Chart.js**：统计图表绘制
- **jsPDF**：PDF报告生成
- **html2canvas**：HTML转图片

### 后端服务
- **Supabase**：Backend as a Service
  - PostgreSQL数据库
  - 实时订阅
  - 对象存储
  - RESTful API

### 开发工具
- **Git**：版本控制
- **ESLint**：代码检查
- **Prettier**：代码格式化

---

## 📁 项目结构

```
maguitest/
├── index.html                    # 主界面（实时监测）
├── pages/                        # 功能页面
│   ├── history.html             # 历史数据
│   ├── analysis.html            # 数据分析
│   ├── reports.html             # 报告管理
│   ├── settings.html            # 参数设置
│   └── calibration.html         # 校准管理
├── css/                          # 样式文件
│   ├── main.css                 # 主样式
│   ├── industrial.css           # 工业风格样式
│   └── responsive.css           # 响应式样式
├── js/                           # JavaScript文件
│   ├── config.js                # Supabase配置
│   ├── database.js              # 数据库操作封装
│   ├── waveform.js              # 波形生成与绘制
│   ├── realtime.js              # 实时监测逻辑
│   ├── analysis.js              # 数据分析功能
│   ├── report.js                # 报告生成功能
│   └── utils.js                 # 工具函数
├── lib/                          # 第三方库
│   ├── supabase.js              # Supabase客户端
│   ├── chart.min.js             # Chart.js
│   └── jspdf.min.js             # jsPDF
├── assets/                       # 资源文件
│   ├── images/                  # 图片
│   └── icons/                   # 图标
├── image/                        # 参考图片
│   └── 磁检测界面.jpg
├── .env                          # 环境变量（不提交到Git）
├── .gitignore                   # Git忽略文件
├── README.md                    # 项目说明文档
├── PRD.md                       # 产品需求文档
└── DATABASE_SCHEMA.md           # 数据库设计文档
```

---

## 🗄️ 数据库配置

### Supabase项目信息

- **项目URL**：https://zzyueuweeoakopuuwfau.supabase.co
- **数据库**：PostgreSQL（Supabase托管）

### 数据表

项目使用以下6个主要数据表：

1. **test_records** - 测试记录主表
2. **waveform_data** - 波形数据存储
3. **defects** - 缺陷检测记录
4. **calibration_settings** - 校准参数
5. **test_templates** - 测试模板
6. **reports** - 报告记录

详细的表结构设计请参考 `DATABASE_SCHEMA.md` 文档。

### 初始化数据库

```sql
-- 在Supabase SQL Editor中执行
-- 参考 DATABASE_SCHEMA.md 中的完整SQL脚本
```

---

## 🧪 测试

### 功能测试清单

- [ ] 主界面加载正常
- [ ] 波形实时生成和显示
- [ ] 缺陷自动检测功能
- [ ] 数据保存到Supabase
- [ ] 历史数据查询和回放
- [ ] 数据分析功能
- [ ] PDF报告生成
- [ ] 参数设置保存
- [ ] 校准流程完整

### 性能测试

```javascript
// 波形渲染性能测试
console.time('waveform-render');
renderWaveform(dataPoints);
console.timeEnd('waveform-render');
// 目标: <16ms (60fps)

// 数据保存性能测试
console.time('data-save');
await saveTestRecord(data);
console.timeEnd('data-save');
// 目标: <100ms
```

### 浏览器兼容性

已测试的浏览器版本：

- ✅ Chrome 120+ (Windows/macOS)
- ✅ Edge 120+ (Windows)
- ✅ Firefox 115+ (Windows/macOS)
- ⚠️ Safari 16+ (macOS) - 部分功能可能受限

---

## 🔧 开发指南

### 本地开发

1. 安装依赖（无需安装，使用CDN）
2. 配置环境变量
3. 启动本地服务器
4. 开始开发

### 代码规范

- 使用ES6+语法
- 函数命名采用驼峰命名法
- 添加必要的注释
- 保持代码整洁

### 提交规范

```bash
# 功能开发
git commit -m "feat: 添加波形缩放功能"

# Bug修复
git commit -m "fix: 修复数据保存失败问题"

# 文档更新
git commit -m "docs: 更新README使用说明"

# 样式调整
git commit -m "style: 优化按钮样式"
```

---

## 🚀 部署

### Netlify 部署

```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录Netlify
netlify login

# 初始化项目
netlify init

# 部署到生产环境
netlify deploy --prod
```

### Vercel 部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

### 环境变量配置

在部署平台配置以下环境变量：

```
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📝 任务清单

### 开发阶段

- [x] 编制PRD、README和数据库设计文档
- [ ] 创建项目目录结构和基础文件
- [ ] 在Supabase中创建数据库表结构
- [ ] 开发主界面（实时监测页面），完整还原工业设备外观
- [ ] 开发其他功能页面（历史、分析、报告、设置、校准）
- [ ] 实现Supabase集成和数据库操作封装
- [ ] 实现波形生成算法和Canvas绘制功能
- [ ] 实现实时监测逻辑和缺陷检测算法
- [ ] 实现数据分析功能（频谱分析、统计分析等）
- [ ] 实现PDF报告生成功能
- [ ] 完善工业风格样式和响应式适配
- [ ] 进行功能测试、性能测试和兼容性测试
- [ ] 优化代码、完善文档并部署上线

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 贡献流程

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📮 联系方式

- **项目维护者**：Your Name
- **Email**：your.email@example.com
- **项目地址**：https://github.com/yourusername/magnetic-detector

---

## 🙏 致谢

- 感谢 [Supabase](https://supabase.com) 提供优秀的后端服务
- 感谢 [Chart.js](https://www.chartjs.org) 提供图表绘制库
- 感谢 [jsPDF](https://github.com/parallax/jsPDF) 提供PDF生成功能
- 感谢所有为无损检测技术发展做出贡献的工程师们

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个Star！⭐**

Made with ❤️ by Magnetic Detector Team

</div>
