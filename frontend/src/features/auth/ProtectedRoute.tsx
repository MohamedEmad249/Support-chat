import { Navigate } from 'react-router'
import { Button } from '../../app/components/ui/button'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, profileError, refreshProfile, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Could not load your account</h2>
          <p className="text-sm text-gray-600">
            {profileError ??
              'Your login worked, but no profile was found. Make sure the worker API is running and your account exists in the profiles table.'}
          </p>
          <p className="text-xs text-gray-500">
            Demo accounts: sales1@demo.com, manager@demo.com, student@demo.com (password: demo1234)
          </p>
          <div className="flex gap-2">
            <Button onClick={() => void refreshProfile()}>Retry</Button>
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
