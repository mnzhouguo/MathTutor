import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 在客户端导入折叠功能的 JavaScript
    if (typeof document !== 'undefined') {
      import('./outline-collapse')
    }
  }
} satisfies Theme
