import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  HashRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import * as echarts from 'echarts';
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AppProvider, useApp } from './state/AppContext.jsx';
import { generatePlan } from './services/aiPlan.js';
import './styles.css';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/stats" element={<Stats />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

function ProtectedLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const links = [
    { to: '/', label: '总览', icon: LayoutDashboard },
    { to: '/courses', label: '课程', icon: BookOpen },
    { to: '/planner', label: '计划', icon: Sparkles },
    { to: '/todos', label: '待办', icon: ClipboardList },
    { to: '/stats', label: '统计', icon: BarChart3 }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <strong>智能学习管理</strong>
            <span>Learning OS</span>
          </div>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut size={18} />
          退出登录
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">欢迎回来</span>
            <h1>{user.name} 的学习工作台</h1>
          </div>
          <div className="profile-chip">{user.name.slice(0, 1).toUpperCase()}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login({ name: form.get('name') || '同学' });
    navigate('/');
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand compact">
          <div className="brand-mark">AI</div>
          <div>
            <strong>智能学习管理系统</strong>
            <span>React + AI</span>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            昵称
            <input name="name" placeholder="例如：Zuo" autoComplete="name" />
          </label>
          <label>
            学习方向
            <input name="major" placeholder="例如：前端开发 / 考研英语" />
          </label>
          <button className="primary-button" type="submit">
            <CheckCircle2 size={18} />
            进入系统
          </button>
        </form>
      </section>
    </main>
  );
}

