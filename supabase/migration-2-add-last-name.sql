-- ============================================================================
-- Migration 2 — add last_name to leads + submissions
-- Run this ONCE in Supabase → SQL Editor if your tables were created before
-- the last-name field was added. Safe to re-run (IF NOT EXISTS).
-- ============================================================================

alter table public.leads        add column if not exists last_name text;
alter table public.submissions  add column if not exists last_name text;
