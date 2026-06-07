import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  createAlert,
  createBioimpedanceAssessment,
  createExamResult,
  createPatient,
  createSymptomAssessment,
  createTimelineEvent,
  createTreatment,
  deleteAlert,
  deleteBioimpedanceAssessment,
  deleteExamResult,
  deletePatient,
  deleteSymptomAssessment,
  deleteTimelineEvent,
  deleteTreatment,
  getBioimpedanceOverview,
  getDashboard,
  getExamsOverview,
  getPatient,
  getPatientProfile,
  getSettings,
  getSymptomsOverview,
  listAlerts,
  listPatients,
  listTimeline,
  listTreatments,
  updateAlert,
  updateBioimpedanceAssessment,
  updateExamResult,
  updatePatient,
  updateSettings,
  updateSymptomAssessment,
  updateTimelineEvent,
  updateTreatment,
} from './api.ts';

const originalFetch = globalThis.fetch;

type FetchCall = {
  input: string;
  init?: RequestInit;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(response: {
  ok: boolean;
  status?: number;
  body?: unknown;
  calls?: FetchCall[];
}) {
  globalThis.fetch = async (input, init) => {
    response.calls?.push({ input: String(input), init });

    return {
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 500),
      json: async () => response.body,
    } as Response;
  };
}

function createPatientPayload() {
  return {
    nome: 'Maria',
    cpf: '123',
    data_nascimento: '1980-01-01',
    tipo_atendimento: 'SUS',
    diagnosticos: ['mama' as const],
    observacoes: null,
  };
}

function createTreatmentPayload() {
  return {
    patientId: 'patient-1',
    type: 'Quimioterapia',
    protocol: 'AC-T',
    status: 'active',
    startDate: '2026-01-01',
    endDate: null,
    progress: 10,
    sessions: { completed: 1, total: 10 },
    nextSession: null,
    adverseEffects: [],
  };
}

function createExamPayload() {
  return {
    patientId: 'patient-1',
    categoryId: 'hemograma',
    name: 'Hemoglobina',
    value: 12,
    unit: 'g/dL',
    reference: '12 - 16',
    status: 'normal' as const,
    trend: 'stable' as const,
    collectedAt: '2026-01-01',
  };
}

function createSymptomPayload() {
  return {
    patientId: 'patient-1',
    assessedAt: '2026-01-01',
    qualityOfLifeScore: 7,
    symptoms: [{ id: 'fadiga', name: 'Fadiga', value: 7, color: '#fff' }],
  };
}

function createBioimpedancePayload() {
  return {
    patientId: 'patient-1',
    assessedAt: '2026-01-01',
    massaMagra: 42,
    gorduraCorporal: 30,
    hidratacao: 51,
    imc: 25,
    pesoTotal: 68,
  };
}

function createAlertPayload() {
  return {
    patientId: 'patient-1',
    type: 'warning' as const,
    message: 'Aviso',
    recommendation: null,
    time: null,
    occurredAt: '2026-01-01',
  };
}

function createTimelinePayload() {
  return {
    patientId: 'patient-1',
    date: '2026-01-01',
    type: 'note',
    title: 'Nota',
    description: 'Descricao',
    color: 'blue',
  };
}

