import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import LoginPage from '../pages/LoginPage'
import StudentInboxPage from '../pages/StudentInboxPage'
import SalesInboxPage from '../pages/SalesInboxPage'
import ManagerQueuePage from '../pages/ManagerQueuePage'
import ConversationPage from '../pages/ConversationPage'

function AuthGuard({ allow }: { allow: ('student' | 'sales' | 'manager')[] }) {
  const { state } = useAuth()

  if (state.status === 'loading') {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>
  }
  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }
  if (!allow.includes(state.profile.role)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

function RoleRedirect() {
  const { state } = useAuth()
  if (state.status === 'loading') return null
  if (state.status === 'unauthenticated') return <LoginPage />

  const role = state.profile.role
  if (role === 'student') return <Navigate to="/student" replace />
  if (role === 'sales') return <Navigate to="/sales" replace />
  return <Navigate to="/manager" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard allow={['student']} />,
    children: [
      { path: '/student', element: <StudentInboxPage /> },
      { path: '/student/conversations/:threadId', element: <ConversationPage /> },
    ],
  },
  {
    element: <AuthGuard allow={['sales']} />,
    children: [
      { path: '/sales', element: <SalesInboxPage /> },
      { path: '/sales/conversations/:threadId', element: <ConversationPage /> },
    ],
  },
  {
    element: <AuthGuard allow={['manager']} />,
    children: [
      { path: '/manager', element: <ManagerQueuePage /> },
      { path: '/manager/conversations/:threadId', element: <ConversationPage /> },
    ],
  },
])
