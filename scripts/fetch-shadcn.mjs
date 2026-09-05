// 从 shadcn-vue 官方 registry 拉取组件并通过 curl 落盘（绕过 CLI 的 fetch 问题）
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://shadcn-vue.com/r/styles/new-york-v4'
const components = process.argv.slice(2)
const seen = new Set()
const deps = new Set()
const root = process.cwd()

const ALIASES = {
  ui: 'src/components/ui',
  lib: 'src/lib',
  components: 'src/components',
  composables: 'src/composables',
  hooks: 'src/composables',
}

function fetchJson(url) {
  const out = execFileSync('curl', ['-s', '--fail', '--max-time', '60', url], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  return JSON.parse(out)
}

async function fetchItem(name) {
  if (seen.has(name)) return
  seen.add(name)
  const item = fetchJson(`${BASE}/${name}.json`)
  for (const file of item.files ?? []) {
    let target = file.target
    if (!target) {
      const stripped = file.path.replace(/^registry\/[^/]+\//, '')
      const [head, ...rest] = stripped.split('/')
      target = path.join(ALIASES[head] ?? head, ...rest)
    }
    const abs = path.join(root, target)
    await mkdir(path.dirname(abs), { recursive: true })
    await writeFile(abs, file.content, 'utf8')
    console.log('wrote', target)
  }
  for (const d of item.dependencies ?? []) deps.add(d)
  for (const dep of item.registryDependencies ?? []) {
    await fetchItem(typeof dep === 'string' ? dep : dep.name)
  }
}

for (const c of components) await fetchItem(c)
console.log('NPM_DEPS:', [...deps].join(' '))
