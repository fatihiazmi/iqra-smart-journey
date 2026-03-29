-- ISJ Initial Schema Migration
-- Creates all tables, enums, and RLS policies

-- =============================================================================
-- Extensions
-- =============================================================================
create extension if not exists "uuid-ossp";

-- =============================================================================
-- Enums
-- =============================================================================
create type user_role as enum ('admin', 'teacher', 'student');
create type content_type as enum ('huruf', 'kalimah');
create type diagnostic_type as enum ('reading', 'writing');
create type teacher_verdict as enum ('approved', 'retry', 'override_level');
create type diagnostic_status as enum ('pending_review', 'approved', 'retry');
create type activity_type as enum ('coloring', 'tracing');
create type tasmik_status as enum ('pending', 'reviewed');
create type gallery_type as enum ('digital_coloring', 'physical_photo');

-- =============================================================================
-- Tables
-- =============================================================================

-- Schools
create table schools (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  settings   jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profiles (references auth.users)
create table profiles (
  id                uuid primary key references auth.users on delete cascade,
  role              user_role not null,
  school_id         uuid not null references schools(id) on delete cascade,
  full_name         text not null,
  avatar            text,
  pin               text,
  current_iqra_level int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Iqra Content
create table iqra_content (
  id                   uuid primary key default uuid_generate_v4(),
  school_id            uuid not null references schools(id) on delete cascade,
  level                int not null check (level >= 0 and level <= 6),
  page_number          int not null,
  content_type         content_type not null,
  label                text not null,
  image_url            text,
  audio_url            text,
  rhythm_audio_url     text,
  tracing_template_url text,
  sort_order           int not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  unique (school_id, level, page_number, sort_order)
);

-- Diagnostic Attempts
create table diagnostic_attempts (
  id                  uuid primary key default uuid_generate_v4(),
  student_id          uuid not null references profiles(id) on delete cascade,
  diagnostic_type     diagnostic_type not null,
  audio_recording_url text,
  web_speech_result   jsonb,
  canvas_data         jsonb,
  score               numeric,
  suggested_level     int,
  teacher_verdict     teacher_verdict,
  status              diagnostic_status not null default 'pending_review',
  created_at          timestamptz not null default now()
);

-- Student Progress
create table student_progress (
  id               uuid primary key default uuid_generate_v4(),
  student_id       uuid not null unique references profiles(id) on delete cascade,
  current_level    int not null default 0,
  current_page     int not null default 0,
  pages_completed  int not null default 0,
  total_stars      int not null default 0,
  streak_count     int not null default 0,
  streak_last_date date,
  last_activity_at timestamptz
);

-- Activity Results
create table activity_results (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references profiles(id) on delete cascade,
  content_id      uuid not null references iqra_content(id) on delete cascade,
  activity_type   activity_type not null,
  completion_data jsonb,
  completed_at    timestamptz not null default now()
);

-- Tasmik Queue
create table tasmik_queue (
  id                    uuid primary key default uuid_generate_v4(),
  student_id            uuid not null references profiles(id) on delete cascade,
  diagnostic_attempt_id uuid not null references diagnostic_attempts(id) on delete cascade,
  teacher_id            uuid references profiles(id) on delete set null,
  status                tasmik_status not null default 'pending',
  teacher_notes         text,
  created_at            timestamptz not null default now(),
  reviewed_at           timestamptz
);

-- Student Gallery
create table student_gallery (
  id                 uuid primary key default uuid_generate_v4(),
  student_id         uuid not null references profiles(id) on delete cascade,
  content_id         uuid not null references iqra_content(id) on delete cascade,
  gallery_type       gallery_type not null,
  image_url          text not null,
  teacher_annotation text,
  created_at         timestamptz not null default now()
);

-- Parent Share Links
create table parent_share_links (
  id         uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  token      text not null unique default encode(gen_random_bytes(32), 'hex'),
  created_by uuid not null references profiles(id) on delete cascade,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Indexes
-- =============================================================================
create index idx_profiles_school_id on profiles(school_id);
create index idx_profiles_role on profiles(role);
create index idx_iqra_content_school_level on iqra_content(school_id, level);
create index idx_diagnostic_attempts_student on diagnostic_attempts(student_id);
create index idx_diagnostic_attempts_status on diagnostic_attempts(status);
create index idx_activity_results_student on activity_results(student_id);
create index idx_tasmik_queue_teacher on tasmik_queue(teacher_id);
create index idx_tasmik_queue_status on tasmik_queue(status);
create index idx_student_gallery_student on student_gallery(student_id);
create index idx_parent_share_links_token on parent_share_links(token);
create index idx_parent_share_links_student on parent_share_links(student_id);

-- =============================================================================
-- Enable Row Level Security
-- =============================================================================
alter table schools enable row level security;
alter table profiles enable row level security;
alter table iqra_content enable row level security;
alter table diagnostic_attempts enable row level security;
alter table student_progress enable row level security;
alter table activity_results enable row level security;
alter table tasmik_queue enable row level security;
alter table student_gallery enable row level security;
alter table parent_share_links enable row level security;

-- =============================================================================
-- Helper: get current user's profile
-- =============================================================================
create or replace function auth_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function auth_user_school_id()
returns uuid as $$
  select school_id from profiles where id = auth.uid()
$$ language sql security definer stable;

-- =============================================================================
-- RLS Policies: schools
-- =============================================================================
create policy "School members can read own school"
  on schools for select
  using (id = auth_user_school_id());

create policy "Admins can manage own school"
  on schools for all
  using (id = auth_user_school_id() and auth_user_role() = 'admin');

-- =============================================================================
-- RLS Policies: profiles
-- =============================================================================
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Teachers and admins can read school members"
  on profiles for select
  using (
    school_id = auth_user_school_id()
    and auth_user_role() in ('teacher', 'admin')
  );

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Admins can manage school profiles"
  on profiles for all
  using (
    school_id = auth_user_school_id()
    and auth_user_role() = 'admin'
  );

-- =============================================================================
-- RLS Policies: iqra_content
-- =============================================================================
create policy "School members can read content"
  on iqra_content for select
  using (school_id = auth_user_school_id());

create policy "Admins can manage content"
  on iqra_content for all
  using (
    school_id = auth_user_school_id()
    and auth_user_role() = 'admin'
  );

-- =============================================================================
-- RLS Policies: diagnostic_attempts
-- =============================================================================
create policy "Students can create own diagnostic attempts"
  on diagnostic_attempts for insert
  with check (student_id = auth.uid());

create policy "Students can read own diagnostic attempts"
  on diagnostic_attempts for select
  using (student_id = auth.uid());

create policy "Teachers can read school diagnostic attempts"
  on diagnostic_attempts for select
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

create policy "Teachers can update school diagnostic attempts"
  on diagnostic_attempts for update
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

-- =============================================================================
-- RLS Policies: student_progress
-- =============================================================================
create policy "Students can read own progress"
  on student_progress for select
  using (student_id = auth.uid());

create policy "Students can update own progress"
  on student_progress for update
  using (student_id = auth.uid());

create policy "Teachers can read school student progress"
  on student_progress for select
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

-- =============================================================================
-- RLS Policies: activity_results
-- =============================================================================
create policy "Students can create own activity results"
  on activity_results for insert
  with check (student_id = auth.uid());

create policy "Students can read own activity results"
  on activity_results for select
  using (student_id = auth.uid());

create policy "Teachers can read school activity results"
  on activity_results for select
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

-- =============================================================================
-- RLS Policies: tasmik_queue
-- =============================================================================
create policy "Students can create tasmik entries"
  on tasmik_queue for insert
  with check (student_id = auth.uid());

create policy "Students can read own tasmik entries"
  on tasmik_queue for select
  using (student_id = auth.uid());

create policy "Teachers can manage school tasmik queue"
  on tasmik_queue for all
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

-- =============================================================================
-- RLS Policies: student_gallery
-- =============================================================================
create policy "Students can read own gallery"
  on student_gallery for select
  using (student_id = auth.uid());

create policy "Students can create own gallery entries"
  on student_gallery for insert
  with check (student_id = auth.uid());

create policy "Teachers can manage school gallery"
  on student_gallery for all
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

-- =============================================================================
-- RLS Policies: parent_share_links
-- =============================================================================
create policy "Teachers can manage parent share links"
  on parent_share_links for all
  using (
    auth_user_role() in ('teacher', 'admin')
    and student_id in (
      select id from profiles where school_id = auth_user_school_id()
    )
  );

-- =============================================================================
-- Updated_at trigger
-- =============================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on schools
  for each row execute function update_updated_at();

create trigger set_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at before update on iqra_content
  for each row execute function update_updated_at();
