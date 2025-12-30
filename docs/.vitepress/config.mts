import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
  title: 'MathTutor',
  description: 'AI 智能数学辅导系统',

  // 注入自定义样式和脚本
  transformHead: ({ pageData }) => {
    return [
      [
        'style',
        {},
        `/**
 * 本页目录折叠样式
 * 为 VitePress 的右侧目录导航添加折叠/展开功能
 */

/* 目录容器样式 */
.VPDocOutline {
  position: relative;
}

/* 折叠按钮样式 */
.outline-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: background-color 0.2s, color 0.2s;
  user-select: none;
  margin-bottom: 8px;
  border-radius: 6px;
}

.outline-collapse-btn:hover {
  background-color: var(--vp-c-bg-soft);
}

/* 折叠按钮图标 */
.outline-collapse-btn .icon {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

/* 折叠状态下的图标旋转 */
.outline-collapse-btn.collapsed .icon {
  transform: rotate(-90deg);
}

/* 目录内容区域 */
.VPDocOutline > .root > .outline-link {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 2000px;
  opacity: 1;
}

/* 折叠状态 */
.VPDocOutline > .root > .outline-link.collapsed {
  max-height: 0;
  opacity: 0;
}

/* 二级及以上目录项的折叠状态 */
.VPDocOutline .outline-link {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 2000px;
  opacity: 1;
}

.VPDocOutline .outline-link.collapsed {
  max-height: 0;
  opacity: 0;
}

/* 父级项的折叠按钮样式 */
.outline-item-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: transform 0.3s ease, color 0.2s;
  border-radius: 3px;
  flex-shrink: 0;
}

.outline-item-toggle:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.outline-item-toggle .icon {
  width: 10px;
  height: 10px;
  transition: transform 0.3s ease;
}

/* 折叠状态下的图标旋转 */
.outline-item-toggle.collapsed .icon {
  transform: rotate(-90deg);
}

/* 深色模式优化 */
.dark .outline-collapse-btn,
.dark .outline-item-toggle {
  color: var(--vp-c-text-1);
}

.dark .outline-collapse-btn:hover,
.dark .outline-item-toggle:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .outline-collapse-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
}

/* 平滑滚动到锚点时的动画 */
html {
  scroll-behavior: smooth;
}

/* 目录项激活状态的增强 */
.VPDocOutline .outline-link.active {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  border-left-color: var(--vp-c-brand-1);
}`
      ],
      [
        'script',
        { type: 'text/javascript' },
        `
// 本页目录折叠功能
(function() {
  'use strict'

  function initOutlineCollapse() {
    const outlineElement = document.querySelector('.VPDocOutline')
    if (!outlineElement) return

    const outlineTitle = outlineElement.querySelector('.outline-title')
    if (!outlineTitle) return

    if (outlineElement.dataset.outlineCollapseInitialized) return

    const collapseBtn = document.createElement('button')
    collapseBtn.className = 'outline-collapse-btn'
    collapseBtn.innerHTML = '<span>' + (outlineTitle.textContent || '本页目录') + '</span><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>'

    outlineTitle.replaceWith(collapseBtn)

    const rootElement = outlineElement.querySelector('.root')
    if (!rootElement) return

    addToggleButtonsToOutlineItems(rootElement)

    collapseBtn.addEventListener('click', () => {
      const isCollapsed = collapseBtn.classList.contains('collapsed')
      if (isCollapsed) {
        collapseBtn.classList.remove('collapsed')
        const outlineLinks = rootElement.querySelectorAll(':scope > .outline-link')
        outlineLinks.forEach((link) => link.classList.remove('collapsed'))
      } else {
        collapseBtn.classList.add('collapsed')
        const outlineLinks = rootElement.querySelectorAll(':scope > .outline-link')
        outlineLinks.forEach((link) => link.classList.add('collapsed'))
      }
    })

    outlineElement.dataset.outlineCollapseInitialized = 'true'
  }

  function addToggleButtonsToOutlineItems(rootElement) {
    const outlineItems = rootElement.querySelectorAll('.outline-item')

    outlineItems.forEach((item) => {
      const nestedOutline = item.querySelector('.outline-item')
      if (!nestedOutline) return

      const outlineLink = item.querySelector(':scope > .outline-link')
      if (!outlineLink) return

      if (outlineLink.querySelector('.outline-item-toggle')) return

      const toggleBtn = document.createElement('button')
      toggleBtn.className = 'outline-item-toggle'
      toggleBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>'

      outlineLink.insertBefore(toggleBtn, outlineLink.firstChild)

      const childrenContainer = item.querySelector(':scope > .outline-link')
      if (!childrenContainer) return

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const isCollapsed = toggleBtn.classList.contains('collapsed')
        if (isCollapsed) {
          toggleBtn.classList.remove('collapsed')
          childrenContainer.classList.remove('collapsed')
        } else {
          toggleBtn.classList.add('collapsed')
          childrenContainer.classList.add('collapsed')
        }
      })
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOutlineCollapse)
  } else {
    initOutlineCollapse()
  }

  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    setTimeout(initOutlineCollapse, 100)
  }

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    setTimeout(initOutlineCollapse, 100)
  }

  window.addEventListener('popstate', () => {
    setTimeout(initOutlineCollapse, 100)
  })

  document.addEventListener('vue:mounted', () => {
    setTimeout(initOutlineCollapse, 100)
  })

  document.addEventListener('vue:updated', () => {
    setTimeout(initOutlineCollapse, 100)
  })
})()
        `
      ]
    ]
  },
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
      '/architecture/': [
        {
          text: '技术架构设计',
          items: [
            { text: '架构总览', link: '/architecture/README.md' },
            { text: '知识体系模块设计', link: '/architecture/knowledge-system-design.md' },
            { text: '题库管理系统设计', link: '/architecture/question-bank-system-design.md' },
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
          text: '技术架构文档',
          items: [
            { text: '架构总览', link: '/architecture/README.md' },
            { text: '知识体系模块设计', link: '/architecture/knowledge-system-design.md' },
            { text: '题库管理系统设计', link: '/architecture/question-bank-system-design.md' },
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
