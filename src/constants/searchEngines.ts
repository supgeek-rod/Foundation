import type { SearchEngine } from '@/types/search'

export const DEFAULT_ENGINE_ID = 'google'

export const BUILTIN_SEARCH_ENGINES: SearchEngine[] = [
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q={query}', builtin: 'bing', color: '#008373' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={query}', builtin: 'baidu', color: '#2932e1' },
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', builtin: 'google', color: '#4285f4' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}', builtin: 'duckduckgo', color: '#de5833' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q={query}', builtin: 'github', color: '#24292f' },
  { id: 'bilibili', name: '哔哩哔哩', url: 'https://search.bilibili.com/all?keyword={query}', builtin: 'bilibili', color: '#fb7299' },
  { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q={query}', builtin: 'zhihu', color: '#0084ff' },
]
