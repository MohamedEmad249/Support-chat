import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../features/auth/useAuth'
import {
  useThread,
  useSendMessage,
  useAssignConversation,
  useUpdateStatus,
} from '../features/conversations/useConversations'
import { subscribeToThread } from '../lib/realtime'
import { api } from '../lib/apiClient'
import { useQuery } from '@tanstack/react-query'

type SalesUser = { id: string; full_name: string; role: string }

export default function ConversationPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const { state, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [showReassign, setShowReassign] = useState(false)
  const [reassignTo, setReassignTo] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const profile = state.status === 'authenticated' ? state.profile : null
  const { data: thread, isLoading, error } = useThread(threadId!)
  const sendMessage = useSendMessage(threadId!, profile)
  const assignConv = useAssignConversation(threadId!)
  const updateStatus = useUpdateStatus(threadId!)

  // Sales users for reassign dropdown (manager only)
  const { data: salesUsers } = useQuery({
    queryKey: ['sales-users'],
    queryFn: () => api.get<SalesUser[]>('/api/users/sales'),
    enabled: profile?.role === 'manager',
  })

  // Realtime subscription
  useEffect(() => {
    if (!threadId) return
    return subscribeToThread(threadId, queryClient)
  }, [threadId, queryClient])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.conversation_messages?.length])

  const backPath = profile?.role === 'student' ? '/student'
    : profile?.role === 'sales' ? '/sales'
    : '/manager'

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setBody('')
    try {
      await sendMessage.mutateAsync(text)
    } catch (err) {
      console.error(err)
      setBody(text)
    }
  }

  async function handleAssignToMe() {
    if (!profile) return
    await assignConv.mutateAsync(profile.id)
  }

  async function handleReassign(e: React.FormEvent) {
    e.preventDefault()
    if (!reassignTo) return
    await assignConv.mutateAsync(reassignTo)
    setShowReassign(false)
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>
  }
  if (error || !thread) {
    return <div className="flex h-screen items-center justify-center text-sm text-destructive">{error?.message ?? 'Not found'}</div>
  }

  const canSend = !!(
    thread.status !== 'closed' &&
    (profile?.role === 'student' || thread.assigned_to === profile?.id)
  )
  const canAssignToSelf = profile?.role === 'sales' && !thread.assigned_to
  const canReassign = profile?.role === 'manager'
  const canChangeStatus = profile?.role === 'sales' || profile?.role === 'manager'

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backPath)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <div>
            <h1 className="font-semibold">{thread.subject}</h1>
            <p className="text-xs text-muted-foreground">
              {thread.student.full_name} ·{' '}
              {thread.assignee ? `Assigned to ${thread.assignee.full_name}` : 'Unassigned'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            thread.status === 'open' ? 'bg-green-100 text-green-700' :
            thread.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {thread.status}
          </span>

          {canChangeStatus && (
            <select
              value={thread.status}
              onChange={(e) => updateStatus.mutate(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          )}

          {canAssignToSelf && (
            <button
              onClick={handleAssignToMe}
              disabled={assignConv.isPending}
              className="inline-flex h-7 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Assign to me
            </button>
          )}

          {canReassign && (
            <button
              onClick={() => setShowReassign(true)}
              className="inline-flex h-7 items-center rounded-md border px-3 text-xs hover:bg-accent"
            >
              Reassign
            </button>
          )}

          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {thread.conversation_messages.map((msg) => {
          const isOwn = msg.sender.id === profile?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.full_name}</p>
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className="text-xs opacity-50 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      {canSend ? (
        <form onSubmit={handleSend} className="border-t px-6 py-3 flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !body.trim()}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="border-t px-6 py-3 text-center text-sm text-muted-foreground">
          {thread.status === 'closed'
            ? 'This conversation is closed.'
            : 'You cannot reply to this conversation.'}
        </div>
      )}

      {/* Reassign Dialog */}
      {showReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold">Reassign Conversation</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Current owner: {thread.assignee?.full_name ?? 'Unassigned'}
            </p>
            <form onSubmit={handleReassign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">New owner</label>
                <select
                  required
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select sales user…</option>
                  {salesUsers?.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              {assignConv.error && (
                <p className="text-sm text-destructive">{assignConv.error.message}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReassign(false)}
                  className="inline-flex h-9 items-center rounded-md border px-4 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignConv.isPending}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {assignConv.isPending ? 'Reassigning…' : 'Reassign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