function createSettingsPayload() {
  return {
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
}

test('query helpers request the expected endpoints', async () => {
  const calls: FetchCall[] = [];
  mockFetch({ ok: true, body: {}, calls });

  await listPatients();
  await getPatient('patient-1');
  await getDashboard();
  await getPatientProfile('patient-1');
  await listTreatments('patient 1');
  await getExamsOverview('patient 1');
  await getSymptomsOverview('patient 1');
  await getBioimpedanceOverview('patient 1');
  await listAlerts('patient 1');
  await listTimeline('patient 1');
  await getSettings();

  assert.deepEqual(
    calls.map((call) => call.input),
    [
      '/api/pacientes',
      '/api/pacientes/patient-1',
      '/api/dashboard',
      '/api/pacientes/patient-1/perfil',
      '/api/tratamentos?patientId=patient%201',
      '/api/exames?patientId=patient%201',
      '/api/sintomas?patientId=patient%201',
      '/api/bioimpedancia?patientId=patient%201',
      '/api/alertas?patientId=patient%201',
      '/api/timeline?patientId=patient%201',
      '/api/configuracoes',
    ]
  );
});

test('mutation helpers send the expected method, endpoint, and json body', async () => {
  const cases: Array<{
    run: () => Promise<unknown>;
    path: string;
    method: string;
    body: unknown;
  }> = [
    {
      run: () => createPatient(createPatientPayload()),
      path: '/api/pacientes',
      method: 'POST',
      body: createPatientPayload(),
    },
    {
      run: () => updatePatient('patient-1', createPatientPayload()),
      path: '/api/pacientes/patient-1',
      method: 'PUT',
      body: createPatientPayload(),
    },
    {
      run: () => createTreatment(createTreatmentPayload()),
      path: '/api/tratamentos',
      method: 'POST',
      body: createTreatmentPayload(),
    },
    {
      run: () => updateTreatment('treatment-1', createTreatmentPayload()),
      path: '/api/tratamentos/treatment-1',
      method: 'PUT',
      body: createTreatmentPayload(),
    },
    {
      run: () => createExamResult(createExamPayload()),
      path: '/api/exames/resultados',
      method: 'POST',
      body: createExamPayload(),
    },
    {
      run: () => updateExamResult('exam-1', createExamPayload()),
      path: '/api/exames/resultados/exam-1',
      method: 'PUT',
      body: createExamPayload(),
    },
    {
      run: () => createSymptomAssessment(createSymptomPayload()),
      path: '/api/sintomas/avaliacoes',
      method: 'POST',
      body: createSymptomPayload(),
    },
    {
      run: () => updateSymptomAssessment('symptom-1', createSymptomPayload()),
      path: '/api/sintomas/avaliacoes/symptom-1',
      method: 'PUT',
      body: createSymptomPayload(),
    },
    {
      run: () => createBioimpedanceAssessment(createBioimpedancePayload()),
      path: '/api/bioimpedancia/avaliacoes',
      method: 'POST',
      body: createBioimpedancePayload(),
    },
    {
      run: () => updateBioimpedanceAssessment('bio-1', createBioimpedancePayload()),
      path: '/api/bioimpedancia/avaliacoes/bio-1',
      method: 'PUT',
      body: createBioimpedancePayload(),
    },
    {
      run: () => createAlert(createAlertPayload()),
      path: '/api/alertas',
      method: 'POST',
      body: createAlertPayload(),
    },
    {
      run: () => updateAlert('alert-1', createAlertPayload()),
      path: '/api/alertas/alert-1',
      method: 'PUT',
      body: createAlertPayload(),
    },
    {
      run: () => createTimelineEvent(createTimelinePayload()),
      path: '/api/timeline',
      method: 'POST',
      body: createTimelinePayload(),
    },
    {
      run: () => updateTimelineEvent('timeline-1', createTimelinePayload()),
      path: '/api/timeline/timeline-1',
      method: 'PUT',
      body: createTimelinePayload(),
    },
    {
      run: () => updateSettings(createSettingsPayload()),
      path: '/api/configuracoes',
      method: 'PUT',
      body: createSettingsPayload(),
    },
  ];

  for (const testCase of cases) {
    const calls: FetchCall[] = [];
    mockFetch({ ok: true, status: testCase.method === 'POST' ? 201 : 200, body: {}, calls });

    await testCase.run();

    assert.equal(calls[0].input, testCase.path);
    assert.equal(calls[0].init?.method, testCase.method);
    assert.equal(calls[0].init?.body, JSON.stringify(testCase.body));
  }
});

test('delete helpers issue DELETE and return null for no-content responses', async () => {
  const cases: Array<{ run: () => Promise<unknown>; path: string }> = [
    { run: () => deletePatient('patient-1'), path: '/api/pacientes/patient-1' },
    { run: () => deleteTreatment('treatment-1'), path: '/api/tratamentos/treatment-1' },
    { run: () => deleteExamResult('exam-1'), path: '/api/exames/resultados/exam-1' },
    { run: () => deleteSymptomAssessment('symptom-1'), path: '/api/sintomas/avaliacoes/symptom-1' },
    { run: () => deleteBioimpedanceAssessment('bio-1'), path: '/api/bioimpedancia/avaliacoes/bio-1' },
    { run: () => deleteAlert('alert-1'), path: '/api/alertas/alert-1' },
    { run: () => deleteTimelineEvent('timeline-1'), path: '/api/timeline/timeline-1' },
  ];

  for (const testCase of cases) {
    const calls: FetchCall[] = [];
    mockFetch({ ok: true, status: 204, body: null, calls });

    assert.equal(await testCase.run(), null);
    assert.equal(calls[0].input, testCase.path);
    assert.equal(calls[0].init?.method, 'DELETE');
  }
});

test('api client throws server error messages', async () => {
  mockFetch({
    ok: false,
    status: 400,
    body: { error: 'Falhou' },
  });

  await assert.rejects(() => getDashboard(), /Falhou/);
});
