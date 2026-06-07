insert into pacientes (nome, data_nascimento, cpf, tipo_atendimento, tipo_atendimento_id)
select 'Maria Santos Silva', '1978-04-12', '12345678900', 'SUS', id
from tipo_atendimentos
where nome = 'SUS'
on conflict (cpf) do nothing;

insert into pacientes (nome, data_nascimento, cpf, tipo_atendimento, tipo_atendimento_id)
select 'Ana Paula Oliveira', '1971-09-23', '98765432100', 'Clinica privada', id
from tipo_atendimentos
where nome = 'Clinica privada'
on conflict (cpf) do nothing;

insert into paciente_diagnosticos (paciente_id, tipo_cancer, observacoes)
select id, 'mama', 'Paciente seed para desenvolvimento local.'
from pacientes
where cpf = '12345678900'
  and not exists (
    select 1
    from paciente_diagnosticos
    where paciente_id = pacientes.id
      and tipo_cancer = 'mama'
  );

insert into paciente_diagnosticos (paciente_id, tipo_cancer, observacoes)
select id, 'colo_utero', 'Paciente seed para desenvolvimento local.'
from pacientes
where cpf = '98765432100'
  and not exists (
    select 1
    from paciente_diagnosticos
    where paciente_id = pacientes.id
      and tipo_cancer = 'colo_utero'
  );

