alter table tratamentos
  add column if not exists ultima_sessao date,
  add column if not exists observacoes text;
