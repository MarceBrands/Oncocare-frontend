insert into tipo_atendimentos (nome)
values ('SUS'), ('Clinica privada'), ('Particular')
on conflict (nome) do nothing;

insert into exames_categorias (id, nome, icon_key, ordem)
values
  ('hemograma', 'Hemograma', 'activity', 1),
  ('funcaoRenal', 'Funcao Renal', 'file', 2),
  ('funcaoHepatica', 'Funcao Hepatica', 'file', 3),
  ('eletrolitos', 'Eletrolitos', 'activity', 4),
  ('inflamacao', 'Inflamacao', 'alert', 5)
on conflict (id) do update set
  nome = excluded.nome,
  icon_key = excluded.icon_key,
  ordem = excluded.ordem;

delete from pacientes
where cpf in (
  '12345678900',
  '98765432100',
  '33344455566',
  '44455566677',
  '55566677788'
);

insert into pacientes (
  id,
  nome,
  data_nascimento,
  cpf,
  tipo_atendimento,
  tipo_atendimento_id,
  status,
  risk_score,
  phone,
  email,
  address,
  next_appointment
)
values
  ('11111111-1111-4111-8111-111111111111', 'Maria Santos Silva', '1978-04-12', '12345678900', 'SUS', (select id from tipo_atendimentos where nome = 'SUS'), 'critical', 8.5, '(11) 98765-4321', 'maria.santos@email.com', 'Rua das Flores, 123 - Sao Paulo, SP', '2026-06-05'),
  ('22222222-2222-4222-8222-222222222222', 'Ana Paula Oliveira', '1971-09-23', '98765432100', 'Clinica privada', (select id from tipo_atendimentos where nome = 'Clinica privada'), 'attention', 6.4, '(11) 91111-2222', 'ana.oliveira@email.com', 'Avenida Central, 455 - Sao Paulo, SP', '2026-06-12'),
  ('33333333-3333-4333-8333-333333333333', 'Juliana Costa', '1984-02-18', '33344455566', 'Particular', (select id from tipo_atendimentos where nome = 'Particular'), 'stable', 3.1, '(11) 92222-3333', 'juliana.costa@email.com', 'Rua Horizonte, 88 - Sao Paulo, SP', '2026-06-19'),
  ('44444444-4444-4444-8444-444444444444', 'Fernanda Lima', '1975-11-07', '44455566677', 'SUS', (select id from tipo_atendimentos where nome = 'SUS'), 'critical', 8.1, '(11) 93333-4444', 'fernanda.lima@email.com', 'Rua Norte, 52 - Sao Paulo, SP', '2026-06-08'),
  ('55555555-5555-4555-8555-555555555555', 'Carolina Mendes', '1987-08-29', '55566677788', 'Clinica privada', (select id from tipo_atendimentos where nome = 'Clinica privada'), 'stable', 2.8, '(11) 94444-5555', 'carolina.mendes@email.com', 'Rua Sul, 19 - Sao Paulo, SP', '2026-06-20')
on conflict (id) do update set
  nome = excluded.nome,
  data_nascimento = excluded.data_nascimento,
  cpf = excluded.cpf,
  tipo_atendimento = excluded.tipo_atendimento,
  tipo_atendimento_id = excluded.tipo_atendimento_id,
  status = excluded.status,
  risk_score = excluded.risk_score,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  next_appointment = excluded.next_appointment;

delete from paciente_diagnosticos
where paciente_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

insert into paciente_diagnosticos (paciente_id, tipo_cancer, observacoes)
values
  ('11111111-1111-4111-8111-111111111111', 'mama', 'Mock seed'),
  ('22222222-2222-4222-8222-222222222222', 'colo_utero', 'Mock seed'),
  ('33333333-3333-4333-8333-333333333333', 'mama', 'Mock seed'),
  ('44444444-4444-4444-8444-444444444444', 'colo_utero', 'Mock seed'),
  ('55555555-5555-4555-8555-555555555555', 'mama', 'Mock seed');

