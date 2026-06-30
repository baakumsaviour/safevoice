-- Run this script in your Supabase SQL Editor

-- 1. Enable Realtime for the case_messages table
begin;
  -- remove the supabase_realtime publication if it exists for case_messages (cleanup before re-adding)
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.case_messages;

-- 2. Set up the 'evidence' Storage Bucket
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

-- Set up RLS for the storage bucket
create policy "Authenticated users can upload evidence"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'evidence' );

create policy "Users can view evidence"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'evidence' );

create policy "Users can update their own evidence"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'evidence' and auth.uid() = owner );

create policy "Users can delete their own evidence"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'evidence' and auth.uid() = owner );
