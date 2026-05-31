import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/apiClient'

export type Thread = {
  id: string
  subject: string
  status: 'open' | 'pending' | 'closed'
  student_id: string
  student: { id: string; full_name: string }
  assigned_to: string | null
  assignee: { id: string; full_name: string } | null
  last_message_at: string
  created_at: string
}

export type Message = {
  id: string
  body: string
  sender_type: 'student' | 'team'
  sender: { id: string; full_name: string }
  created_at: string
  thread_id: string
}

export type ThreadDetail = Thread & {
  conversation_messages: Message[]
}

type ConversationFilters = {
  status?: string
  assignedTo?: string
  q?: string
}

export function useConversations(filters: ConversationFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo)
  if (filters.q) params.set('q', filters.q)
  const qs = params.toString()

  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => api.get<Thread[]>(`/api/conversations${qs ? `?${qs}` : ''}`),
  })
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => api.get<ThreadDetail>(`/api/conversations/${threadId}`),
    enabled: !!threadId,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { subject: string; message: string }) =>
      api.post<Thread>('/api/conversations', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useSendMessage(threadId: string, profile?: { id: string; full_name: string; role: string } | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      api.post<Message>(`/api/conversations/${threadId}/messages`, { body }),
    onMutate: async (newBody) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['thread', threadId] })

      // Snapshot the previous value
      const previousThread = queryClient.getQueryData<ThreadDetail>(['thread', threadId])

      // Optimistically update to the new value
      if (previousThread && profile) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          body: newBody,
          sender_type: profile.role === 'student' ? 'student' : 'team',
          sender: { id: profile.id, full_name: profile.full_name },
          created_at: new Date().toISOString(),
          thread_id: threadId,
        }

        queryClient.setQueryData<ThreadDetail>(['thread', threadId], {
          ...previousThread,
          conversation_messages: [
            ...previousThread.conversation_messages,
            optimisticMessage,
          ],
        })
      }

      return { previousThread }
    },
    onError: (_err, _newBody, context) => {
      if (context?.previousThread) {
        queryClient.setQueryData(['thread', threadId], context.previousThread)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
    },
  })
}

export function useAssignConversation(threadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignedTo: string) =>
      api.patch<Thread>(`/api/conversations/${threadId}/assign`, { assignedTo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
    },
  })
}

export function useUpdateStatus(threadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: string) =>
      api.patch<Thread>(`/api/conversations/${threadId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
    },
  })
}
