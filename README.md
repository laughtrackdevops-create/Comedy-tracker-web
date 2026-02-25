# Comedy Tracker

A web app to track comedy shows you want to see, have seen, or have skipped.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (auth + database)
- **Routing**: React Router v6

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd comedy-tracker-web
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up Supabase

Create the following tables in your Supabase project:

**venues**
```sql
create table venues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text not null,
  state text not null,
  address text
);
```

**shows**
```sql
create table shows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  performer text not null,
  venue_id uuid references venues(id),
  show_date date not null,
  status text check (status in ('want_to_see', 'seen', 'skipped')) default 'want_to_see',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table shows enable row level security;
create policy "Users can manage their own shows"
  on shows for all using (auth.uid() = user_id);
```

### 4. Run the dev server

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
