/**
 * 极简 JSONP：通过 <script> 加载 cb=xxx 回调接口（用于无 CORS 的公开接口，如百度联想词）
 */
export function jsonp<T = unknown>(
  url: string,
  options: { timeout?: number } = {},
): Promise<T> {
  const { timeout = 6000 } = options
  return new Promise<T>((resolve, reject) => {
    const cbName = `__jsonp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    const separator = url.includes('?') ? '&' : '?'
    const script = document.createElement('script')

    const cleanup = () => {
      clearTimeout(timer)
      delete (window as unknown as Record<string, unknown>)[cbName]
      script.remove()
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('JSONP 请求超时'))
    }, timeout)

    ;(window as unknown as Record<string, unknown>)[cbName] = (data: T) => {
      cleanup()
      resolve(data)
    }
    script.onerror = () => {
      cleanup()
      reject(new Error('JSONP 请求失败'))
    }
    script.src = `${url}${separator}cb=${cbName}`
    document.head.appendChild(script)
  })
}
