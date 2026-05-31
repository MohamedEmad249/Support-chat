import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { authMiddleware } from './middleware/auth'
import { conversationsRouter } from './routes/conversations'
import { messagesRouter } from './routes/messages'
import { usersRouter } from './routes/users'
import { makeSupabaseAdmin } from './lib/supabaseAdmin'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Env = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_ANON_KEY: string
}

export type Profile = {
  id: string
  full_name: string
  role: 'student' | 'sales' | 'manager'
  created_at: string
}

export type Variables = {
  user: Profile
  supabase: SupabaseClient
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*'
    if (
      origin.startsWith('http://localhost') ||
      origin.endsWith('.pages.dev') ||
      origin.endsWith('.workers.dev')
    ) return origin
    return origin
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.get('/api/health', (c) => c.json({ ok: true }))

app.post('/api/auth/signup', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; fullName?: string }>()
  if (!body.email?.trim() || !body.password?.trim() || !body.fullName?.trim()) {
    throw new HTTPException(400, { message: 'email, password, and fullName are required' })
  }

  const supabase = makeSupabaseAdmin(c.env)
  const { data, error } = await supabase.auth.admin.createUser({
    email: body.email.trim().toLowerCase(),
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.fullName.trim() }
  })

  if (error) {
    throw new HTTPException(400, { message: error.message })
  }

  return c.json({ user: data.user }, 201)
})

app.use('/api/me', authMiddleware)
app.use('/api/conversations/*', authMiddleware)
app.use('/api/users/*', authMiddleware)

app.get('/api/me', (c) => c.json(c.get('user')))

app.route('/api/conversations', conversationsRouter)
app.route('/api/conversations', messagesRouter)
app.route('/api/users', usersRouter)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app