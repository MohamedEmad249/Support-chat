import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Env, Variables } from '../index'

export const conversationsRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// GET /api/conversations
conversationsRouter.get('/', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const { status, assignedTo, q, agentId } = c.req.query()

  let query = supabase
    .from('conversation_threads')
    .select(`
      id, subject, status, last_message_at, created_at, updated_at,
      student_id,
      student:profiles!conversation_threads_student_id_fkey(id, full_name),
      assignee:profiles!conversation_threads_assigned_to_fkey(id, full_name),
      assigned_to
    `)
    .order('last_message_at', { ascending: false })

  // Role-based scoping
  if (user.role === 'student') {
    query = query.eq('student_id', user.id)
  } else if (user.role === 'sales') {
    query = query.or(`assigned_to.is.null,assigned_to.eq.${user.id}`)
  }

  // Optional filters
  if (status) query = query.eq('status', status)
  if (user.role === 'manager' && agentId) {
    query = query.eq('assigned_to', agentId)
  } else if (assignedTo === 'me') {
    query = query.eq('assigned_to', user.id)
  } else if (assignedTo === 'unassigned') {
    query = query.is('assigned_to', null)
  }
  if (q) query = query.ilike('subject', `%${q}%`)

  const { data, error } = await query
  if (error) throw new HTTPException(500, { message: error.message })

  return c.json(data)
})

// POST /api/conversations — student only
conversationsRouter.post('/', async (c) => {
  const user = c.get('user')
  if (user.role !== 'student') {
    throw new HTTPException(403, { message: 'Only students can create conversations' })
  }

  const body = await c.req.json<{ subject: string; message: string }>()
  if (!body.subject?.trim() || !body.message?.trim()) {
    throw new HTTPException(400, { message: 'subject and message are required' })
  }

  const supabase = c.get('supabase')

  // Create thread + first message in a transaction via RPC or sequential inserts
  const { data: thread, error: threadError } = await supabase
    .from('conversation_threads')
    .insert({ student_id: user.id, subject: body.subject.trim() })
    .select()
    .single()

  if (threadError) throw new HTTPException(500, { message: threadError.message })

  const { error: msgError } = await supabase
    .from('conversation_messages')
    .insert({
      thread_id: thread.id,
      sender_id: user.id,
      sender_type: 'student',
      body: body.message.trim(),
    })

  if (msgError) throw new HTTPException(500, { message: msgError.message })

  return c.json(thread, 201)
})

// GET /api/conversations/:threadId
conversationsRouter.get('/:threadId', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const { threadId } = c.req.param()

  const { data: thread, error } = await supabase
    .from('conversation_threads')
    .select(`
      id, subject, status, last_message_at, created_at, updated_at,
      student_id,
      student:profiles!conversation_threads_student_id_fkey(id, full_name),
      assignee:profiles!conversation_threads_assigned_to_fkey(id, full_name),
      assigned_to,
      conversation_messages(
        id, body, sender_type, created_at,
        sender:profiles!conversation_messages_sender_id_fkey(id, full_name)
      )
    `)
    .eq('id', threadId)
    .order('created_at', { referencedTable: 'conversation_messages', ascending: true })
    .single()

  if (error || !thread) throw new HTTPException(404, { message: 'Thread not found' })

  // Access check
  if (user.role === 'student' && thread.student_id !== user.id) {
    throw new HTTPException(403, { message: 'Forbidden' })
  }
  if (user.role === 'sales' && thread.assigned_to !== user.id && thread.assigned_to !== null) {
    throw new HTTPException(403, { message: 'Forbidden' })
  }

  return c.json(thread)
})

// PATCH /api/conversations/:threadId/status
conversationsRouter.patch('/:threadId/status', async (c) => {
  const user = c.get('user')
  if (user.role === 'student') {
    throw new HTTPException(403, { message: 'Students cannot change status' })
  }

  const supabase = c.get('supabase')
  const { threadId } = c.req.param()
  const body = await c.req.json<{ status: string }>()

  const validStatuses = ['open', 'pending', 'closed']
  if (!validStatuses.includes(body.status)) {
    throw new HTTPException(400, { message: 'Invalid status' })
  }

  // Sales: may update unassigned queue threads or their own assigned threads
  if (user.role === 'sales') {
    const { data: thread } = await supabase
      .from('conversation_threads')
      .select('assigned_to')
      .eq('id', threadId)
      .single()
    if (
      thread?.assigned_to !== null &&
      thread?.assigned_to !== user.id
    ) {
      throw new HTTPException(403, { message: 'This conversation is assigned to another agent' })
    }
    // Auto-claim unassigned threads when changing status
    if (thread?.assigned_to === null) {
      await supabase
        .from('conversation_threads')
        .update({ assigned_to: user.id, updated_at: new Date().toISOString() })
        .eq('id', threadId)
    }
  }

  const { data, error } = await supabase
    .from('conversation_threads')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', threadId)
    .select()
    .single()

  if (error) throw new HTTPException(500, { message: error.message })
  return c.json(data)
})

// PATCH /api/conversations/:threadId/assign
conversationsRouter.patch('/:threadId/assign', async (c) => {
  const user = c.get('user')
  if (user.role === 'student') {
    throw new HTTPException(403, { message: 'Students cannot assign conversations' })
  }

  const supabase = c.get('supabase')
  const { threadId } = c.req.param()
  const body = await c.req.json<{ assignedTo: string }>()

  // Load current thread for audit log
  const { data: thread, error: fetchError } = await supabase
    .from('conversation_threads')
    .select('assigned_to')
    .eq('id', threadId)
    .single()

  if (fetchError || !thread) throw new HTTPException(404, { message: 'Thread not found' })

  // Sales can only assign unassigned threads to themselves
  if (user.role === 'sales') {
    if (thread.assigned_to !== null) {
      throw new HTTPException(403, { message: 'Thread is already assigned. Only a manager can reassign.' })
    }
    if (body.assignedTo !== user.id) {
      throw new HTTPException(403, { message: 'Sales users can only assign to themselves' })
    }
  }

  // Update thread
  const { data, error } = await supabase
    .from('conversation_threads')
    .update({ assigned_to: body.assignedTo, updated_at: new Date().toISOString() })
    .eq('id', threadId)
    .select()
    .single()

  if (error) throw new HTTPException(500, { message: error.message })

  // Record assignment event
  await supabase.from('conversation_assignment_events').insert({
    thread_id: threadId,
    from_user_id: thread.assigned_to,
    to_user_id: body.assignedTo,
    changed_by: user.id,
  })

  return c.json(data)
})
