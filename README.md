# UniSupport — Student Support Chat Platform

A complete, high-performance, real-time student support chat application built on modern serverless technologies.

It facilitates real-time chat between students, sales agents, and managers with dedicated views tailored for each role.

---

## Role Definitions & Features

### 🎓 Student
Students have a streamlined, distraction-free inbox interface to open support conversations and chat in real-time.
* **Inbox & Conversations**: View active/closed support requests and start new support threads.
* **Settings**: Manage profile information, appearance (theme and primary color), and account security.
* **No Dashboard**: Direct redirection to the conversations view to ensure a distraction-free experience.

### 💼 Sales Agent
Sales agents manage the support queue, taking ownership of incoming threads.
* **Dashboard**: Monitor active support metrics, category breakdown charts, and average resolution times.
* **Conversations**: Assign unassigned tickets, message students in real-time, and update conversation status (`open`, `pending`, `closed`).
* **Settings & Analytics**: Track ticket history and update personal settings.

### 👑 Manager
Managers have full visibility over operations, with advanced metrics and reassignment features.
* **Dashboard**: Monitor high-level KPIs and operational charts.
* **Conversations & Reassignment**: Manually assign and transfer tickets between sales agents.
* **Support Agents Management**: Add, view, and manage sales agents on the platform.
* **Settings & Analytics**: In-depth analytics dashboards and system configurations.

---

## Technology Stack

* **Frontend**: React + Vite + TypeScript + Tailwind CSS (using `@tailwindcss/vite` and PostCSS) + TanStack Query + Lucide Icons + Radix UI (Shadcn components)
* **Backend Worker**: Cloudflare Workers + Hono Web Framework
* **Database & Auth**: Supabase (PostgreSQL with RLS, Realtime Channel subscription, and Supabase Auth)

---

## Setup & Deployment

### 1. Database & Schema Setup (Supabase)
1. Create a new Supabase project.
2. Under **Dashboard → SQL Editor → New query**, run the SQL files in order:
   * `sql/001_schema.sql` (Creates profiles, conversation threads, messages, and RLS bypasses)
   * `sql/002_seed.sql` (Inserts demo users for testing)
   * `sql/003_profile_trigger.sql` (Trigger function for automatic profile creation upon new user sign-up)
3. In your Supabase Dashboard under **Authentication → Settings**, disable **Confirm email** to allow instant testing and local sign-ups.

### 2. Backend API Setup (Cloudflare Workers)
Navigate to the `worker` directory and install dependencies:
```bash
cd worker
npm install
```
Configure your environment secrets:
1. Create a `.dev.vars` file in the `worker` directory by copying `.dev.vars.example`.
2. Fill in your Supabase Project URL and **Service Role Key** (required for administrative auth operations):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
Run locally:
```bash
npm run dev
```
To deploy to production Cloudflare Workers:
```bash
npm run deploy
```

### 3. Frontend App Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```
Configure environment variables:
1. Create a `.env.local` file by copying `.env.example`.
2. Populate the environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=http://localhost:8787 # Or your deployed Cloudflare Worker URL
   ```
Run locally:
```bash
npm run dev
```
To build the production assets:
```bash
npm run build
```

---

## Demo Credentials & Flow

All seeded demo accounts share the password: **`demo1234`**

| Role | Email | Features |
|---|---|---|
| **Student** | `student@demo.com` | Conversations Inbox & Settings (Inbox is landing page) |
| **Sales** | `sales1@demo.com` | Dashboard, Active/Unassigned queues, Settings |
| **Sales** | `sales2@demo.com` | Dashboard, Active/Unassigned queues, Settings |
| **Manager** | `manager@demo.com` | Dashboard, Reassignment queue, Agent management |

### Quick Test Flow:
1. Log in to the application as `student@demo.com` and submit a new ticket.
2. In a separate browser tab, log in as `sales1@demo.com`. Go to **Conversations**, select the student's ticket, and click **Assign to me**.
3. Send a message back and forth to experience **real-time chat** powered by Supabase Realtime Channels.
4. Log in as `manager@demo.com` and use the manager interface to reassign the ticket to `sales2@demo.com`.

---

## Project Structure

```
├── sql/                              # Supabase DB setup files
│   ├── 001_schema.sql                # Table definitions, RLS, and indexes
│   ├── 002_seed.sql                  # Seed data containing demo credentials
│   └── 003_profile_trigger.sql        # Trigger function for auth-to-profile mapping
│
├── worker/                           # Cloudflare Worker API (Hono)
│   ├── src/
│   │   ├── index.ts                  # Hono routing & middleware configurations
│   │   ├── lib/
│   │   │   └── supabaseAdmin.ts      # Supabase Admin client initializer
│   │   └── routes/
│   │       ├── conversations.ts      # Conversation fetch and management routes
│   │       ├── messages.ts           # Message creation and delivery routes
│   │       └── users.ts              # Agent retrieval API (for managers)
│
└── frontend/                         # React Frontend (Vite)
    ├── src/
    │   ├── app/
    │   │   ├── App.tsx               # Main React entry component
    │   │   ├── routes.tsx            # React Router configurations
    │   │   ├── pages/                # Application page views
    │   │   │   ├── auth-page.tsx
    │   │   │   ├── main-dashboard.tsx
    │   │   │   ├── conversations-page.tsx
    │   │   │   ├── agent-management-page.tsx
    │   │   │   ├── analytics-page.tsx
    │   │   │   └── settings-page.tsx
    │   │   └── layouts/
    │   │       └── dashboard-layout.tsx # Standard layout wrapper with role sidebar
    │   │
    │   ├── features/
    │   │   ├── auth/                 # Auth context and Protected Route guard
    │   │   ├── conversations/        # Conversation query hooks and utilities
    │   │   └── preferences/          # Application theme & configuration manager
    │   │
    │   └── lib/
    │       ├── apiClient.ts          # Safe wrapper for fetch API
    │       └── supabaseClient.ts     # Supabase browser client
```
