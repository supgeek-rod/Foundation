export interface Site {
  id: string
  name: string
  url: string
}

export interface ShortcutGroup {
  id: string
  name: string
  sites: Site[]
}
