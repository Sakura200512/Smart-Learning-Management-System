const fallbackTemplate = (goal, courses) => ({
  weeks: [
    {
      title: '第 1 周：目标拆解',
      focus: `围绕“${goal}”拆成可执行任务，优先处理进度最低的课程。`,
      tasks: [
        `复盘 ${courses[0]?.name || '核心课程'} 的基础知识`,
        '建立每日 45 分钟专注学习块',
        '把课程难点写成问题清单'
      ]
    },
    {
      title: '第 2 周：集中突破',
      focus: '选择 2 门关键课程进行高频练习和输出。',
      tasks: [
        `完成 ${courses[1]?.name || '重点课程'} 的章节练习`,
        '每两天提交一次学习总结',
        '把错题或卡点转成待办事项'
      ]
    },
    {
      title: '第 3 周：项目应用',
      focus: '用一个小作品串联知识点，验证真实掌握程度。',
      tasks: [
        '完成一个可演示的阶段作品',
        '使用图表记录进度变化',
        '邀请同学或老师做一次反馈'
      ]
    },
    {
      title: '第 4 周：复盘发布',
      focus: '整理成果、补齐薄弱点，并形成下一轮学习计划。',
      tasks: [
        '完成最终复盘文档',
        '重新评估所有课程进度',
        '制定下一阶段 2 周目标'
      ]
    }
  ]
});

export async function generatePlan({ goal, courses }) {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT;
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!endpoint && !apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return fallbackTemplate(goal, courses);
  }

  try {
    const response = await fetch(endpoint || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '你是学习规划助手。只返回 JSON，格式为 {"weeks":[{"title":"","focus":"","tasks":[""]}]}。' },
          { role: 'user', content: JSON.stringify({ goal, courses }) }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.warn('AI plan generation fell back to local template:', error);
    return fallbackTemplate(goal, courses);
  }
}
