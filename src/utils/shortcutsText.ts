import type { ShortcutGroup } from '@/types/shortcut'
import { normalizeUrl } from '@/utils/format'
import { uid } from '@/utils/id'

/**
 * 快捷方式的文本表示，用于批量编辑：
 *   # 分组名
 *   名称 https://example.com
 * 「#」开头的行为分组名；其余每行一个网址，名称与网址用第一个空格分隔；
 * 分组头之前的内容归入「常用」；同名分组自动合并。
 */

export function serializeGroups(groups: ShortcutGroup[]): string {
  const lines: string[] = []
  for (const group of groups) {
    lines.push(`# ${group.name}`)
    for (const site of group.sites) lines.push(`${site.name} ${site.url}`)
    lines.push('')
  }
  return lines.join('\n').trim()
}

function hostnameOf(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function isLikelyUrlText(text: string): boolean {
  return /^https?:\/\//i.test(text) || /^([\w-]+\.)+[a-z]{2,}([/:?#].*)?$/i.test(text)
}

export type ParseResult =
  | { ok: true; groups: ShortcutGroup[] }
  | { ok: false; errors: string[] }

export function parseGroupsText(text: string): ParseResult {
  const errors: string[] = []
  const groups: ShortcutGroup[] = []
  let current: ShortcutGroup | null = null

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim()
    if (!line) return

    if (line.startsWith('#') || line.startsWith('＃')) {
      const name = line.replace(/^[#＃]\s*/, '').trim() || '新分组'
      current = groups.find((g) => g.name === name) ?? null
      if (!current) {
        current = { id: uid(), name, sites: [] }
        groups.push(current)
      }
      return
    }

    if (!current) {
      current = { id: uid(), name: '常用', sites: [] }
      groups.push(current)
    }

    // 名称可能含空格（如 Stack Overflow）：先按第一个空格切分，网址不合法时改按最后一个空格切分
    let firstSpace = -1
    let lastSpace = -1
    for (const match of line.matchAll(/\s/g)) {
      if (firstSpace === -1) firstSpace = match.index ?? -1
      lastSpace = match.index ?? -1
    }

    const candidates: Array<{ name: string; url: string }> = []
    if (firstSpace === -1) {
      candidates.push({ name: '', url: line })
    } else {
      candidates.push({ name: line.slice(0, firstSpace).trim(), url: line.slice(firstSpace + 1).trim() })
      if (lastSpace > firstSpace) {
        candidates.push({ name: line.slice(0, lastSpace).trim(), url: line.slice(lastSpace + 1).trim() })
      }
    }

    const candidate = candidates.find((c) => isLikelyUrlText(c.url))
    if (!candidate) {
      const urlPart = candidates[0]?.url ?? line
      errors.push(`第 ${index + 1} 行：网址格式不正确「${urlPart}」`)
      return
    }
    current.sites.push({
      id: uid(),
      name: candidate.name || hostnameOf(candidate.url),
      url: normalizeUrl(candidate.url),
    })
  })

  if (groups.length === 0) errors.push('内容为空：至少保留一个分组')
  return errors.length > 0 ? { ok: false, errors } : { ok: true, groups }
}
