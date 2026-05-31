import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { makeSupabaseAdmin } from '../lib/supabaseAdmin'
import type { Env, Variables } from '../index'

function decodeJWT(token: string): { sub: string; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.slice(7)
    const payload = decodeJWT(token)

    if (!payload?.sub) {
      throw new HTTPException(401, { message: 'Invalid token' })
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new HTTPException(401, { message: 'Token expired' })
    }

    const supabase = makeSupabaseAdmin(c.env)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('id', payload.sub)
      .single()

    if (error || !profile) {
      console.error('Profile lookup failed:', JSON.stringify(error))
      throw new HTTPException(403, { message: 'No profile found for this user' })
    }

    c.set('user', profile as any)
    c.set('supabase', supabase)
    await next()
  }
)