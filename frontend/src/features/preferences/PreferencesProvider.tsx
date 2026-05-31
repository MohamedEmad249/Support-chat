import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'



export type NotificationPreferences = {
  emailNewConversation: boolean
  emailDailySummary: boolean
  emailUrgent: boolean
  pushBrowser: boolean
  pushSound: boolean
  teamMentions: boolean
  weeklyReports: boolean
}

export type AppearancePreferences = {
  compactMode: boolean
  sidebarLabels: boolean
  primaryColor: string
}

type Preferences = {
  notifications: NotificationPreferences
  appearance: AppearancePreferences
}

const STORAGE_KEY = 'unisupport-preferences'

function readStoredPreferences(): Preferences {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPreferences
    return { ...defaultPreferences, ...JSON.parse(raw) }
  } catch {
    return defaultPreferences
  }
}

const defaultPreferences: Preferences = {
  notifications: {
    emailNewConversation: true,
    emailDailySummary: true,
    emailUrgent: true,
    pushBrowser: true,
    pushSound: false,
    teamMentions: true,
    weeklyReports: true,
  },
  appearance: {
    compactMode: false,
    sidebarLabels: true,
    primaryColor: '#3b82f6',
  },
}

type PreferencesContextValue = {
  preferences: Preferences
  updateNotifications: (patch: Partial<NotificationPreferences>) => void
  updateAppearance: (patch: Partial<AppearancePreferences>) => void
  resetPreferences: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(readStoredPreferences)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])



  const updateNotifications = useCallback((patch: Partial<NotificationPreferences>) => {
    setPreferences((p) => ({ ...p, notifications: { ...p.notifications, ...patch } }))
  }, [])

  const updateAppearance = useCallback((patch: Partial<AppearancePreferences>) => {
    setPreferences((p) => ({ ...p, appearance: { ...p.appearance, ...patch } }))
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
    document.documentElement.style.removeProperty('--primary')
  }, [])

  const value = useMemo(
    () => ({ preferences, updateNotifications, updateAppearance, resetPreferences }),
    [preferences, updateNotifications, updateAppearance, resetPreferences],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
