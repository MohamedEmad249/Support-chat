import { formatDistanceToNow } from 'date-fns'
import type { ConversationStatus } from './types'

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

export function formatStatusLabel(status: ConversationStatus): string {
  const labels: Record<ConversationStatus, string> = {
    open: 'Open',
    pending: 'Pending',
    closed: 'Resolved',
  }
  return labels[status]
}

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
