import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/apiClient'
import { supabase } from '../../lib/supabaseClient'
import { subscribeToConversations, subscribeToThreadMessages } from '../../lib/realtime'
import type {
  ConversationDetail,
  ConversationStatus,
  ConversationSummary,
} from './types'

export function useConversationsList(filters?: {
  status?: ConversationStatus
  assignedTo?: 'me' | 'unassigned'
  agentId?: string
  q?: string
}) {
  const queryClient = useQueryClient()
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo)
  if (filters?.agentId) params.set('agentId', filters.agentId)
  if (filters?.q) params.set('q', filters.q)
  const queryString = params.toString()
  const path = queryString ? `/conversations?${queryString}` : '/conversations'

  const query = useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => apiFetch<ConversationSummary[]>(path),
  })

  useEffect(() => {
    const channel = subscribeToConversations(() => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}

export function useConversation(threadId: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['conversation', threadId],
    queryFn: () => apiFetch<ConversationDetail>(`/conversations/${threadId}`),
    enabled: Boolean(threadId),
  })

  useEffect(() => {
    if (!threadId) return
    const channel = subscribeToThreadMessages(threadId, () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', threadId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [threadId, queryClient])

  return query
}

export function useSendMessage(threadId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) =>
      apiFetch(`/conversations/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', threadId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useAssignConversation(threadId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignedTo: string | null) =>
      apiFetch(`/conversations/${threadId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTo }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', threadId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUpdateConversationStatus(threadId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: ConversationStatus) =>
      apiFetch(`/conversations/${threadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', threadId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { subject: string; message: string }) =>
      apiFetch<ConversationSummary>('/conversations', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
