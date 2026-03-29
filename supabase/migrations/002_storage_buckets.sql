-- Storage buckets for ISJ
insert into storage.buckets (id, name, public)
values
  ('iqra-content', 'iqra-content', true),
  ('audio-recordings', 'audio-recordings', false),
  ('gallery', 'gallery', true);

-- Public read for iqra content
create policy "Public read iqra content"
  on storage.objects for select
  using (bucket_id = 'iqra-content');

-- Admin upload to iqra content
create policy "Admin upload iqra content"
  on storage.objects for insert
  with check (
    bucket_id = 'iqra-content'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Students upload audio recordings
create policy "Students upload audio"
  on storage.objects for insert
  with check (
    bucket_id = 'audio-recordings'
    and auth.uid() is not null
  );

-- Teachers read audio recordings
create policy "Teachers read audio"
  on storage.objects for select
  using (
    bucket_id = 'audio-recordings'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- Gallery: students upload, public read
create policy "Students upload gallery"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery'
    and auth.uid() is not null
  );

create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');
