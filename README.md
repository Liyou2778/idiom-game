# 看图猜成语

二次元风格的看图猜成语网页游戏，脑筋急转弯式题目。

## 快速开始

直接在浏览器打开 index.html 即可开始游戏。
推荐使用 VS Code Live Server 或者 Python 简易服务器运行：

python -m http.server 8080

## 添加图片

1. 用 AI 生成 10 张成语图片
2. 放入 images/ 目录，命名为 1.png ~ 10.png
3. 刷新页面即可

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库（如 idiom-game）
2. 推送项目到仓库
3. 仓库 Settings - Pages - 选择 main 分支 / (root) 目录
4. 访问 https://你的用户名.github.io/idiom-game/

## 项目结构

idiom-game/
  index.html      - 游戏主页
  app.js          - 游戏逻辑
  style.css       - 样式表
  data/
    idioms.json   - 成语题库
  images/         - 成语图片（放入 AI 生成的图片）
  README.md

## 自定义题库

编辑 data/idioms.json，每道题包含：
- id: 编号
- answer: 成语答案
- difficulty: 难度 1-4
- image: 图片路径
- hint: 提示文字

## 计分规则

每题得分 = 基础分(10) + 速度加成 + 连对加成

速度加成: 5秒内 +5, 10秒内 +3, 20秒内 +1
连对加成: 连续答对第n题额外 +(n-1)*2 分

## 技术栈

原生 HTML/CSS/JavaScript，零构建依赖，支持 GitHub Pages 一键部署。

## 后续计划

- 扩充题库至 50+
- 关卡难度分级
- 音效与动效增强
- 排行榜功能
- 分享到社交媒体