function Dashboard() {
  const { courses, todos } = useApp();
  const completedTodos = todos.filter((todo) => todo.done).length;
  const avgProgress = Math.round(courses.reduce((sum, item) => sum + item.progress, 0) / courses.length);
  const urgent = todos.filter((todo) => !todo.done && todo.priority === '高').length;

  return (
    <>
      <section className="metric-grid">
        <Metric title="课程数量" value={courses.length} detail="正在管理的课程" />
        <Metric title="平均进度" value={`${avgProgress}%`} detail="全部课程综合进度" />
        <Metric title="已完成待办" value={completedTodos} detail={`共 ${todos.length} 项任务`} />
        <Metric title="高优先级" value={urgent} detail="需要尽快处理" />
      </section>
      <section className="content-grid two">
        <div className="panel">
          <div className="section-title">
            <h2>近期课程</h2>
            <span>按进度排序</span>
          </div>
          <div className="course-list compact-list">
            {courses
              .slice()
              .sort((a, b) => a.progress - b.progress)
              .slice(0, 4)
              .map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
          </div>
        </div>
        <div className="panel">
          <div className="section-title">
            <h2>今日待办</h2>
            <span>未完成任务</span>
          </div>
          <div className="todo-stack">
            {todos.filter((todo) => !todo.done).slice(0, 5).map((todo) => (
              <div className="todo-item readonly" key={todo.id}>
                <span className={`priority ${todo.priority}`}>{todo.priority}</span>
                <strong>{todo.title}</strong>
                <small>{todo.course}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Courses() {
  const { courses, addCourse, updateCourse, removeCourse } = useApp();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addCourse({
      name: form.get('name'),
      category: form.get('category'),
      hours: Number(form.get('hours')),
      progress: Number(form.get('progress'))
    });
    event.currentTarget.reset();
  }

  return (
    <section className="content-grid course-layout">
      <div className="panel">
        <div className="section-title">
          <h2>课程列表管理</h2>
          <span>{courses.length} 门课程</span>
        </div>
        <div className="course-list">
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onProgress={(progress) => updateCourse(course.id, { progress })}
              onRemove={() => removeCourse(course.id)}
            />
          ))}
        </div>
      </div>
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="section-title">
          <h2>新增课程</h2>
        </div>
        <label>
          课程名称
          <input name="name" required placeholder="React 项目实战" />
        </label>
        <label>
          分类
          <select name="category" defaultValue="编程">
            <option>编程</option>
            <option>语言</option>
            <option>数学</option>
            <option>设计</option>
            <option>职业技能</option>
          </select>
        </label>
        <label>
          学习时长
          <input name="hours" required type="number" min="1" defaultValue="20" />
        </label>
        <label>
          初始进度
          <input name="progress" required type="number" min="0" max="100" defaultValue="0" />
        </label>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          添加课程
        </button>
      </form>
    </section>
  );
}

function Planner() {
  const { courses, plan, setPlan } = useApp();
  const [loading, setLoading] = React.useState(false);
  const [goal, setGoal] = React.useState('4 周内完成当前课程的核心内容，并形成可展示作品');

  async function handleGenerate() {
    setLoading(true);
    const result = await generatePlan({ goal, courses });
    setPlan(result);
    setLoading(false);
  }

  return (
    <section className="content-grid planner-layout">
      <div className="panel form-panel">
        <div className="section-title">
          <h2>AI 学习计划生成</h2>
          <span>支持真实 API 或本地智能回退</span>
        </div>
        <label>
          学习目标
          <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows="6" />
        </label>
        <button className="primary-button" type="button" disabled={loading} onClick={handleGenerate}>
          <Sparkles size={18} />
          {loading ? '生成中...' : '生成计划'}
        </button>
      </div>
      <div className="panel">
        <div className="section-title">
          <h2>推荐计划</h2>
          <span>{plan.weeks.length} 周</span>
        </div>
        <div className="plan-list">
          {plan.weeks.map((week) => (
            <article className="plan-week" key={week.title}>
              <h3>{week.title}</h3>
              <p>{week.focus}</p>
              <ul>
                {week.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Todos() {
  const { todos, courses, addTodo, toggleTodo, removeTodo } = useApp();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addTodo({
      title: form.get('title'),
      course: form.get('course'),
      priority: form.get('priority')
    });
    event.currentTarget.reset();
  }

  return (
    <section className="content-grid todo-layout">
      <div className="panel">
        <div className="section-title">
          <h2>待办事项</h2>
          <span>{todos.filter((todo) => !todo.done).length} 项未完成</span>
        </div>
        <div className="todo-stack">
          {todos.map((todo) => (
            <div className={`todo-item ${todo.done ? 'done' : ''}`} key={todo.id}>
              <button className="icon-button" type="button" onClick={() => toggleTodo(todo.id)} title="切换完成状态">
                <CheckCircle2 size={18} />
              </button>
              <div>
                <strong>{todo.title}</strong>
                <small>{todo.course}</small>
              </div>
              <span className={`priority ${todo.priority}`}>{todo.priority}</span>
              <button className="icon-button danger" type="button" onClick={() => removeTodo(todo.id)} title="删除待办">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="section-title">
          <h2>新增待办</h2>
        </div>
        <label>
          任务内容
          <input name="title" required placeholder="完成第 3 章练习" />
        </label>
        <label>
          关联课程
          <select name="course">
            {courses.map((course) => (
              <option key={course.id}>{course.name}</option>
            ))}
          </select>
        </label>
        <label>
          优先级
          <select name="priority" defaultValue="中">
            <option>高</option>
            <option>中</option>
            <option>低</option>
          </select>
        </label>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          添加待办
        </button>
      </form>
    </section>
  );
}

function Stats() {
  const { courses, todos } = useApp();
  const categoryData = useMemo(() => {
    const grouped = courses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.hours;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [courses]);

  const todoDone = todos.filter((todo) => todo.done).length;
  const todoOpen = todos.length - todoDone;

  return (
    <section className="content-grid two">
      <div className="panel chart-panel">
        <div className="section-title">
          <h2>课程进度</h2>
          <span>ECharts</span>
        </div>
        <Chart
          option={{
            tooltip: {},
            grid: { left: 36, right: 16, bottom: 34, top: 18 },
            xAxis: { type: 'category', data: courses.map((item) => item.name), axisLabel: { interval: 0, rotate: 18 } },
            yAxis: { type: 'value', max: 100 },
            series: [{ type: 'bar', data: courses.map((item) => item.progress), itemStyle: { color: '#2563eb', borderRadius: [6, 6, 0, 0] } }]
          }}
        />
      </div>
      <div className="panel chart-panel">
        <div className="section-title">
          <h2>学习时长分布</h2>
          <span>按分类</span>
        </div>
        <Chart
          option={{
            tooltip: { trigger: 'item' },
            series: [{ type: 'pie', radius: ['48%', '72%'], data: categoryData, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 } }],
            color: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed']
          }}
        />
      </div>
      <div className="panel chart-panel wide">
        <div className="section-title">
          <h2>待办完成情况</h2>
          <span>完成 / 未完成</span>
        </div>
        <Chart
          option={{
            tooltip: {},
            xAxis: { type: 'category', data: ['已完成', '未完成'] },
            yAxis: { type: 'value' },
            series: [{ type: 'bar', data: [todoDone, todoOpen], itemStyle: { color: (params) => (params.dataIndex === 0 ? '#16a34a' : '#f59e0b'), borderRadius: [6, 6, 0, 0] } }]
          }}
        />
      </div>
    </section>
  );
}

function Metric({ title, value, detail }) {
  return (
    <article className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function CourseRow({ course, onProgress, onRemove }) {
  return (
    <article className="course-row">
      <div>
        <strong>{course.name}</strong>
        <small>{course.category} · {course.hours} 小时</small>
      </div>
      <div className="progress-area">
        <div className="progress-track">
          <span style={{ width: `${course.progress}%` }} />
        </div>
        <b>{course.progress}%</b>
      </div>
      {onProgress && (
        <input
          aria-label={`${course.name} 进度`}
          type="range"
          min="0"
          max="100"
          value={course.progress}
          onChange={(event) => onProgress(Number(event.target.value))}
        />
      )}
      {onRemove && (
        <button className="icon-button danger" type="button" onClick={onRemove} title="删除课程">
          <Trash2 size={18} />
        </button>
      )}
    </article>
  );
}

function Chart({ option }) {
  const ref = useRef(null);

  useEffect(() => {
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
    };
  }, [option]);

  return <div className="chart" ref={ref} />;
}

createRoot(document.getElementById('root')).render(<App />);
