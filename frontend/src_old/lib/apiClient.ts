const API_BASE = import.meta.env.VITE_API_URL as string

let _token: string | null = null

export function setToken(token: string | null) {
  _token = token
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!_token) throw new Error('Not authenticated')
  console.log('fetching:', `${API_BASE}${path}`)
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
}