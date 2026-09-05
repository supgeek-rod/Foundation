export interface SearchEngine {
  id: string
  name: string
  /** 含 {query} 占位符的搜索 URL 模板 */
  url: string
  /** 内置引擎标识（用于特殊渲染），自定义引擎留空 */
  builtin?: string
  /** 首字母色块颜色 */
  color: string
}
