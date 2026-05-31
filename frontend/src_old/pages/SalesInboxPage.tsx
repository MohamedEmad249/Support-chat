import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../features/auth/useAuth'
import { useConversations } from '../features/conversations/useConversations'
import { subscribeToConversations } from '../lib/realtime'

type Filter = 'unassigned' | 'mine' | 'all'

export default function SalesInboxPage() {
  const { state, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('unassigned')
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')

  const profile = state.status === 'authenticated' ? state.profile : null

  const { data: threads, isLoading, error } = useConversations({
    assignedTo: filter === 'unassigned' ? 'unassigned' : filter === 'mine' ? 'me' : undefined,
    status: statusFilter || undefined,
    q: q || undefined,
  })

  useEffect(() => subscribeToConversations(queryClient), [queryClient])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-lg font-semibold">Sales Inbox</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{profile?.full_name}</span>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3">
        <div className="flex gap-1 rounded-md border p-0.5">
          {(['unassigned', 'mine', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1 text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'mine' ? 'Mine' : f === 'all' ? 'All' : 'Unassigned'}
            </button>
          ))}
        </div>
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
          placeholder="Search…"
          className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        )}
        {error && (
          <div className="p-8 text-center text-sm text-destructive">{error.message}</div>
        )}
        {!isLoading && threads?.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No conversations.</div>
        )}
        <ul className="divide-y">
          {threads?.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => navigate(`/sales/conversations/${t.id}`)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.student.full_name} ·{' '}
                    {t.assignee ? t.assignee.full_name : 'Unassigned'} ·{' '}
                    {new Date(t.last_message_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  t.status === 'open' ? 'bg-green-100 text-green-700' :
                  t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {t.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