delete from tratamento_efeitos_adversos;
delete from tratamentos;
delete from exames_historico;
delete from exames_resultados;
delete from sintomas_scores;
delete from sintomas_avaliacoes;
delete from sintomas_historico_mensal;
delete from bioimpedancia_avaliacoes;
delete from alertas_clinicos;
delete from timeline_eventos;
delete from dashboard_status_historico;

insert into tratamentos (id, paciente_id, tipo, protocolo, status, data_inicio, data_fim, progresso, sessoes_concluidas, sessoes_total, proxima_sessao)
values
  ('aaaaaaaa-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Quimioterapia', 'AC-T', 'active', '2026-03-01', '2026-07-15', 70, 8, 12, '2026-06-05'),
  ('aaaaaaaa-0001-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Radioterapia', 'IMRT Pelvica', 'active', '2026-04-15', '2026-06-30', 55, 14, 25, '2026-06-02'),
  ('aaaaaaaa-0001-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'Hormonioterapia', 'Tamoxifeno', 'active', '2026-01-10', '2031-01-10', 10, 4, 60, '2026-07-10'),
  ('aaaaaaaa-0001-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'Braquiterapia', 'HDR', 'scheduled', '2026-06-10', '2026-06-24', 0, 0, 4, '2026-06-10');

insert into tratamento_efeitos_adversos (tratamento_id, efeito)
values
  ('aaaaaaaa-0001-4000-8000-000000000001', 'Fadiga intensa'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'Nausea'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'Queda de cabelo'),
  ('aaaaaaaa-0001-4000-8000-000000000002', 'Fadiga leve'),
  ('aaaaaaaa-0001-4000-8000-000000000002', 'Irritacao cutanea'),
  ('aaaaaaaa-0001-4000-8000-000000000003', 'Fogachos'),
  ('aaaaaaaa-0001-4000-8000-000000000003', 'Alteracoes de humor');

insert into exames_resultados (id, paciente_id, categoria_id, nome, valor, unidade, referencia, status, tendencia, coletado_em)
values
  ('aaaaaaaa-0002-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'hemograma', 'Hemoglobina', 7.2, 'g/dL', '12.0 - 16.0', 'critical', 'down', '2026-05-28'),
  ('aaaaaaaa-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'hemograma', 'Hematocrito', 28.5, '%', '36.0 - 46.0', 'critical', 'down', '2026-05-28'),
  ('aaaaaaaa-0002-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'hemograma', 'Leucocitos', 4200, '/uL', '4500 - 11000', 'low', 'down', '2026-05-28'),
  ('aaaaaaaa-0002-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'funcaoRenal', 'Creatinina', 1.3, 'mg/dL', '0.6 - 1.2', 'high', 'up', '2026-05-28'),
  ('aaaaaaaa-0002-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'inflamacao', 'PCR', 85, 'mg/L', '< 5', 'critical', 'up', '2026-05-28');

insert into exames_historico (paciente_id, nome_exame, mes, valor, minimo, maximo, ordem)
values
  ('11111111-1111-4111-8111-111111111111', 'Hemoglobina', 'Jan', 12.5, 12, 16, 1),
  ('11111111-1111-4111-8111-111111111111', 'Hemoglobina', 'Fev', 11.8, 12, 16, 2),
  ('11111111-1111-4111-8111-111111111111', 'Hemoglobina', 'Mar', 10.2, 12, 16, 3),
  ('11111111-1111-4111-8111-111111111111', 'Hemoglobina', 'Abr', 9.5, 12, 16, 4),
  ('11111111-1111-4111-8111-111111111111', 'Hemoglobina', 'Mai', 7.2, 12, 16, 5);

insert into sintomas_avaliacoes (id, paciente_id, avaliado_em, qualidade_vida_score)
values ('aaaaaaaa-0003-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', '2026-05-30', 3.2);

insert into sintomas_scores (avaliacao_id, sintoma_id, nome, valor, cor)
values
  ('aaaaaaaa-0003-4000-8000-000000000001', 'fadiga', 'Fadiga', 9, '#ec4899'),
  ('aaaaaaaa-0003-4000-8000-000000000001', 'dor', 'Dor', 8, '#ef4444'),
  ('aaaaaaaa-0003-4000-8000-000000000001', 'nausea', 'Nausea', 7, '#f59e0b'),
  ('aaaaaaaa-0003-4000-8000-000000000001', 'sono', 'Qualidade do Sono', 4, '#8b5cf6'),
  ('aaaaaaaa-0003-4000-8000-000000000001', 'ansiedade', 'Ansiedade', 9, '#06b6d4'),
  ('aaaaaaaa-0003-4000-8000-000000000001', 'funcionalidade', 'Funcionalidade Fisica', 3, '#10b981');

insert into sintomas_historico_mensal (paciente_id, mes, fadiga, dor, nausea, ansiedade, sono, ordem)
values
  ('11111111-1111-4111-8111-111111111111', 'Jan', 7, 5, 3, 6, 6, 1),
  ('11111111-1111-4111-8111-111111111111', 'Fev', 6, 6, 4, 7, 5, 2),
  ('11111111-1111-4111-8111-111111111111', 'Mar', 8, 7, 6, 8, 4, 3),
  ('11111111-1111-4111-8111-111111111111', 'Abr', 7, 6, 5, 6, 5, 4),
  ('11111111-1111-4111-8111-111111111111', 'Mai', 9, 8, 7, 9, 4, 5);

insert into bioimpedancia_avaliacoes (paciente_id, avaliado_em, massa_magra, gordura_corporal, hidratacao, imc, peso_total)
values
  ('11111111-1111-4111-8111-111111111111', '2026-01-30', 45.2, 28.5, 54.2, 27.2, 70.2),
  ('11111111-1111-4111-8111-111111111111', '2026-02-28', 44.8, 29.1, 53.5, 27.0, 69.8),
  ('11111111-1111-4111-8111-111111111111', '2026-03-30', 43.5, 30.8, 52.8, 26.8, 69.1),
  ('11111111-1111-4111-8111-111111111111', '2026-04-30', 43.0, 31.5, 52.0, 26.7, 68.9),
  ('11111111-1111-4111-8111-111111111111', '2026-05-30', 42.5, 32.8, 51.2, 26.4, 68.5);

insert into alertas_clinicos (id, paciente_id, tipo, mensagem, recomendacao, tempo_label, ocorrido_em)
values
  ('aaaaaaaa-0005-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'critical', 'Hemoglobina 7.2 g/dL - Risco de anemia grave', 'Considerar transfusao sanguinea urgente', '2h atras', '2026-05-30'),
  ('aaaaaaaa-0005-4000-8000-000000000002', '44444444-4444-4444-8444-444444444444', 'critical', 'PCR 85 mg/L - Possivel processo inflamatorio', 'Avaliar infeccao ou inflamacao ativa', '4h atras', '2026-05-30'),
  ('aaaaaaaa-0005-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', 'warning', 'Neutrofilos 1200/uL - Monitorar neutropenia', 'Monitorar risco de infeccoes', '6h atras', '2026-05-29');

insert into timeline_eventos (id, paciente_id, tipo, titulo, descricao, cor, ocorrido_em)
values
  ('aaaaaaaa-0006-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'alert', 'Hemoglobina Critica', 'Hemoglobina em 7.2 g/dL - Necessario transfusao', 'red', '2026-05-30'),
  ('aaaaaaaa-0006-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'exam', 'Exames Laboratoriais', 'Coleta realizada - Aguardando resultados', 'blue', '2026-05-28'),
  ('aaaaaaaa-0006-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'treatment', 'Sessao de Quimioterapia', '8a sessao realizada com sucesso', 'purple', '2026-05-25');

insert into dashboard_status_historico (mes, normal, atencao, critico, ordem)
values
  ('Jan', 45, 12, 3, 1),
  ('Fev', 52, 10, 5, 2),
  ('Mar', 48, 15, 4, 3),
  ('Abr', 61, 11, 2, 4),
  ('Mai', 55, 14, 8, 5)
on conflict (mes) do update set
  normal = excluded.normal,
  atencao = excluded.atencao,
  critico = excluded.critico,
  ordem = excluded.ordem;
