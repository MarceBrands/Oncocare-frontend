import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import type {
  AppSettings,
  BioimpedanceAssessment,
  BioimpedanceInput,
  BioimpedanceOverview,
  ClinicalAlert,
  ClinicalAlertInput,
  DashboardData,
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
} from './api-types.ts';
import { handleApiRequest } from './api-router.ts';
import type { ApiRepository } from './repository.ts';

class MemoryRepository implements ApiRepository {
  patients: Patient[] = [
    {
      id: 'patient-1',
      nome: 'Maria Santos',
      data_nascimento: '1980-01-01',
      cpf: '123',
      medico_id: null,
      created_at: '2026-01-01T00:00:00.000Z',
      usuario_perfil_id: null,
      cadastrado_por_medico_id: null,
      updated_at: null,
      tipo_atendimento: 'SUS',
      tipo_atendimento_id: 1,
      status: 'critical',
      risk_score: 8.5,
      phone: null,
      email: null,
      address: null,
      next_appointment: '2026-06-05',
      diagnosticos: ['mama'],
    },
  ];
  treatments: Treatment[] = [
    {
      id: 'treatment-1',
      patientId: 'patient-1',
      patient: 'Maria Santos',
      type: 'Quimioterapia',
      protocol: 'AC-T',
      status: 'active',
      startDate: '2026-03-01',
      endDate: '2026-07-15',
      progress: 70,
      sessions: { completed: 8, total: 12 },
      nextSession: '2026-06-05',
      adverseEffects: ['Fadiga'],
    },
  ];
  exams: ExamResult[] = [
    {
      id: 'exam-1',
      patientId: 'patient-1',
      categoryId: 'hemograma',
      name: 'Hemoglobina',
      value: 7.2,
      unit: 'g/dL',
      reference: '12 - 16',
      status: 'critical',
      trend: 'down',
      collectedAt: '2026-05-28',
    },
  ];
  symptoms: SymptomAssessment[] = [
    {
      id: 'symptom-1',
      patientId: 'patient-1',
      assessedAt: '2026-05-30',
      qualityOfLifeScore: 3.2,
      symptoms: [{ id: 'fadiga', name: 'Fadiga', value: 9, color: '#fff' }],
    },
  ];
  bio: BioimpedanceAssessment[] = [
    {
      id: 'bio-1',
      patientId: 'patient-1',
      assessedAt: '2026-05-30',
      massaMagra: 42.5,
      gorduraCorporal: 32.8,
      hidratacao: 51.2,
      imc: 26.4,
      pesoTotal: 68.5,
    },
  ];
  alerts: ClinicalAlert[] = [
    {
      id: 'alert-1',
      patientId: 'patient-1',
      patient: 'Maria Santos',
      type: 'critical',
      message: 'Hemoglobina baixa',
      recommendation: 'Avaliar',
      time: '2h atras',
      occurredAt: '2026-05-30',
    },
  ];
  timeline: TimelineEvent[] = [
    {
      id: 'timeline-1',
      patientId: 'patient-1',
      date: '2026-05-30',
      type: 'alert',
      title: 'Alerta',
      description: 'Hemoglobina baixa',
      color: 'red',
    },
  ];
  settings: AppSettings = {
    usuario: {
      id: 'user-1',
      nome: 'Dra. Ana',
      cpf: '999',
      tipoUsuario: 'profissional_saude',
      authId: null,
    },
    medico: {
      id: 'doctor-1',
      nomeProfissional: 'Dra. Ana',
      email: 'ana@example.com',
      telefone: null,
      dataNascimento: null,
      cpf: '999',
      matricula: null,
      cbo: null,
      especialidade: 'Oncologia',
    },
  };

  async listPatients() {
    return this.patients;
  }

  async getPatient(id: string) {
    return this.patients.find((patient) => patient.id === id) ?? null;
  }

