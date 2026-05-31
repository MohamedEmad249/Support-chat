-- ============================================================
-- Support Chat — full schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

create type app_role as enum ('student', 'sales', 'manager');
create type conversation_status as enum ('open', 'pending', 'closed');
create type message_sender_type as enum ('student', 'team');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null,
  created_at timestamptz not null default now()
);

create table conversation_threads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id),
  assigned_to uuid references profiles(id),
  subject text not null,
  status conversation_status not null default 'open',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references conversation_threads(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  sender_type message_sender_type not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table conversation_assignment_events (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references conversation_threads(id) on delete cascade,
  from_user_id uuid references profiles(id),
  to_user_id uuid references profiles(id),
  changed_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Indexes
create index conversation_threads_student_id_idx       on conversation_threads(student_id);
create index conversation_threads_assigned_to_idx      on conversation_threads(assigned_to);
create index conversation_threads_status_idx           on conversation_threads(status);
create index conversation_threads_last_message_at_idx  on conversation_threads(last_message_at desc);
create index conversation_messages_thread_id_created_at_idx on conversation_messages(thread_id, created_at);

-- ── RLS ──────────────────────────────────────────────────────
-- Enable RLS on all tables (Worker uses service_role key so bypasses RLS,
-- but enable it for security in case direct client access is ever used)
alter table profiles                     enable row level security;
alter table conversation_threads         enable row level security;
alter table conversation_messages        enable row level security;
alter table conversation_assignment_events enable row level security;

-- Service role bypass (Cloudflare Worker uses SUPABASE_SERVICE_ROLE_KEY)
create policy "service role bypass" on profiles
  using (true) with check (true);
create policy "service role bypass" on conversation_threads
  using (true) with check (true);
create policy "service role bypass" on conversation_messages
  using (true) with check (true);
create policy "service role bypass" on conversation_assignment_events
  using (true) with check (true);
