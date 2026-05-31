import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/apiClient'
import type { UserProfile } from '../conversations/types'

export function useSalesAgents(enabled = true) {
  return useQuery({
    queryKey: ['sales-agents'],
    queryFn: () => apiFetch<UserProfile[]>('/users/agents'),
    enabled,
  })
}
