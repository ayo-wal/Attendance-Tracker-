-- Migration v2 — run this if you already ran the original schema.sql
-- (i.e. your Supabase project already has "courses" and "attendance_records"
-- tables). This just ADDS the new columns needed for semester auto-fill,
-- quick/lazy attendance mode, and teacher labels. Safe to run once.
--
-- Run in: Supabase dashboard > SQL Editor > New query

alter table courses
  add column if not exists course_type text not null default 'theory' check (course_type in ('theory', 'sessional')),
  add column if not exists credit numeric not null default 3,
  add column if not exists total_classes integer not null default 39,
  add column if not exists tracking_mode text not null default 'quick' check (tracking_mode in ('detailed', 'quick')),
  add column if not exists manual_absences integer not null default 0,
  add column if not exists teacher1 text,
  add column if not exists teacher2 text;

alter table attendance_records
  add column if not exists teacher text;
