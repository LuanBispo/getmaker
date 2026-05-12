-- ============================================================
-- GetMaker — Schema SQL
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enum types ───────────────────────────────────────────────
-- (usando text com check constraints para facilitar migrações futuras)

-- ─── Tabela: profiles ─────────────────────────────────────────
-- Vinculada ao auth.users. Guarda role e dados básicos.

create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'technician')),
  name        text,
  email       text,
  whatsapp    text,
  city_state  text,
  created_at  timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

comment on table public.profiles is 'Perfis de usuários autenticados (técnicos e admin)';

-- ─── Tabela: technicians ──────────────────────────────────────
-- Dados extras dos técnicos, separados para futuro ranking/planos.

create table public.technicians (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text not null,
  email                 text not null,
  whatsapp              text,
  city_state            text,
  specialties           text[],
  closed_projects_count integer not null default 0,
  created_at            timestamptz not null default now(),
  constraint technicians_user_id_key unique (user_id)
);

comment on table public.technicians is 'Dados dos técnicos cadastrados pelo admin';

-- ─── Tabela: projects ─────────────────────────────────────────

create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  client_name      text not null,
  client_whatsapp  text not null,
  description      text not null,
  city_state       text,
  budget_range     text,
  urgency          text check (urgency in ('low', 'medium', 'high')),
  status           text not null default 'new'
                   check (status in ('new', 'analyzing', 'sent_to_technicians',
                                     'negotiating', 'closed', 'cancelled')),
  created_at       timestamptz not null default now()
);

comment on table public.projects is 'Projetos enviados pelos clientes (sem login)';

-- ─── Tabela: project_interests ────────────────────────────────

create table public.project_interests (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  technician_id uuid not null references public.technicians(id) on delete cascade,
  created_at    timestamptz not null default now(),
  constraint project_interests_unique unique (project_id, technician_id)
);

comment on table public.project_interests is 'Registro de interesse de técnicos em projetos';

-- ─── Tabela futura: project_closures ──────────────────────────
-- Estrutura preparada, não usada no MVP.

create table public.project_closures (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  technician_id uuid not null references public.technicians(id) on delete cascade,
  closed_value  numeric(12, 2),
  admin_notes   text,
  created_at    timestamptz not null default now(),
  constraint project_closures_project_id_key unique (project_id)
);

comment on table public.project_closures is 'Registro de projetos fechados (futuro)';

-- ─── Índices ──────────────────────────────────────────────────

create index idx_profiles_user_id        on public.profiles(user_id);
create index idx_technicians_user_id     on public.technicians(user_id);
create index idx_projects_status         on public.projects(status);
create index idx_projects_created_at     on public.projects(created_at desc);
create index idx_interests_project_id    on public.project_interests(project_id);
create index idx_interests_technician_id on public.project_interests(technician_id);

-- ─── Row Level Security ───────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.technicians       enable row level security;
alter table public.projects          enable row level security;
alter table public.project_interests enable row level security;
alter table public.project_closures  enable row level security;

-- profiles: usuário vê/atualiza apenas o próprio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id);

-- profiles: somente service_role pode inserir (via API de admin)
-- (não é necessária policy de insert para anon/authenticated)

-- technicians: usuários autenticados podem listar técnicos
create policy "technicians_select_authenticated"
  on public.technicians for select
  using (auth.role() = 'authenticated');

-- projects: qualquer um pode inserir (clientes sem login)
create policy "projects_insert_anyone"
  on public.projects for insert
  with check (true);

-- projects: somente autenticados podem visualizar
create policy "projects_select_authenticated"
  on public.projects for select
  using (auth.role() = 'authenticated');

-- projects: update via service_role (API route /api/projects/[id]/status)
-- A verificação de role=admin é feita na API, não no RLS
-- Para o RLS, permitimos update para autenticados e deixamos a lógica na API
create policy "projects_update_authenticated"
  on public.projects for update
  using (auth.role() = 'authenticated');

-- project_interests: técnicos inserem o próprio interesse
create policy "interests_insert_own_technician"
  on public.project_interests for insert
  with check (
    auth.uid() is not null
    and technician_id in (
      select id from public.technicians where user_id = auth.uid()
    )
  );

-- project_interests: autenticados podem visualizar
create policy "interests_select_authenticated"
  on public.project_interests for select
  using (auth.role() = 'authenticated');

-- project_closures: somente leitura para autenticados (escrita via service_role)
create policy "closures_select_authenticated"
  on public.project_closures for select
  using (auth.role() = 'authenticated');

-- ─── Como criar o usuário admin ───────────────────────────────
--
-- 1. Acesse Supabase > Authentication > Users > "Add user"
-- 2. Crie com e-mail e senha fortes
-- 3. Copie o UUID gerado
-- 4. Execute abaixo substituindo os valores:
--
-- insert into public.profiles (user_id, role, name, email)
-- values (
--   'UUID_DO_USUARIO_AQUI',
--   'admin',
--   'Seu Nome',
--   'seu@email.com'
-- );
