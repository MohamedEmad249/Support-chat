import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../features/auth/useAuth'
import { useConversations } from '../features/conversations/useConversations'
import { subscribeToConversations } from '../lib/realtime'

export default function ManagerQueuePage() {
  const { state, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')

  const { data: threads, isLoading, error } = useConversations({
    status: statusFilter || undefined,
    q: q || undefined,
  })

  useEffect(() => subscribeToConversations(queryClient), [queryClient])

  const profile = state.status === 'authenticated' ? state.profile : null

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-lg font-semibold">Manager Queue</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{profile?.full_name}</span>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search conversations…"
          className="h-8 w-64 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      {/* Table */}
      <main className="flex-1 overflow-auto px-6 py-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        {!isLoading && threads?.length === 0 && (
          <p className="text-sm text-muted-foreground">No conversations.</p>
        )}
        {(threads?.length ?? 0) > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Subject</th>
                <th className="pb-2 pr-4 font-medium">Student</th>
                <th className="pb-2 pr-4 font-medium">Assigned to</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {threads?.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/manager/conversations/${t.id}`)}
                  className="cursor-pointer hover:bg-accent"
                >
                  <td className="py-3 pr-4 font-medium">{t.subject}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.student.full_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {t.assignee?.full_name ?? <span className="italic">Unassigned</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      t.status === 'open' ? 'bg-green-100 text-green-700' :
                      t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(t.last_message_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
