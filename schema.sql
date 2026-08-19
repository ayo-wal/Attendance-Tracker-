-- Attendance Tracker — Supabase schema
-- Run this in your Supabase project's SQL editor (Database > SQL Editor > New query)

-- 1. Courses table
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  code text,
  target_percent numeric not null default 75 check (target_percent > 0 and target_percent <= 100),
  color text default '#3FB6D3',
  created_at timestamptz default now()
);

-- 2. Attendance records: one row per class session
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  class_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'cancelled')),
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_attendance_course on attendance_records(course_id);
create index if not exists idx_attendance_user on attendance_records(user_id);

-- 3. Row Level Security — every user only ever sees their own rows
alter table courses enable row level security;
alter table attendance_records enable row level security;

create policy "Users manage their own courses"
  on courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own attendance records"
  on attendance_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
