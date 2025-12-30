// 本页目录折叠功能
(function() {
  'use strict'

  // 等待 DOM 加载完成
  function initOutlineCollapse() {
    const outlineElement = document.querySelector('.VPDocOutline')
    if (!outlineElement) return

    // 查找目录标题
    const outlineTitle = outlineElement.querySelector('.outline-title')
    if (!outlineTitle) return

    // 如果已经初始化过，跳过
    if (outlineElement.dataset.outlineCollapseInitialized) return

    // 创建主折叠按钮
    const collapseBtn = document.createElement('button')
    collapseBtn.className = 'outline-collapse-btn'
    collapseBtn.innerHTML = `
      <span>${outlineTitle.textContent || '本页目录'}</span>
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `

    // 替换原有标题
    outlineTitle.replaceWith(collapseBtn)

    // 查找目录内容区域
    const rootElement = outlineElement.querySelector('.root')
    if (!rootElement) return

    // 为所有子目录项添加折叠按钮
    addToggleButtonsToOutlineItems(rootElement)

    // 主折叠按钮点击事件
    collapseBtn.addEventListener('click', () => {
      const isCollapsed = collapseBtn.classList.contains('collapsed')

      if (isCollapsed) {
        // 展开
        collapseBtn.classList.remove('collapsed')
        const outlineLinks = rootElement.querySelectorAll(':scope > .outline-link')
        outlineLinks.forEach((link) => {
          link.classList.remove('collapsed')
        })
      } else {
        // 折叠
        collapseBtn.classList.add('collapsed')
        const outlineLinks = rootElement.querySelectorAll(':scope > .outline-link')
        outlineLinks.forEach((link) => {
          link.classList.add('collapsed')
        })
      }
    })

    // 标记已初始化
    outlineElement.dataset.outlineCollapseInitialized = 'true'
  }

  /**
   * 为所有有子项的目录项添加折叠按钮
   */
  function addToggleButtonsToOutlineItems(rootElement) {
    const outlineItems = rootElement.querySelectorAll('.outline-item')

    outlineItems.forEach((item) => {
      // 检查是否有子项
      const nestedOutline = item.querySelector('.outline-item')
      if (!nestedOutline) return

      // 查找该目录项的链接
      const outlineLink = item.querySelector(':scope > .outline-link')
      if (!outlineLink) return

      // 检查是否已经添加过按钮
      if (outlineLink.querySelector('.outline-item-toggle')) return

      // 创建折叠按钮
      const toggleBtn = document.createElement('button')
      toggleBtn.className = 'outline-item-toggle'
      toggleBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `

      // 将按钮插入到链接前面
      outlineLink.insertBefore(toggleBtn, outlineLink.firstChild)

      // 查找子项容器
      const childrenContainer = item.querySelector(':scope > .outline-link')
      if (!childrenContainer) return

      // 折叠按钮点击事件
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const isCollapsed = toggleBtn.classList.contains('collapsed')

        if (isCollapsed) {
          // 展开
          toggleBtn.classList.remove('collapsed')
          childrenContainer.classList.remove('collapsed')
        } else {
          // 折叠
          toggleBtn.classList.add('collapsed')
          childrenContainer.classList.add('collapsed')
        }
      })
    })
  }

  // 在页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOutlineCollapse)
  } else {
    initOutlineCollapse()
  }

  // 监听路由变化,重新初始化 (VitePress SPA 导航)
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

  // 监听内容更新（VitePress 使用自定义事件）
  document.addEventListener('vue:mounted', () => {
    setTimeout(initOutlineCollapse, 100)
  })

  document.addEventListener('vue:updated', () => {
    setTimeout(initOutlineCollapse, 100)
  })
})()
