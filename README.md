# Attendance Tracker — Mecha Verse

A lightweight web app for tracking class attendance. Each student signs up with
their own account, adds their courses, logs each class as present/absent/
cancelled, and gets a live read on whether they're safely above the required
attendance % — or how many classes they need to attend in a row to get back
above it.

Built with **Vite + React**, **Supabase** (auth + database), and **Tailwind CSS**.

## 1. Create the Supabase project (backend)

1. Go to [supabase.com](https://supabase.com) → create a free account → **New project**.
2. Once it's created, open **SQL Editor** → **New query**, paste in the
   contents of `supabase/schema.sql` from this repo, and run it. This creates
   the `courses` and `attendance_records` tables with row-level security, so
   every student can only ever see their own data.
3. Go to **Project Settings → API**. You'll need two values from here:
   - **Project URL**
   - **anon / public key**
4. (Optional but recommended) Under **Authentication → Providers → Email**,
   you can turn off "Confirm email" during testing so new accounts don't need
   email verification. Turn it back on before real students start using it.

## 2. Run it locally

```bash
npm install
cp .env.example .env
# then paste your Project URL and anon key into .env
npm run dev
```

Open the local URL it prints (usually `http://localhost:5173`).

## 3. Deploy (Netlify)

1. Push this repo to GitHub.
2. On [netlify.com](https://netlify.com), **Add new site → Import an existing
   project**, and pick the repo.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Under **Site settings → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Every student who visits the site can now create their own account.

## How the attendance math works

- Only **present** and **absent** classes count toward the percentage.
  **Cancelled** classes are excluded entirely (they don't help or hurt you).
- The dashboard tells you, based on your target %:
  - If you're **above target**: the max number of additional classes you
    could miss and still stay at/above target.
  - If you're **below target**: how many classes in a row you need to attend
    to climb back above target.

## Project structure

```
src/
  components/       Reusable UI: gauge, course card, add-course modal
  context/          Supabase auth state (AuthContext)
  lib/              Supabase client + attendance % / projection math
  pages/            Auth, Dashboard, CourseDetail
supabase/
  schema.sql        Run this once in the Supabase SQL editor
```

## Customizing for Mecha Verse

- Swap the "Mecha Verse" label and colors in `src/index.css` (`@theme` block)
  and `src/pages/Auth.jsx` / `Dashboard.jsx` headers.
- To require a specific email domain (e.g. only `@student.ruet.ac.bd`) at
  signup, add a check in Supabase's **Authentication → Providers → Email**
  or validate in `src/pages/Auth.jsx` before calling `signUp`.
