import { supabase } from './supabaseClient'
import type { QueryClient } from '@tanstack/react-query'

/**
 * Subscribe to new messages and thread updates for a single conversation.
 * Call inside a useEffect — returns an unsubscribe function.
 */
export function subscribeToThread(
  threadId: string,
  queryClient: QueryClient,
) {
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `thread_id=eq.${threadId}`,
      },
      () => {
        console.log(`Realtime: Message inserted in thread ${threadId}`)
        queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_threads',
        filter: `id=eq.${threadId}`,
      },
      () => {
        console.log(`Realtime: Thread updated for thread ${threadId}`)
        queryClient.invalidateQueries({ queryKey: ['thread', threadId] })
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Realtime: Subscribed to thread:${threadId}`)
      } else {
        console.warn(`Realtime status for thread:${threadId}:`, status, err)
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to conversation list changes (for inbox pages).
 */
export function subscribeToConversations(queryClient: QueryClient) {
  const channel = supabase
    .channel('conversations:inbox')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversation_threads' },
      () => {
        console.log('Realtime: Conversations list updated')
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Realtime: Subscribed to conversations:inbox')
      } else {
        console.warn('Realtime status for conversations:inbox:', status, err)
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