  async createPatient(patient: PatientInput) {
    const id = `patient-${this.patients.length + 1}`;
    this.patients.push({
      id,
      nome: patient.nome,
      data_nascimento: patient.data_nascimento,
      cpf: patient.cpf,
      medico_id: null,
      created_at: '2026-01-01T00:00:00.000Z',
      usuario_perfil_id: null,
      cadastrado_por_medico_id: null,
      updated_at: null,
      tipo_atendimento: patient.tipo_atendimento,
      tipo_atendimento_id: 1,
      status: patient.status ?? 'stable',
      risk_score: patient.risk_score ?? null,
      phone: patient.phone ?? null,
      email: patient.email ?? null,
      address: patient.address ?? null,
      next_appointment: patient.next_appointment ?? null,
      diagnosticos: patient.diagnosticos ?? [],
    });
    return { id };
  }

  async updatePatient(id: string, patient: PatientInput) {
    const current = await this.getPatient(id);
    if (!current) return null;

    Object.assign(current, {
      nome: patient.nome,
      cpf: patient.cpf,
      data_nascimento: patient.data_nascimento,
      tipo_atendimento: patient.tipo_atendimento,
    });
    return current;
  }

  async deletePatient(id: string) {
    const before = this.patients.length;
    this.patients = this.patients.filter((patient) => patient.id !== id);
    return this.patients.length !== before;
  }

  async listTreatments(patientId?: string | null) {
    return patientId
      ? this.treatments.filter((treatment) => treatment.patientId === patientId)
      : this.treatments;
  }

  async createTreatment(treatment: TreatmentInput) {
    const id = `treatment-${this.treatments.length + 1}`;
    this.treatments.push({
      id,
      ...treatment,
      patient: this.patients.find((patient) => patient.id === treatment.patientId)?.nome ?? '',
    });
    return { id };
  }

  async updateTreatment(id: string, treatment: TreatmentInput) {
    const index = this.treatments.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.treatments[index] = { ...this.treatments[index], ...treatment };
    return this.treatments[index];
  }

  async deleteTreatment(id: string) {
    const before = this.treatments.length;
    this.treatments = this.treatments.filter((treatment) => treatment.id !== id);
    return this.treatments.length !== before;
  }

  async getExamsOverview(): Promise<ExamsOverview> {
    return {
      patients: this.patients.map((patient) => ({ id: patient.id, name: patient.nome })),
      selectedPatientId: 'patient-1',
      categories: [{ id: 'hemograma', name: 'Hemograma', iconKey: 'activity' }],
      examsData: { hemograma: this.exams },
      hemoglobinaHistory: [{ month: 'Mai', value: 7.2, min: 12, max: 16 }],
      lastCollection: '2026-05-28',
    };
  }

  async createExamResult(exam: ExamInput) {
    const id = `exam-${this.exams.length + 1}`;
    this.exams.push({ id, ...exam });
    return { id };
  }

  async updateExamResult(id: string, exam: ExamInput) {
    const index = this.exams.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.exams[index] = { id, ...exam };
    return this.exams[index];
  }

  async deleteExamResult(id: string) {
    const before = this.exams.length;
    this.exams = this.exams.filter((exam) => exam.id !== id);
    return this.exams.length !== before;
  }

  async getSymptomsOverview(): Promise<SymptomsOverview> {
    return {
      patients: this.patients.map((patient) => ({ id: patient.id, name: patient.nome })),
      selectedPatientId: 'patient-1',
      assessment: this.symptoms[0],
      evolutionData: [{ month: 'Mai', fadiga: 9, dor: 8, nausea: 7, ansiedade: 9, sono: 4 }],
    };
  }

  async createSymptomAssessment(assessment: SymptomAssessmentInput) {
    const id = `symptom-${this.symptoms.length + 1}`;
    this.symptoms.push({ id, ...assessment });
    return { id };
  }

  async updateSymptomAssessment(id: string, assessment: SymptomAssessmentInput) {
    const index = this.symptoms.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.symptoms[index] = { id, ...assessment };
    return this.symptoms[index];
  }

  async deleteSymptomAssessment(id: string) {
    const before = this.symptoms.length;
    this.symptoms = this.symptoms.filter((assessment) => assessment.id !== id);
    return this.symptoms.length !== before;
  }

  async getBioimpedanceOverview(): Promise<BioimpedanceOverview> {
    return {
      patients: this.patients.map((patient) => ({ id: patient.id, name: patient.nome })),
      selectedPatientId: 'patient-1',
      current: this.bio[0],
      evolutionData: [{ month: 'Mai', massaMagra: 42.5, gordura: 32.8, hidratacao: 51.2, peso: 68.5 }],
      imcData: [{ month: 'Mai', imc: 26.4 }],
    };
  }

