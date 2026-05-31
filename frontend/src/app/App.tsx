import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { RouterProvider } from 'react-router'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from '../features/auth/AuthProvider'
import { PreferencesProvider } from '../features/preferences/PreferencesProvider'
import { tabSessionStorage } from '../lib/tabSessionStorage'
import { queryClient } from './queryClient'
import { router } from './routes'

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="unisupport-theme"
      storage={tabSessionStorage}
    >
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
