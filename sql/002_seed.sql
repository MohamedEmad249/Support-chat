-- ============================================================
-- Seed — demo users
-- All passwords: demo1234
--
-- HOW TO RUN:
-- 1. Create users manually in Supabase Dashboard → Authentication → Users
--    OR use the auth.users insert below (works in SQL editor with service role)
-- 2. Then run the profiles inserts.
--
-- Replace the UUIDs below with the actual UUIDs Supabase assigns.
-- ============================================================

-- Step 1: Create auth users (Supabase will hash the password)
-- Use Dashboard → Auth → Users → "Invite user" or "Add user" for each,
-- then copy their UUIDs into the profiles insert below.

-- Alternatively, insert directly (SQL Editor runs as postgres role):
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role
) values
  (
    '00000000-0000-0000-0000-000000000001',
    'student@demo.com',
    crypt('demo1234', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'sales1@demo.com',
    crypt('demo1234', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'sales2@demo.com',
    crypt('demo1234', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'manager@demo.com',
    crypt('demo1234', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated'
  );

-- Step 2: Create profiles (role assignment happens here)
insert into profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Alex Student',   'student'),
  ('00000000-0000-0000-0000-000000000002', 'Sam Sales',      'sales'),
  ('00000000-0000-0000-0000-000000000003', 'Jordan Sales',   'sales'),
  ('00000000-0000-0000-0000-000000000004', 'Morgan Manager', 'manager');
