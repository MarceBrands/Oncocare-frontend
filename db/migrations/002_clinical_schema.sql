alter table pacientes
  add column if not exists status text not null default 'stable',
  add column if not exists risk_score numeric(3, 1),
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists next_appointment date;

create table if not exists usuarios_perfis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null unique,
  tipo_usuario text not null,
  auth_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

drop trigger if exists usuarios_perfis_set_updated_at on usuarios_perfis;

create trigger usuarios_perfis_set_updated_at
before update on usuarios_perfis
for each row
execute function set_updated_at();

create table if not exists medicos (
  id uuid primary key default gen_random_uuid(),
  usuario_perfil_id uuid references usuarios_perfis (id) on delete set null,
  nome_profissional text not null,
  email text not null,
  telefone text,
  data_nascimento date,
  cpf text not null unique,
  matricula text,
  cbo text,
  especialidade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

drop trigger if exists medicos_set_updated_at on medicos;

create trigger medicos_set_updated_at
before update on medicos
for each row
execute function set_updated_at();

create table if not exists tratamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  tipo text not null,
  protocolo text not null,
  status text not null,
  data_inicio date not null,
  data_fim date,
  progresso integer not null default 0 check (progresso between 0 and 100),
  sessoes_concluidas integer not null default 0,
  sessoes_total integer not null default 0,
  proxima_sessao date,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists tratamentos_paciente_id_idx on tratamentos (paciente_id);
create index if not exists tratamentos_status_idx on tratamentos (status);

drop trigger if exists tratamentos_set_updated_at on tratamentos;

create trigger tratamentos_set_updated_at
before update on tratamentos
for each row
execute function set_updated_at();

create table if not exists tratamento_efeitos_adversos (
  id uuid primary key default gen_random_uuid(),
  tratamento_id uuid not null references tratamentos (id) on delete cascade,
  efeito text not null
);

create table if not exists exames_categorias (
  id text primary key,
  nome text not null,
  icon_key text not null default 'file',
  ordem integer not null default 0
);

create table if not exists exames_resultados (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  categoria_id text not null references exames_categorias (id),
  nome text not null,
  valor numeric not null,
  unidade text not null,
  referencia text not null,
  status text not null check (status in ('normal', 'low', 'high', 'critical')),
  tendencia text check (tendencia in ('up', 'down', 'stable')),
  coletado_em date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists exames_resultados_paciente_categoria_idx
  on exames_resultados (paciente_id, categoria_id);
create index if not exists exames_resultados_status_idx on exames_resultados (status);

drop trigger if exists exames_resultados_set_updated_at on exames_resultados;

create trigger exames_resultados_set_updated_at
before update on exames_resultados
for each row
execute function set_updated_at();

create table if not exists exames_historico (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  nome_exame text not null,
  mes text not null,
  valor numeric not null,
  minimo numeric,
  maximo numeric,
  ordem integer not null default 0
);

create table if not exists sintomas_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  avaliado_em date not null,
  qualidade_vida_score numeric(3, 1) not null check (
    qualidade_vida_score >= 0 and qualidade_vida_score <= 10
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists sintomas_avaliacoes_paciente_idx
  on sintomas_avaliacoes (paciente_id, avaliado_em desc);

drop trigger if exists sintomas_avaliacoes_set_updated_at on sintomas_avaliacoes;

create trigger sintomas_avaliacoes_set_updated_at
before update on sintomas_avaliacoes
for each row
execute function set_updated_at();

create table if not exists sintomas_scores (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references sintomas_avaliacoes (id) on delete cascade,
  sintoma_id text not null,
  nome text not null,
  valor integer not null check (valor between 0 and 10),
  cor text not null
);

create table if not exists sintomas_historico_mensal (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  mes text not null,
  fadiga integer not null,
  dor integer not null,
  nausea integer not null,
  ansiedade integer not null,
  sono integer not null,
  ordem integer not null default 0
);

create table if not exists bioimpedancia_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  avaliado_em date not null,
  massa_magra numeric(5, 2) not null,
  gordura_corporal numeric(5, 2) not null,
  hidratacao numeric(5, 2) not null,
  imc numeric(5, 2) not null,
  peso_total numeric(5, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists bioimpedancia_avaliacoes_paciente_idx
  on bioimpedancia_avaliacoes (paciente_id, avaliado_em desc);

drop trigger if exists bioimpedancia_avaliacoes_set_updated_at on bioimpedancia_avaliacoes;

create trigger bioimpedancia_avaliacoes_set_updated_at
before update on bioimpedancia_avaliacoes
for each row
execute function set_updated_at();

create table if not exists alertas_clinicos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  tipo text not null check (tipo in ('critical', 'warning', 'info')),
  mensagem text not null,
  recomendacao text,
  tempo_label text,
  ocorrido_em date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists alertas_clinicos_paciente_idx
  on alertas_clinicos (paciente_id, ocorrido_em desc);

drop trigger if exists alertas_clinicos_set_updated_at on alertas_clinicos;

create trigger alertas_clinicos_set_updated_at
before update on alertas_clinicos
for each row
execute function set_updated_at();

create table if not exists timeline_eventos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descricao text not null,
  cor text not null,
  ocorrido_em date not null
);

create index if not exists timeline_eventos_paciente_idx
  on timeline_eventos (paciente_id, ocorrido_em desc);

create table if not exists dashboard_status_historico (
  id uuid primary key default gen_random_uuid(),
  mes text not null unique,
  normal integer not null default 0,
  atencao integer not null default 0,
  critico integer not null default 0,
  ordem integer not null default 0
);
