-- ============================================================================
-- AI Leadership Readiness Scorecard — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL → New query).
--
-- Security model:
--   * site_content is publicly READABLE (anon) so the landing page / quiz can
--     render. It is only WRITABLE via the service-role key (admin API).
--   * leads + submissions have NO anon policies: they are only reachable
--     through the serverless API using the SUPABASE_SECRET_KEY (service role),
--     which bypasses RLS. The browser never reads or writes them directly.
-- ============================================================================

-- ---------- editable site + quiz copy (key/value JSON) ----------
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- public read
drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read"
  on public.site_content for select
  to anon, authenticated
  using (true);
-- (no insert/update/delete policies → only service role can write)

-- ---------- leads ----------
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  email        text not null,
  company      text,
  role_level   text,
  company_size text,
  phone        text,
  status       text not null default 'started', -- started | completed
  ai_interests text[] default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
-- no anon policies on purpose

-- ---------- submissions (one completed scorecard) ----------
create table if not exists public.submissions (
  id               uuid primary key default gen_random_uuid(),
  lead_id          uuid references public.leads (id) on delete set null,
  first_name       text,
  email            text,
  company          text,
  role_level       text,
  company_size     text,
  knowledge_score  numeric(3,1),
  mindset_score    numeric(3,1),
  skills_score     numeric(3,1),
  leadership_score numeric(3,1),
  overall_score    numeric(3,1) not null,
  overall_tier     text not null,
  lowest_category  text,
  not_sure_count   int default 0,
  ai_interests     text[] default '{}',
  answers          jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists submissions_created_idx on public.submissions (created_at desc);

alter table public.submissions enable row level security;
-- no anon policies on purpose

-- ---------- aggregate benchmark view (company average + quartiles) ----------
-- Used to draw the "company average" + high/low quartile lines on the chart.
create or replace view public.benchmark_stats as
select
  count(*)                                                            as n,
  round(avg(knowledge_score)::numeric, 2)                            as knowledge_avg,
  round(avg(mindset_score)::numeric, 2)                              as mindset_avg,
  round(avg(skills_score)::numeric, 2)                               as skills_avg,
  round(avg(leadership_score)::numeric, 2)                           as leadership_avg,
  round((percentile_cont(0.25) within group (order by knowledge_score))::numeric, 2)  as knowledge_p25,
  round((percentile_cont(0.75) within group (order by knowledge_score))::numeric, 2)  as knowledge_p75,
  round((percentile_cont(0.25) within group (order by mindset_score))::numeric, 2)    as mindset_p25,
  round((percentile_cont(0.75) within group (order by mindset_score))::numeric, 2)    as mindset_p75,
  round((percentile_cont(0.25) within group (order by skills_score))::numeric, 2)     as skills_p25,
  round((percentile_cont(0.75) within group (order by skills_score))::numeric, 2)     as skills_p75,
  round((percentile_cont(0.25) within group (order by leadership_score))::numeric, 2) as leadership_p25,
  round((percentile_cont(0.75) within group (order by leadership_score))::numeric, 2) as leadership_p75
from public.submissions;
