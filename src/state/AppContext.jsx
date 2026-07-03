import React, { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

const initialCourses = [
  { id: 'react', name: 'React 项目实战', category: '编程', hours: 32, progress: 66 },
  { id: 'ai', name: 'AI API 应用开发', category: '编程', hours: 24, progress: 42 },
  { id: 'english', name: '技术英语阅读', category: '语言', hours: 18, progress: 58 },
  { id: 'design', name: '产品设计基础', category: '设计', hours: 16, progress: 35 }
];

const initialTodos = [
  { id: 'todo-1', title: '完成 React Router 页面跳转练习', course: 'React 项目实战', priority: '高', done: false },
  { id: 'todo-2', title: '整理 AI 调用流程笔记', course: 'AI API 应用开发', priority: '中', done: false },
  { id: 'todo-3', title: '阅读 2 篇英文技术文章', course: '技术英语阅读', priority: '低', done: true }
];

const initialPlan = {
  weeks: [
    {
      title: '第 1 周：梳理基础',
      focus: '补齐 React、路由和状态管理的关键概念。',
      tasks: ['每天完成 1 个组件拆分练习', '复盘课程笔记', '整理待问问题清单']
    },
    {
      title: '第 2 周：进入项目',
      focus: '围绕真实功能完成课程、待办和统计模块。',
      tasks: ['实现课程 CRUD', '接入 ECharts 图表', '完成一次代码重构']
    },
    {
      title: '第 3 周：AI 增强',
      focus: '实现 AI 学习计划生成，并处理加载、失败和回退状态。',
      tasks: ['配置 API 环境变量', '设计提示词', '验证计划结果可读性']
    },
    {
      title: '第 4 周：发布展示',
      focus: '完成构建、部署和项目说明文档。',
      tasks: ['补充 README', '执行生产构建', '部署到 GitHub Pages']
    }
  ]
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('slm:user') || 'null'));
  const [courses, setCourses] = useState(() => JSON.parse(localStorage.getItem('slm:courses') || 'null') || initialCourses);
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('slm:todos') || 'null') || initialTodos);
  const [plan, setPlanState] = useState(() => JSON.parse(localStorage.getItem('slm:plan') || 'null') || initialPlan);

  function persist(key, value, setter) {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  }

  const value = useMemo(() => ({
    user,
    courses,
    todos,
    plan,
    login(nextUser) {
      persist('slm:user', nextUser, setUser);
    },
    logout() {
      setUser(null);
      localStorage.removeItem('slm:user');
    },
    addCourse(course) {
      persist('slm:courses', [...courses, { ...course, id: crypto.randomUUID() }], setCourses);
    },
    updateCourse(id, patch) {
      persist('slm:courses', courses.map((course) => (course.id === id ? { ...course, ...patch } : course)), setCourses);
    },
    removeCourse(id) {
      persist('slm:courses', courses.filter((course) => course.id !== id), setCourses);
    },
    addTodo(todo) {
      persist('slm:todos', [{ ...todo, id: crypto.randomUUID(), done: false }, ...todos], setTodos);
    },
    toggleTodo(id) {
      persist('slm:todos', todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)), setTodos);
    },
    removeTodo(id) {
      persist('slm:todos', todos.filter((todo) => todo.id !== id), setTodos);
    },
    setPlan(nextPlan) {
      persist('slm:plan', nextPlan, setPlanState);
    }
  }), [courses, plan, todos, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
