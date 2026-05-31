/** Per-browser-tab storage (not shared across tabs like localStorage). */
export const tabSessionStorage = {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      /* ignore quota errors */
    }
  },
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}
