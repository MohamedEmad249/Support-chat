import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { Env, Variables } from '../index'

export const usersRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// GET /api/users/agents — sales team directory (sales + manager)
usersRouter.get('/agents', async (c) => {
  const user = c.get('user')
  if (user.role === 'student') {
    throw new HTTPException(403, { message: 'Forbidden' })
  }

  const supabase = c.get('supabase')
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('role', 'sales')
    .order('full_name')

  if (error) throw new HTTPException(500, { message: error.message })
  return c.json(data)
})

// GET /api/users/sales — manager only, for reassignment dropdown
usersRouter.get('/sales', async (c) => {
  const user = c.get('user')
  if (user.role !== 'manager') {
    throw new HTTPException(403, { message: 'Manager only' })
  }

  const supabase = c.get('supabase')
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'sales')
    .order('full_name')

  if (error) throw new HTTPException(500, { message: error.message })
  return c.json(data)
})
