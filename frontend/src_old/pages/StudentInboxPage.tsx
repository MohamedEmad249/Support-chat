import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../features/auth/useAuth'
import { useConversations, useCreateConversation } from '../features/conversations/useConversations'
import { subscribeToConversations } from '../lib/realtime'

const STATUS_TABS = ['open', 'pending', 'closed'] as const

export default function StudentInboxPage() {
  const { state, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('open')
  const [showNew, setShowNew] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const { data: threads, isLoading, error } = useConversations({ status: tab })
  const createConv = useCreateConversation()

  useEffect(() => subscribeToConversations(queryClient), [queryClient])

  const profile = state.status === 'authenticated' ? state.profile : null

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const thread = await createConv.mutateAsync({ subject, message })
    setShowNew(false)
    setSubject('')
    setMessage('')
    navigate(`/student/conversations/${thread.id}`)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-lg font-semibold">Support Chat</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{profile?.full_name}</span>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Conversation
          </button>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b px-6">
        <div className="flex gap-4">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`border-b-2 py-2 text-sm font-medium capitalize transition-colors ${
                tab === s
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
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
          <div className="p-8 text-center text-sm text-muted-foreground">No conversations yet.</div>
        )}
        <ul className="divide-y">
          {threads?.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => navigate(`/student/conversations/${t.id}`)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.assignee ? `Assigned to ${t.assignee.full_name}` : 'Unassigned'} ·{' '}
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

      {/* New Conversation Dialog */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">New Conversation</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Subject</label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Admission requirements"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Write your question…"
                />
              </div>
              {createConv.error && (
                <p className="text-sm text-destructive">{createConv.error.message}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="inline-flex h-9 items-center rounded-md border px-4 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createConv.isPending}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createConv.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
