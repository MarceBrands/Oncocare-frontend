import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createPatient, getDashboard, listTreatments } from './api.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(response: {
  ok: boolean;
  status?: number;
  body?: unknown;
}) {
  globalThis.fetch = async () =>
    ({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 500),
      json: async () => response.body,
    }) as Response;
}

test('getDashboard requests the dashboard endpoint', async () => {
  const body = {
    statsCards: [],
    evolutionData: [],
    treatmentData: [],
    recentPatients: [],
    alerts: [],
  };
  let requestedPath = '';

  globalThis.fetch = async (input) => {
    requestedPath = String(input);
    return {
      ok: true,
      status: 200,
      json: async () => body,
    } as Response;
  };

  assert.deepEqual(await getDashboard(), body);
  assert.equal(requestedPath, '/api/dashboard');
});

test('listTreatments includes patientId query when provided', async () => {
  let requestedPath = '';

  globalThis.fetch = async (input) => {
    requestedPath = String(input);
    return {
      ok: true,
      status: 200,
      json: async () => [],
    } as Response;
  };

  await listTreatments('patient-1');
  assert.equal(requestedPath, '/api/tratamentos?patientId=patient-1');
});

test('createPatient posts json body', async () => {
  let requestInit: RequestInit | undefined;

  globalThis.fetch = async (_input, init) => {
    requestInit = init;
    return {
      ok: true,
      status: 201,
      json: async () => ({ id: 'patient-1' }),
    } as Response;
  };

  await createPatient({
    nome: 'Maria',
    cpf: '123',
    data_nascimento: '1980-01-01',
    tipo_atendimento: 'SUS',
    diagnosticos: ['mama'],
    observacoes: null,
  });

  assert.equal(requestInit?.method, 'POST');
  assert.equal(
    requestInit?.body,
    JSON.stringify({
      nome: 'Maria',
      cpf: '123',
      data_nascimento: '1980-01-01',
      tipo_atendimento: 'SUS',
      diagnosticos: ['mama'],
      observacoes: null,
    })
  );
});

test('api client throws server error messages', async () => {
  mockFetch({
    ok: false,
    status: 400,
    body: { error: 'Falhou' },
  });

  await assert.rejects(() => getDashboard(), /Falhou/);
});
