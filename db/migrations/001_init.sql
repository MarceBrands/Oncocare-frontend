create extension if not exists pgcrypto;

create table if not exists tipo_atendimentos (
  id serial primary key,
  nome text not null unique
);

insert into tipo_atendimentos (nome)
values ('SUS'), ('Clinica privada'), ('Particular')
on conflict (nome) do nothing;

create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_nascimento date not null,
  cpf text not null unique,
  medico_id uuid,
  usuario_perfil_id uuid,
  cadastrado_por_medico_id uuid,
  tipo_atendimento text not null,
  tipo_atendimento_id integer references tipo_atendimentos (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists pacientes_created_at_idx on pacientes (created_at desc);

create table if not exists paciente_diagnosticos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id) on delete cascade,
  tipo_cancer text not null check (tipo_cancer in ('mama', 'colo_utero')),
  observacoes text,
  created_at timestamptz not null default now()
);

create index if not exists paciente_diagnosticos_paciente_id_idx
  on paciente_diagnosticos (paciente_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pacientes_set_updated_at on pacientes;

create trigger pacientes_set_updated_at
before update on pacientes
for each row
execute function set_updated_at();

