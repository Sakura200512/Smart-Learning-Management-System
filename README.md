# 智能学习管理系统（React + AI）

一个中等规模的 React 学习管理系统示例，包含登录、课程管理、AI 学习计划、待办事项、进度统计和 ECharts 数据可视化。

## 功能

- 简易登录与本地状态持久化
- 课程列表管理：新增、删除、进度调整
- AI 学习计划生成：支持 OpenAI 兼容接口，也内置本地回退计划
- ToDo List：新增、完成、删除、优先级管理
- 学习进度统计：课程进度、学习时长分布、待办完成情况
- React Router 页面路由
- Context + useState 状态管理
- ECharts 图表渲染

## 本地运行

```bash
pnpm install
pnpm dev
```

## 生产构建

```bash
pnpm build
```

## AI API 配置

不配置环境变量时，系统会使用本地智能回退模板，方便演示。

如需调用 OpenAI 兼容接口，可以创建 `.env`：

```bash
VITE_OPENAI_API_KEY=你的_API_Key
VITE_AI_MODEL=gpt-4o-mini
```

也可以使用自己的后端代理：

```bash
VITE_AI_ENDPOINT=https://your-domain.com/api/plan
```

## GitHub Pages 部署

推荐使用 GitHub Actions 自动部署。仓库开启 Pages 后，选择 `GitHub Actions` 作为部署来源即可。
