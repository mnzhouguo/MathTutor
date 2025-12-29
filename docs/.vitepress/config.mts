import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
  title: 'MathTutor',
  description: 'AI 智能数学辅导系统',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '需求清单', link: '/REQUIREMENTS.md' },
      { text: '技术架构', link: '/architecture/README.md' },
      { text: '开发计划', link: '/development/README.md' },
      { text: '设计规范', link: '/design/README.md' },
    ],

    sidebar: {
      '/design/': [
        {
          text: '设计文档',
          items: [
            { text: 'UI/UX 设计规范', link: '/design/README.md' },
          ]
        }
      ],
      '/': [
        {
          text: '核心规划',
          items: [
            { text: '📘 需求清单', link: '/REQUIREMENTS.md' },
            { text: '🕐 技术架构设计', link: '/architecture/README.md' },
            { text: '📅 开发计划', link: '/development/README.md' },
          ]
        },
        {
          text: '功能详细需求',
          items: [
            { text: '需求总览', link: '/REQUIREMENTS.md' },
            { text: '1. 知识体系展示', link: '/requirements/01-knowledge-system.md' },
            { text: '2. 题库管理与结构化分解', link: '/requirements/02-question-bank.md' },
            { text: '3. 互动式1对1智能教学', link: '/requirements/03-interactive-teaching.md' },
            { text: '4. 动态实验工具系统', link: '/requirements/04-experimental-tools.md' },
            { text: '5. 学习报告生成', link: '/requirements/05-learning-reports.md' },
            { text: '6. 知识扩展', link: '/requirements/06-knowledge-extension.md' },
            { text: '7. 复习模式', link: '/requirements/07-review-mode.md' },
          ]
        },
        {
          text: '快速导航',
          items: [
            { text: 'UI/UX 设计规范', link: '/design/README.md' },
          ]
        }
      ]
    },

    // 页面右侧目录导航，显示功能模块下的详细功能点
    // 使用 "deep" 模式自动显示所有层级的标题
    outline: {
      level: 'deep',
      label: '本页目录'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo/mathtutor' }
    ],

    search: {
      provider: 'local'
    }
  }
})
)
