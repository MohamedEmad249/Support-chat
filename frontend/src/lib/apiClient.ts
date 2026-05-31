import { supabase } from './supabaseClient'

const API_BASE = import.meta.env.VITE_API_URL as string
console.log('API_BASE:', API_BASE)

// const API_BASE = '/api'

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const token = accessToken ?? (await getAccessToken())
  if (!token) {
    throw new ApiError('Not authenticated', 401)
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const normalizedPath = path.startsWith('/api') ? path : `/api${path}`
  const res = await fetch(`${API_BASE}${normalizedPath}`, { ...options, headers })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string }
    throw new ApiError(payload.error ?? res.statusText, res.status)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

/** Public API call (no JWT), e.g. sign-up */
export async function publicApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const normalizedPath = path.startsWith('/api') ? path : `/api${path}`
  const res = await fetch(`${API_BASE}${normalizedPath}`, { ...options, headers })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string }
    throw new ApiError(payload.error ?? res.statusText, res.status)
  }

  return res.json() as Promise<T>
}
