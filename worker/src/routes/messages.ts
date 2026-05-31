import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Env, Variables } from '../index'

export const messagesRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// POST /api/conversations/:threadId/messages
messagesRouter.post('/:threadId/messages', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const { threadId } = c.req.param()

  const body = await c.req.json<{ body: string }>()
  if (!body.body?.trim()) {
    throw new HTTPException(400, { message: 'Message body is required' })
  }

  // Load thread to verify access
  const { data: thread, error: fetchError } = await supabase
    .from('conversation_threads')
    .select('id, student_id, assigned_to, status')
    .eq('id', threadId)
    .single()

  if (fetchError || !thread) throw new HTTPException(404, { message: 'Thread not found' })
  if (thread.status === 'closed') throw new HTTPException(400, { message: 'Thread is closed' })

  // Access check
  if (user.role === 'student' && thread.student_id !== user.id) {
    throw new HTTPException(403, { message: 'Forbidden' })
  }
  if (user.role === 'sales' && thread.assigned_to !== user.id) {
    throw new HTTPException(403, { message: 'You can only reply to threads assigned to you' })
  }

  const senderType = user.role === 'student' ? 'student' : 'team'

  const { data: message, error } = await supabase
    .from('conversation_messages')
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      sender_type: senderType,
      body: body.body.trim(),
    })
    .select(`
      id, body, sender_type, created_at, thread_id,
      sender:profiles!conversation_messages_sender_id_fkey(id, full_name)
    `)
    .single()

  if (error) throw new HTTPException(500, { message: error.message })

  // Bump last_message_at on the thread
  await supabase
    .from('conversation_threads')
    .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', threadId)

  return c.json(message, 201)
})
