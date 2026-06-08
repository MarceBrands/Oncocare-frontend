import type pg from 'pg';
import type {
  AppSettings,
  BioimpedanceAssessment,
  BioimpedanceInput,
  BioimpedanceOverview,
  ClinicalAlert,
  ClinicalAlertInput,
  DashboardData,
  DiagnosisType,
  ExamCategory,
  ExamInput,
  ExamResult,
  ExamsOverview,
  Patient,
  PatientInput,
  PatientProfile,
  SymptomsOverview,
  SymptomAssessment,
  SymptomAssessmentInput,
  TimelineEvent,
  TimelineEventInput,
  Treatment,
  TreatmentInput,
} from './api-types';
import type { ApiRepository } from './repository';

function asDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function asNumber(value: unknown) {
  return typeof value === 'number' ? value : Number(value);
}

function getAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function diagnosisLabel(diagnosis: DiagnosisType) {
  if (diagnosis === 'mama') return 'Cancer de Mama';
  return 'Cancer de Colo do Utero';
}

function mapPatient(row: Record<string, any>): Patient {
  return {
    id: row.id,
    nome: row.nome,
    data_nascimento: asDate(row.data_nascimento) ?? '',
    cpf: row.cpf,
    medico_id: row.medico_id,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    usuario_perfil_id: row.usuario_perfil_id,
    cadastrado_por_medico_id: row.cadastrado_por_medico_id,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    tipo_atendimento: row.tipo_atendimento,
    tipo_atendimento_id: row.tipo_atendimento_id,
    status: row.status ?? 'stable',
    risk_score: row.risk_score === null ? null : asNumber(row.risk_score),
    phone: row.phone,
    email: row.email,
    address: row.address,
    next_appointment: asDate(row.next_appointment),
    diagnosticos: row.diagnosticos ?? [],
  };
}

function mapTreatment(row: Record<string, any>): Treatment {
  return {
    id: row.id,
    patientId: row.paciente_id,
    patient: row.patient,
    type: row.tipo,
    protocol: row.protocolo,
    status: row.status,
    startDate: asDate(row.data_inicio) ?? '',
    endDate: asDate(row.data_fim),
    progress: row.progresso,
    sessions: {
      completed: row.sessoes_concluidas,
      total: row.sessoes_total,
    },
    lastSession: asDate(row.ultima_sessao),
    nextSession: asDate(row.proxima_sessao),
    notes: row.observacoes,
    adverseEffects: row.adverse_effects ?? [],
  };
}

function mapExam(row: Record<string, any>): ExamResult {
  return {
    id: row.id,
    patientId: row.paciente_id,
    categoryId: row.categoria_id,
    name: row.nome,
    value: asNumber(row.valor),
    unit: row.unidade,
    reference: row.referencia,
    status: row.status,
    trend: row.tendencia ?? undefined,
    collectedAt: asDate(row.coletado_em) ?? '',
  };
}

function mapAlert(row: Record<string, any>): ClinicalAlert {
  return {
    id: row.id,
    patientId: row.paciente_id,
    patient: row.patient,
    type: row.tipo,
    message: row.mensagem,
    recommendation: row.recomendacao,
    time: row.tempo_label,
    occurredAt: asDate(row.ocorrido_em) ?? '',
  };
}

function mapTimeline(row: Record<string, any>): TimelineEvent {
  return {
    id: row.id,
    patientId: row.paciente_id,
    date: asDate(row.ocorrido_em) ?? '',
    type: row.tipo,
    title: row.titulo,
    description: row.descricao,
    color: row.cor,
  };
}

