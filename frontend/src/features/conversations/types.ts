export type ConversationStatus = 'open' | 'pending' | 'closed'

export type ProfileRef = {
  id: string
  full_name: string
}

export type ConversationSummary = {
  id: string
  subject: string
  status: ConversationStatus
  last_message_at: string
  created_at: string
  updated_at: string
  student_id: string
  assigned_to: string | null
  student: ProfileRef
  assignee: ProfileRef | null
}

export type ConversationMessage = {
  id: string
  body: string
  sender_type: 'student' | 'team'
  created_at: string
  sender: ProfileRef
}

export type ConversationDetail = ConversationSummary & {
  conversation_messages: ConversationMessage[]
}

export type UserProfile = {
  id: string
  full_name: string
  role: 'student' | 'sales' | 'manager'
  created_at: string
}
