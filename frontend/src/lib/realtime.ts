import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export function subscribeToThreadMessages(
  threadId: string,
  onInsert: () => void,
): RealtimeChannel {
  return supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `thread_id=eq.${threadId}`,
      },
      () => onInsert(),
    )
    .subscribe()
}

export function subscribeToConversations(onChange: () => void): RealtimeChannel {
  return supabase
    .channel('conversations-list')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversation_threads' },
      () => onChange(),
    )
    .subscribe()
}