export function createPostgresRepository(pool: pg.Pool): ApiRepository {
  async function listPatients(): Promise<Patient[]> {
    const { rows } = await pool.query(`
      select
        p.*,
        coalesce(
          array_remove(array_agg(pd.tipo_cancer order by pd.tipo_cancer), null),
          '{}'
        ) as diagnosticos
      from pacientes p
      left join paciente_diagnosticos pd on pd.paciente_id = p.id
      group by p.id
      order by p.created_at desc
    `);

    return rows.map(mapPatient);
  }

  async function getPatient(id: string): Promise<Patient | null> {
    const { rows } = await pool.query(
      `
        select
          p.*,
          coalesce(
            array_remove(array_agg(pd.tipo_cancer order by pd.tipo_cancer), null),
            '{}'
          ) as diagnosticos
        from pacientes p
        left join paciente_diagnosticos pd on pd.paciente_id = p.id
        where p.id = $1
        group by p.id
      `,
      [id]
    );

    return rows[0] ? mapPatient(rows[0]) : null;
  }

  async function replaceDiagnoses(
    client: pg.PoolClient,
    patientId: string,
    diagnoses: DiagnosisType[] = [],
    observacoes: string | null = null
  ) {
    await client.query('delete from paciente_diagnosticos where paciente_id = $1', [patientId]);

    for (const tipoCancer of diagnoses) {
      await client.query(
        `
          insert into paciente_diagnosticos (paciente_id, tipo_cancer, observacoes)
          values ($1, $2, $3)
        `,
        [patientId, tipoCancer, observacoes]
      );
    }
  }

  async function createPatient(patient: PatientInput) {
    const client = await pool.connect();

    try {
      await client.query('begin');

      const { rows } = await client.query<{ id: string }>(
        `
          insert into pacientes (
            nome,
            cpf,
            data_nascimento,
            tipo_atendimento,
            tipo_atendimento_id,
            status,
            risk_score,
            phone,
            email,
            address,
            next_appointment
          )
          values ($1, $2, $3, $4, (
            select id from tipo_atendimentos where nome = $4
          ), $5, $6, $7, $8, $9, $10)
          returning id
        `,
        [
          patient.nome,
          patient.cpf,
          patient.data_nascimento,
          patient.tipo_atendimento,
          patient.status ?? 'stable',
          patient.risk_score ?? null,
          patient.phone ?? null,
          patient.email ?? null,
          patient.address ?? null,
          patient.next_appointment ?? null,
        ]
      );

      const id = rows[0].id;
      await replaceDiagnoses(client, id, patient.diagnosticos, patient.observacoes ?? null);
      await client.query('commit');
      return { id };
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async function updatePatient(id: string, patient: PatientInput) {
    const client = await pool.connect();

    try {
      await client.query('begin');

      const { rowCount } = await client.query(
        `
          update pacientes
          set
            nome = $2,
            cpf = $3,
            data_nascimento = $4,
            tipo_atendimento = $5,
            tipo_atendimento_id = (select id from tipo_atendimentos where nome = $5),
            status = $6,
            risk_score = $7,
            phone = $8,
            email = $9,
            address = $10,
            next_appointment = $11
          where id = $1
        `,
        [
          id,
          patient.nome,
          patient.cpf,
          patient.data_nascimento,
          patient.tipo_atendimento,
          patient.status ?? 'stable',
          patient.risk_score ?? null,
          patient.phone ?? null,
          patient.email ?? null,
          patient.address ?? null,
          patient.next_appointment ?? null,
        ]
      );

      if (rowCount === 0) {
        await client.query('rollback');
        return null;
      }

      await replaceDiagnoses(client, id, patient.diagnosticos, patient.observacoes ?? null);
      await client.query('commit');
      return getPatient(id);
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async function deletePatient(id: string) {
    const { rowCount } = await pool.query('delete from pacientes where id = $1', [id]);
    return rowCount > 0;
  }

  async function listTreatments(patientId?: string | null) {
    const values = patientId ? [patientId] : [];
    const { rows } = await pool.query(
      `
        select
          t.*,
          p.nome as patient,
          coalesce(
            array_remove(array_agg(tea.efeito order by tea.efeito), null),
            '{}'
          ) as adverse_effects
        from tratamentos t
        join pacientes p on p.id = t.paciente_id
        left join tratamento_efeitos_adversos tea on tea.tratamento_id = t.id
        ${patientId ? 'where t.paciente_id = $1' : ''}
        group by t.id, p.nome
        order by t.data_inicio desc
      `,
      values
    );

    return rows.map(mapTreatment);
  }

  async function replaceAdverseEffects(
    client: pg.PoolClient,
    treatmentId: string,
    effects: string[]
  ) {
    await client.query('delete from tratamento_efeitos_adversos where tratamento_id = $1', [
      treatmentId,
    ]);

    for (const effect of effects) {
      await client.query(
        'insert into tratamento_efeitos_adversos (tratamento_id, efeito) values ($1, $2)',
        [treatmentId, effect]
      );
    }
  }

  async function createTreatment(treatment: TreatmentInput) {
    const client = await pool.connect();

    try {
      await client.query('begin');
      const { rows } = await client.query<{ id: string }>(
        `
          insert into tratamentos (
            paciente_id,
            tipo,
            protocolo,
            status,
            data_inicio,
            data_fim,
            progresso,
            sessoes_concluidas,
            sessoes_total,
            ultima_sessao,
            proxima_sessao,
            observacoes
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          returning id
        `,
        [
          treatment.patientId,
          treatment.type,
          treatment.protocol,
          treatment.status,
          treatment.startDate,
          treatment.endDate,
          treatment.progress,
          treatment.sessions.completed,
          treatment.sessions.total,
          treatment.lastSession,
          treatment.nextSession,
          treatment.notes,
        ]
      );

      const id = rows[0].id;
      await replaceAdverseEffects(client, id, treatment.adverseEffects);
      await client.query('commit');
      return { id };
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async function updateTreatment(id: string, treatment: TreatmentInput) {
    const client = await pool.connect();

    try {
      await client.query('begin');
      const { rowCount } = await client.query(
        `
          update tratamentos
          set
            paciente_id = $2,
            tipo = $3,
            protocolo = $4,
            status = $5,
            data_inicio = $6,
            data_fim = $7,
            progresso = $8,
            sessoes_concluidas = $9,
            sessoes_total = $10,
            ultima_sessao = $11,
            proxima_sessao = $12,
            observacoes = $13
          where id = $1
        `,
        [
          id,
          treatment.patientId,
          treatment.type,
          treatment.protocol,
          treatment.status,
          treatment.startDate,
          treatment.endDate,
          treatment.progress,
          treatment.sessions.completed,
          treatment.sessions.total,
          treatment.lastSession,
          treatment.nextSession,
          treatment.notes,
        ]
      );

      if (rowCount === 0) {
        await client.query('rollback');
        return null;
      }

      await replaceAdverseEffects(client, id, treatment.adverseEffects);
      await client.query('commit');
      return (await listTreatments()).find((item) => item.id === id) ?? null;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async function deleteTreatment(id: string) {
    const { rowCount } = await pool.query('delete from tratamentos where id = $1', [id]);
    return rowCount > 0;
  }

  async function getPatientOptions() {
    const patients = await listPatients();
    return patients.map((patient) => ({ id: patient.id, name: patient.nome }));
  }

  function getDefaultPatientId(patients: Array<{ id: string }>, patientId?: string | null) {
    if (patientId) return patientId;
    return patients[0]?.id ?? null;
  }

  async function getExamsOverview(patientId?: string | null): Promise<ExamsOverview> {
    const patients = await getPatientOptions();
    const selectedPatientId = getDefaultPatientId(patients, patientId);

    const categoriesResult = await pool.query(`
      select id, nome, icon_key
      from exames_categorias
      order by ordem, nome
    `);
    const categories: ExamCategory[] = categoriesResult.rows.map((row) => ({
      id: row.id,
      name: row.nome,
      iconKey: row.icon_key,
    }));

    const examsResult = await pool.query(
      `
        select *
        from exames_resultados
        where ($1::uuid is null or paciente_id = $1)
        order by coletado_em desc, nome
      `,
      [selectedPatientId]
    );
    const exams = examsResult.rows.map(mapExam);
    const examsData = exams.reduce<Record<string, ExamResult[]>>((acc, exam) => {
      acc[exam.categoryId] = [...(acc[exam.categoryId] ?? []), exam];
      return acc;
    }, {});

    const historyResult = await pool.query(
      `
        select mes, valor, minimo, maximo
        from exames_historico
        where ($1::uuid is null or paciente_id = $1)
          and nome_exame = 'Hemoglobina'
        order by ordem
      `,
      [selectedPatientId]
    );

    return {
      patients,
      selectedPatientId,
      categories,
      examsData,
      hemoglobinaHistory: historyResult.rows.map((row) => ({
        month: row.mes,
        value: asNumber(row.valor),
        min: asNumber(row.minimo),
        max: asNumber(row.maximo),
      })),
      lastCollection: asDate(examsResult.rows[0]?.coletado_em),
    };
  }

  async function createExamResult(exam: ExamInput) {
    const { rows } = await pool.query<{ id: string }>(
      `
        insert into exames_resultados (
          paciente_id,
          categoria_id,
          nome,
          valor,
          unidade,
          referencia,
          status,
          tendencia,
          coletado_em
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning id
      `,
      [
        exam.patientId,
        exam.categoryId,
        exam.name,
        exam.value,
        exam.unit,
        exam.reference,
        exam.status,
        exam.trend ?? null,
        exam.collectedAt,
      ]
    );
    return { id: rows[0].id };
  }

  async function updateExamResult(id: string, exam: ExamInput) {
    const { rows } = await pool.query(
      `
        update exames_resultados
        set
          paciente_id = $2,
          categoria_id = $3,
          nome = $4,
          valor = $5,
          unidade = $6,
          referencia = $7,
          status = $8,
          tendencia = $9,
          coletado_em = $10
        where id = $1
        returning *
      `,
      [
        id,
        exam.patientId,
        exam.categoryId,
        exam.name,
        exam.value,
        exam.unit,
        exam.reference,
        exam.status,
        exam.trend ?? null,
        exam.collectedAt,
      ]
    );
    return rows[0] ? mapExam(rows[0]) : null;
  }

  async function deleteExamResult(id: string) {
    const { rowCount } = await pool.query('delete from exames_resultados where id = $1', [id]);
    return rowCount > 0;
  }

  async function getSymptomsOverview(patientId?: string | null): Promise<SymptomsOverview> {
    const patients = await getPatientOptions();
    const selectedPatientId = getDefaultPatientId(patients, patientId);

    const assessmentResult = await pool.query(
      `
        select *
        from sintomas_avaliacoes
        where ($1::uuid is null or paciente_id = $1)
        order by avaliado_em desc
        limit 1
      `,
      [selectedPatientId]
    );
    const assessmentRow = assessmentResult.rows[0];
    let assessment: SymptomAssessment | null = null;

    if (assessmentRow) {
      const scoresResult = await pool.query(
        `
          select sintoma_id, nome, valor, cor
          from sintomas_scores
          where avaliacao_id = $1
          order by nome
        `,
        [assessmentRow.id]
      );

      assessment = {
        id: assessmentRow.id,
        patientId: assessmentRow.paciente_id,
        assessedAt: asDate(assessmentRow.avaliado_em) ?? '',
        qualityOfLifeScore: asNumber(assessmentRow.qualidade_vida_score),
        symptoms: scoresResult.rows.map((row) => ({
          id: row.sintoma_id,
          name: row.nome,
          value: row.valor,
          color: row.cor,
        })),
      };
    }

    const historyResult = await pool.query(
      `
        select mes, fadiga, dor, nausea, ansiedade, sono
        from sintomas_historico_mensal
        where ($1::uuid is null or paciente_id = $1)
        order by ordem
      `,
      [selectedPatientId]
    );

    return {
      patients,
      selectedPatientId,
      assessment,
      evolutionData: historyResult.rows.map((row) => ({
        month: row.mes,
        fadiga: row.fadiga,
        dor: row.dor,
        nausea: row.nausea,
        ansiedade: row.ansiedade,
        sono: row.sono,
      })),
    };
  }

  async function replaceSymptomScores(
    client: pg.PoolClient,
    assessmentId: string,
    symptoms: SymptomAssessmentInput['symptoms']
  ) {
    await client.query('delete from sintomas_scores where avaliacao_id = $1', [assessmentId]);

    for (const symptom of symptoms) {
      await client.query(
        `
          insert into sintomas_scores (avaliacao_id, sintoma_id, nome, valor, cor)
          values ($1, $2, $3, $4, $5)
        `,
        [assessmentId, symptom.id, symptom.name, symptom.value, symptom.color]
      );
    }
  }

  async function createSymptomAssessment(assessment: SymptomAssessmentInput) {
    const client = await pool.connect();

    try {
      await client.query('begin');
      const { rows } = await client.query<{ id: string }>(
        `
          insert into sintomas_avaliacoes (
            paciente_id,
            avaliado_em,
            qualidade_vida_score
          )
          values ($1, $2, $3)
          returning id
        `,
        [assessment.patientId, assessment.assessedAt, assessment.qualityOfLifeScore]
      );
      const id = rows[0].id;
      await replaceSymptomScores(client, id, assessment.symptoms);
      await client.query('commit');
      return { id };
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async function updateSymptomAssessment(id: string, assessment: SymptomAssessmentInput) {
    const client = await pool.connect();

    try {
      await client.query('begin');
      const { rowCount } = await client.query(
        `
          update sintomas_avaliacoes
          set paciente_id = $2, avaliado_em = $3, qualidade_vida_score = $4
          where id = $1
        `,
        [id, assessment.patientId, assessment.assessedAt, assessment.qualityOfLifeScore]
      );

      if (rowCount === 0) {
        await client.query('rollback');
        return null;
      }

      await replaceSymptomScores(client, id, assessment.symptoms);
      await client.query('commit');
      const overview = await getSymptomsOverview(assessment.patientId);
      return overview.assessment?.id === id ? overview.assessment : null;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async function deleteSymptomAssessment(id: string) {
    const { rowCount } = await pool.query('delete from sintomas_avaliacoes where id = $1', [id]);
    return rowCount > 0;
  }

  async function getBioimpedanceOverview(
    patientId?: string | null
  ): Promise<BioimpedanceOverview> {
    const patients = await getPatientOptions();
    const selectedPatientId = getDefaultPatientId(patients, patientId);
    const { rows } = await pool.query(
      `
        select *
        from bioimpedancia_avaliacoes
        where ($1::uuid is null or paciente_id = $1)
        order by avaliado_em
      `,
      [selectedPatientId]
    );

    const assessments: BioimpedanceAssessment[] = rows.map((row) => ({
      id: row.id,
      patientId: row.paciente_id,
      assessedAt: asDate(row.avaliado_em) ?? '',
      massaMagra: asNumber(row.massa_magra),
      gorduraCorporal: asNumber(row.gordura_corporal),
      hidratacao: asNumber(row.hidratacao),
      imc: asNumber(row.imc),
      pesoTotal: asNumber(row.peso_total),
    }));

    const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

    return {
      patients,
      selectedPatientId,
      current: assessments.at(-1) ?? null,
      evolutionData: assessments.map((assessment) => ({
        month: monthFormatter.format(new Date(`${assessment.assessedAt}T00:00:00`)).replace('.', ''),
        massaMagra: assessment.massaMagra,
        gordura: assessment.gorduraCorporal,
        hidratacao: assessment.hidratacao,
        peso: assessment.pesoTotal,
      })),
      imcData: assessments.map((assessment) => ({
        month: monthFormatter.format(new Date(`${assessment.assessedAt}T00:00:00`)).replace('.', ''),
        imc: assessment.imc,
      })),
    };
  }

  async function createBioimpedanceAssessment(assessment: BioimpedanceInput) {
    const { rows } = await pool.query<{ id: string }>(
      `
        insert into bioimpedancia_avaliacoes (
          paciente_id,
          avaliado_em,
          massa_magra,
          gordura_corporal,
          hidratacao,
          imc,
          peso_total
        )
        values ($1, $2, $3, $4, $5, $6, $7)
        returning id
      `,
      [
        assessment.patientId,
        assessment.assessedAt,
        assessment.massaMagra,
        assessment.gorduraCorporal,
        assessment.hidratacao,
        assessment.imc,
        assessment.pesoTotal,
      ]
    );
    return { id: rows[0].id };
  }

  async function updateBioimpedanceAssessment(id: string, assessment: BioimpedanceInput) {
    const { rows } = await pool.query(
      `
        update bioimpedancia_avaliacoes
        set
          paciente_id = $2,
          avaliado_em = $3,
          massa_magra = $4,
          gordura_corporal = $5,
          hidratacao = $6,
          imc = $7,
          peso_total = $8
        where id = $1
        returning *
      `,
      [
        id,
        assessment.patientId,
        assessment.assessedAt,
        assessment.massaMagra,
        assessment.gorduraCorporal,
        assessment.hidratacao,
        assessment.imc,
        assessment.pesoTotal,
      ]
    );

    if (!rows[0]) return null;

    return {
      id: rows[0].id,
      patientId: rows[0].paciente_id,
      assessedAt: asDate(rows[0].avaliado_em) ?? '',
      massaMagra: asNumber(rows[0].massa_magra),
      gorduraCorporal: asNumber(rows[0].gordura_corporal),
      hidratacao: asNumber(rows[0].hidratacao),
      imc: asNumber(rows[0].imc),
      pesoTotal: asNumber(rows[0].peso_total),
    };
  }

  async function deleteBioimpedanceAssessment(id: string) {
    const { rowCount } = await pool.query(
      'delete from bioimpedancia_avaliacoes where id = $1',
      [id]
    );
    return rowCount > 0;
  }

  async function listAlerts(patientId?: string | null) {
    const { rows } = await pool.query(
      `
        select a.*, p.nome as patient
        from alertas_clinicos a
        join pacientes p on p.id = a.paciente_id
        where ($1::uuid is null or a.paciente_id = $1)
        order by a.ocorrido_em desc
      `,
      [patientId ?? null]
    );
    return rows.map(mapAlert);
  }

  async function createAlert(alert: ClinicalAlertInput) {
    const { rows } = await pool.query<{ id: string }>(
      `
        insert into alertas_clinicos (
          paciente_id,
          tipo,
          mensagem,
          recomendacao,
          tempo_label,
          ocorrido_em
        )
        values ($1, $2, $3, $4, $5, $6)
        returning id
      `,
      [
        alert.patientId,
        alert.type,
        alert.message,
        alert.recommendation,
        alert.time,
        alert.occurredAt,
      ]
    );
    return { id: rows[0].id };
  }

  async function updateAlert(id: string, alert: ClinicalAlertInput) {
    const { rows } = await pool.query(
      `
        update alertas_clinicos
        set
          paciente_id = $2,
          tipo = $3,
          mensagem = $4,
          recomendacao = $5,
          tempo_label = $6,
          ocorrido_em = $7
        where id = $1
        returning *
      `,
      [
        id,
        alert.patientId,
        alert.type,
        alert.message,
        alert.recommendation,
        alert.time,
        alert.occurredAt,
      ]
    );

    if (!rows[0]) return null;
    const patient = await getPatient(rows[0].paciente_id);
    return mapAlert({ ...rows[0], patient: patient?.nome ?? '' });
  }

  async function deleteAlert(id: string) {
    const { rowCount } = await pool.query('delete from alertas_clinicos where id = $1', [id]);
    return rowCount > 0;
  }

  async function listTimeline(patientId?: string | null) {
    const { rows } = await pool.query(
      `
        select *
        from timeline_eventos
        where ($1::uuid is null or paciente_id = $1)
        order by ocorrido_em desc
      `,
      [patientId ?? null]
    );
    return rows.map(mapTimeline);
  }

  async function createTimelineEvent(event: TimelineEventInput) {
    const { rows } = await pool.query<{ id: string }>(
      `
        insert into timeline_eventos (
          paciente_id,
          tipo,
          titulo,
          descricao,
          cor,
          ocorrido_em
        )
        values ($1, $2, $3, $4, $5, $6)
        returning id
      `,
      [event.patientId, event.type, event.title, event.description, event.color, event.date]
    );
    return { id: rows[0].id };
  }

  async function updateTimelineEvent(id: string, event: TimelineEventInput) {
    const { rows } = await pool.query(
      `
        update timeline_eventos
        set
          paciente_id = $2,
          tipo = $3,
          titulo = $4,
          descricao = $5,
          cor = $6,
          ocorrido_em = $7
        where id = $1
        returning *
      `,
      [id, event.patientId, event.type, event.title, event.description, event.color, event.date]
    );
    return rows[0] ? mapTimeline(rows[0]) : null;
  }

  async function deleteTimelineEvent(id: string) {
    const { rowCount } = await pool.query('delete from timeline_eventos where id = $1', [id]);
    return rowCount > 0;
  }

  async function getDashboard(): Promise<DashboardData> {
    const [patients, treatments, alerts] = await Promise.all([
      listPatients(),
      listTreatments(),
      listAlerts(),
    ]);

    const activeTreatments = treatments.filter((treatment) => treatment.status === 'active');
    const criticalPatients = patients.filter((patient) => patient.status === 'critical');

    const statusHistory = await pool.query(`
      select mes, normal, atencao, critico
      from dashboard_status_historico
      order by ordem
    `);

    const distribution = new Map<string, number>();
    for (const treatment of treatments) {
      distribution.set(treatment.type, (distribution.get(treatment.type) ?? 0) + 1);
    }

    const colors = ['#ec4899', '#a855f7', '#3b82f6', '#8b5cf6', '#10b981'];

    return {
      statsCards: [
        {
          title: 'Total de Pacientes',
          value: String(patients.length),
          icon: 'users',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          trend: 'Base local',
        },
        {
          title: 'Pacientes Críticos',
          value: String(criticalPatients.length),
          icon: 'alert',
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          trend: criticalPatients.length ? 'Atencao imediata' : 'Sem criticos',
        },
        {
          title: 'Tratamentos Ativos',
          value: String(activeTreatments.length),
          icon: 'activity',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
          trend: 'Em andamento',
        },
        {
          title: 'Alertas Clinicos',
          value: String(alerts.length),
          icon: 'heart',
          color: 'from-pink-500 to-pink-600',
          bgColor: 'bg-pink-50',
          textColor: 'text-pink-600',
          trend: `${alerts.filter((alert) => alert.type === 'critical').length} criticos`,
        },
      ],
      evolutionData: statusHistory.rows.map((row) => ({
        month: row.mes,
        normal: row.normal,
        atencao: row.atencao,
        critico: row.critico,
      })),
      treatmentData: Array.from(distribution.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      })),
      recentPatients: patients.slice(0, 5).map((patient) => ({
        id: patient.id,
        name: patient.nome,
        age: getAge(patient.data_nascimento),
        diagnosis: patient.diagnosticos[0] ? diagnosisLabel(patient.diagnosticos[0]) : 'A vincular',
        status: patient.status,
        lastVisit: patient.created_at?.slice(0, 10) ?? patient.data_nascimento,
        alert: alerts.find((alert) => alert.patientId === patient.id)?.message ?? null,
      })),
      alerts: alerts.slice(0, 5),
    };
  }

  async function getPatientProfile(id: string): Promise<PatientProfile | null> {
    const patient = await getPatient(id);
    if (!patient) return null;

    const [symptoms, exams, timeline, treatments, alerts, settings] = await Promise.all([
      getSymptomsOverview(id),
      getExamsOverview(id),
      listTimeline(id),
      listTreatments(id),
      listAlerts(id),
      getSettings(),
    ]);

    return {
      patient: {
        id: patient.id,
        name: patient.nome,
        age: getAge(patient.data_nascimento),
        cpf: patient.cpf,
        diagnosis: patient.diagnosticos.map(diagnosisLabel),
        status: patient.status,
        riskScore: patient.risk_score,
        professional: settings.medico.nomeProfissional,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        nextAppointment: patient.next_appointment,
      },
      symptomsEvolution: symptoms.evolutionData.map((item) => ({
        date: item.month,
        ...item,
      })),
      labEvolution: exams.hemoglobinaHistory.map((item) => ({
        date: item.month,
        hemoglobina: item.value,
      })),
      timeline,
      treatments,
      alerts,
    };
  }

  async function getSettings(): Promise<AppSettings> {
    const users = await pool.query(`
      select *
      from usuarios_perfis
      order by created_at asc
      limit 1
    `);
    const doctors = await pool.query(`
      select *
      from medicos
      order by created_at asc
      limit 1
    `);

    const user = users.rows[0];
    const doctor = doctors.rows[0];

    return {
      usuario: {
        id: user?.id ?? null,
        nome: user?.nome ?? '',
        cpf: user?.cpf ?? '',
        tipoUsuario: user?.tipo_usuario ?? 'profissional_saude',
        authId: user?.auth_id ?? null,
      },
      medico: {
        id: doctor?.id ?? null,
        nomeProfissional: doctor?.nome_profissional ?? '',
        email: doctor?.email ?? '',
        telefone: doctor?.telefone ?? null,
        dataNascimento: asDate(doctor?.data_nascimento),
        cpf: doctor?.cpf ?? '',
        matricula: doctor?.matricula ?? null,
        cbo: doctor?.cbo ?? null,
        especialidade: doctor?.especialidade ?? null,
      },
    };
  }

  async function updateSettings(settings: AppSettings) {
    const client = await pool.connect();

    try {
      await client.query('begin');

      const userId = settings.usuario.id;
      const userResult = await client.query<{ id: string }>(
        userId
          ? `
              update usuarios_perfis
              set nome = $2, cpf = $3, tipo_usuario = $4, auth_id = $5
              where id = $1
              returning id
            `
          : `
              insert into usuarios_perfis (nome, cpf, tipo_usuario, auth_id)
              values ($2, $3, $4, $5)
              returning id
            `,
        [
          userId,
          settings.usuario.nome,
          settings.usuario.cpf,
          settings.usuario.tipoUsuario,
          settings.usuario.authId,
        ]
      );
      const resolvedUserId = userResult.rows[0].id;

      const doctorId = settings.medico.id;
      await client.query(
        doctorId
          ? `
              update medicos
              set
                usuario_perfil_id = $2,
                nome_profissional = $3,
                email = $4,
                telefone = $5,
                data_nascimento = $6,
                cpf = $7,
                matricula = $8,
                cbo = $9,
                especialidade = $10
              where id = $1
            `
          : `
              insert into medicos (
                id,
                usuario_perfil_id,
                nome_profissional,
                email,
                telefone,
                data_nascimento,
                cpf,
                matricula,
                cbo,
                especialidade
              )
              values (coalesce($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `,
        [
          doctorId,
          resolvedUserId,
          settings.medico.nomeProfissional,
          settings.medico.email,
          settings.medico.telefone,
          settings.medico.dataNascimento,
          settings.medico.cpf,
          settings.medico.matricula,
          settings.medico.cbo,
          settings.medico.especialidade,
        ]
      );

      await client.query('commit');
      return getSettings();
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    listPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    listTreatments,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    getExamsOverview,
    createExamResult,
    updateExamResult,
    deleteExamResult,
    getSymptomsOverview,
    createSymptomAssessment,
    updateSymptomAssessment,
    deleteSymptomAssessment,
    getBioimpedanceOverview,
    createBioimpedanceAssessment,
    updateBioimpedanceAssessment,
    deleteBioimpedanceAssessment,
    listAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    listTimeline,
    createTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    getDashboard,
    getPatientProfile,
    getSettings,
    updateSettings,
  };
}
