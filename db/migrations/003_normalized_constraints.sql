delete from paciente_diagnosticos pd
using paciente_diagnosticos duplicate
where pd.paciente_id = duplicate.paciente_id
  and pd.tipo_cancer = duplicate.tipo_cancer
  and pd.id > duplicate.id;

create unique index if not exists paciente_diagnosticos_unique_tipo_idx
  on paciente_diagnosticos (paciente_id, tipo_cancer);

delete from tratamento_efeitos_adversos efeito
using tratamento_efeitos_adversos duplicate
where efeito.tratamento_id = duplicate.tratamento_id
  and efeito.efeito = duplicate.efeito
  and efeito.id > duplicate.id;

create unique index if not exists tratamento_efeitos_adversos_unique_idx
  on tratamento_efeitos_adversos (tratamento_id, efeito);

delete from sintomas_scores score
using sintomas_scores duplicate
where score.avaliacao_id = duplicate.avaliacao_id
  and score.sintoma_id = duplicate.sintoma_id
  and score.id > duplicate.id;

create unique index if not exists sintomas_scores_unique_sintoma_idx
  on sintomas_scores (avaliacao_id, sintoma_id);

delete from sintomas_historico_mensal history
using sintomas_historico_mensal duplicate
where history.paciente_id = duplicate.paciente_id
  and history.mes = duplicate.mes
  and history.id > duplicate.id;

create unique index if not exists sintomas_historico_mensal_unique_mes_idx
  on sintomas_historico_mensal (paciente_id, mes);

delete from exames_historico history
using exames_historico duplicate
where history.paciente_id = duplicate.paciente_id
  and history.nome_exame = duplicate.nome_exame
  and history.mes = duplicate.mes
  and history.id > duplicate.id;

create unique index if not exists exames_historico_unique_mes_idx
  on exames_historico (paciente_id, nome_exame, mes);

delete from bioimpedancia_avaliacoes assessment
using bioimpedancia_avaliacoes duplicate
where assessment.paciente_id = duplicate.paciente_id
  and assessment.avaliado_em = duplicate.avaliado_em
  and assessment.id > duplicate.id;

create unique index if not exists bioimpedancia_avaliacoes_unique_data_idx
  on bioimpedancia_avaliacoes (paciente_id, avaliado_em);

create unique index if not exists medicos_usuario_perfil_unique_idx
  on medicos (usuario_perfil_id)
  where usuario_perfil_id is not null;
