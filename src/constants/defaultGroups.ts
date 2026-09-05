import type { ShortcutGroup } from '@/types/shortcut'
import { normalizeUrl } from '@/utils/format'
import { uid } from '@/utils/id'

function site(name: string, url: string): { id: string; name: string; url: string } {
  return { id: uid(), name, url: normalizeUrl(url) }
}

export const DEFAULT_GROUPS: ShortcutGroup[] = [
  {
    id: uid(),
    name: '常用',
    sites: [
      site('必应', 'bing.com'),
      site('百度', 'baidu.com'),
      site('哔哩哔哩', 'bilibili.com'),
      site('知乎', 'zhihu.com'),
      site('微博', 'weibo.com'),
      site('淘宝', 'taobao.com'),
      site('京东', 'jd.com'),
      site('网易云音乐', 'music.163.com'),
    ],
  },
  {
    id: uid(),
    name: '开发',
    sites: [
      site('GitHub', 'github.com'),
      site('Stack Overflow', 'stackoverflow.com'),
      site('MDN', 'developer.mozilla.org'),
      site('npm', 'npmjs.com'),
      site('掘金', 'juejin.cn'),
      site('V2EX', 'v2ex.com'),
    ],
  },
  {
    id: uid(),
    name: '娱乐',
    sites: [
      site('豆瓣', 'douban.com'),
      site('YouTube', 'youtube.com'),
      site('抖音', 'douyin.com'),
      site('腾讯视频', 'v.qq.com'),
      site('爱发电', 'afdian.com'),
    ],
  },
]