  async createBioimpedanceAssessment(assessment: BioimpedanceInput) {
    const id = `bio-${this.bio.length + 1}`;
    this.bio.push({ id, ...assessment });
    return { id };
  }

  async updateBioimpedanceAssessment(id: string, assessment: BioimpedanceInput) {
    const index = this.bio.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.bio[index] = { id, ...assessment };
    return this.bio[index];
  }

  async deleteBioimpedanceAssessment(id: string) {
    const before = this.bio.length;
    this.bio = this.bio.filter((assessment) => assessment.id !== id);
    return this.bio.length !== before;
  }

  async listAlerts() {
    return this.alerts;
  }

  async createAlert(alert: ClinicalAlertInput) {
    const id = `alert-${this.alerts.length + 1}`;
    this.alerts.push({ id, ...alert, patient: 'Maria Santos' });
    return { id };
  }

  async updateAlert(id: string, alert: ClinicalAlertInput) {
    const index = this.alerts.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.alerts[index] = { id, ...alert, patient: 'Maria Santos' };
    return this.alerts[index];
  }

  async deleteAlert(id: string) {
    const before = this.alerts.length;
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
    return this.alerts.length !== before;
  }

  async listTimeline() {
    return this.timeline;
  }

  async createTimelineEvent(event: TimelineEventInput) {
    const id = `timeline-${this.timeline.length + 1}`;
    this.timeline.push({ id, ...event });
    return { id };
  }

  async updateTimelineEvent(id: string, event: TimelineEventInput) {
    const index = this.timeline.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.timeline[index] = { id, ...event };
    return this.timeline[index];
  }

  async deleteTimelineEvent(id: string) {
    const before = this.timeline.length;
    this.timeline = this.timeline.filter((event) => event.id !== id);
    return this.timeline.length !== before;
  }

  async getDashboard(): Promise<DashboardData> {
    return {
      statsCards: [],
      evolutionData: [],
      treatmentData: [],
      recentPatients: [],
      alerts: this.alerts,
    };
  }

  async getPatientProfile(id: string): Promise<PatientProfile | null> {
    const patient = await this.getPatient(id);
    if (!patient) return null;
    return {
      patient: {
        id,
        name: patient.nome,
        age: 46,
        cpf: patient.cpf,
        diagnosis: ['Cancer de Mama'],
        status: patient.status,
        riskScore: patient.risk_score,
        professional: 'Dra. Ana',
        phone: null,
        email: null,
        address: null,
        nextAppointment: null,
      },
      symptomsEvolution: [],
      labEvolution: [],
      timeline: this.timeline,
      treatments: this.treatments,
      alerts: this.alerts,
    };
  }

  async getSettings() {
    return this.settings;
  }

  async updateSettings(settings: AppSettings) {
    this.settings = settings;
    return settings;
  }
}

const repo = new MemoryRepository();

async function request(path: string, init?: RequestInit) {
  const body = init?.body ? String(init.body) : '';
  const req = Readable.from(body ? [body] : []);
  Object.assign(req, {
    method: init?.method ?? 'GET',
    url: path,
  });

  return new Promise<{ response: { status: number }; body: any }>((resolve) => {
    let responseBody = '';
    const res = {
      statusCode: 200,
      setHeader() {},
      end(chunk?: unknown) {
        if (typeof chunk === 'string') {
          responseBody += chunk;
        }

        resolve({
          response: { status: this.statusCode },
          body: responseBody ? JSON.parse(responseBody) : null,
        });
      },
    };

    void handleApiRequest(repo, req as any, res as any);
  });
}

test('patients route supports list, create, update, delete', async () => {
  const list = await request('/api/pacientes');
  assert.equal(list.response.status, 200);
  assert.equal(list.body[0].id, 'patient-1');

  const created = await request('/api/pacientes', {
    method: 'POST',
    body: JSON.stringify({
      nome: 'Ana',
      cpf: '456',
      data_nascimento: '1981-01-01',
      tipo_atendimento: 'SUS',
      diagnosticos: ['mama'],
    }),
  });
  assert.equal(created.response.status, 201);

  const updated = await request(`/api/pacientes/${created.body.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nome: 'Ana Atualizada',
      cpf: '456',
      data_nascimento: '1981-01-01',
      tipo_atendimento: 'SUS',
    }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.nome, 'Ana Atualizada');

  const deleted = await request(`/api/pacientes/${created.body.id}`, { method: 'DELETE' });
  assert.equal(deleted.response.status, 204);
});

test('dashboard and profile routes return query payloads', async () => {
  const dashboard = await request('/api/dashboard');
  assert.equal(dashboard.response.status, 200);
  assert.ok(Array.isArray(dashboard.body.alerts));

  const profile = await request('/api/pacientes/patient-1/perfil');
  assert.equal(profile.response.status, 200);
  assert.equal(profile.body.patient.id, 'patient-1');
});

test('resource routes expose CRUD endpoints', async () => {
  const treatment = await request('/api/tratamentos', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-1',
      type: 'Radioterapia',
      protocol: 'RT',
      status: 'active',
      startDate: '2026-01-01',
      endDate: null,
      progress: 10,
      sessions: { completed: 1, total: 10 },
      nextSession: null,
      adverseEffects: [],
    }),
  });
  assert.equal(treatment.response.status, 201);
  assert.equal((await request('/api/tratamentos')).response.status, 200);
  assert.equal(
    (await request(`/api/tratamentos/${treatment.body.id}`, { method: 'DELETE' })).response.status,
    204
  );

  const exam = await request('/api/exames/resultados', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-1',
      categoryId: 'hemograma',
      name: 'Plaquetas',
      value: 180,
      unit: '/uL',
      reference: '150 - 400',
      status: 'normal',
      collectedAt: '2026-01-01',
    }),
  });
  assert.equal(exam.response.status, 201);
  assert.equal((await request('/api/exames')).response.status, 200);
  assert.equal(
    (await request(`/api/exames/resultados/${exam.body.id}`, { method: 'DELETE' })).response.status,
    204
  );

  const symptom = await request('/api/sintomas/avaliacoes', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-1',
      assessedAt: '2026-01-01',
      qualityOfLifeScore: 6,
      symptoms: [],
    }),
  });
  assert.equal(symptom.response.status, 201);
  assert.equal((await request('/api/sintomas')).response.status, 200);
  assert.equal(
    (await request(`/api/sintomas/avaliacoes/${symptom.body.id}`, { method: 'DELETE' })).response
      .status,
    204
  );

  const bio = await request('/api/bioimpedancia/avaliacoes', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-1',
      assessedAt: '2026-01-01',
      massaMagra: 42,
      gorduraCorporal: 30,
      hidratacao: 51,
      imc: 25,
      pesoTotal: 68,
    }),
  });
  assert.equal(bio.response.status, 201);
  assert.equal((await request('/api/bioimpedancia')).response.status, 200);
  assert.equal(
    (await request(`/api/bioimpedancia/avaliacoes/${bio.body.id}`, { method: 'DELETE' })).response
      .status,
    204
  );
});

test('alerts, timeline, and settings routes are available', async () => {
  const alert = await request('/api/alertas', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-1',
      type: 'warning',
      message: 'Aviso',
      recommendation: null,
      time: null,
      occurredAt: '2026-01-01',
    }),
  });
  assert.equal(alert.response.status, 201);
  assert.equal((await request('/api/alertas')).response.status, 200);
  assert.equal((await request(`/api/alertas/${alert.body.id}`, { method: 'DELETE' })).response.status, 204);

  const event = await request('/api/timeline', {
    method: 'POST',
    body: JSON.stringify({
      patientId: 'patient-1',
      date: '2026-01-01',
      type: 'note',
      title: 'Nota',
      description: 'Descricao',
      color: 'blue',
    }),
  });
  assert.equal(event.response.status, 201);
  assert.equal((await request('/api/timeline')).response.status, 200);
  assert.equal((await request(`/api/timeline/${event.body.id}`, { method: 'DELETE' })).response.status, 204);

  const settings = await request('/api/configuracoes');
  assert.equal(settings.response.status, 200);
  settings.body.usuario.nome = 'Dra. Atualizada';
  const updated = await request('/api/configuracoes', {
    method: 'PUT',
    body: JSON.stringify(settings.body),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.usuario.nome, 'Dra. Atualizada');
});
