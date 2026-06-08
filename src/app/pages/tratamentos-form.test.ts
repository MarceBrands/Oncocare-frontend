import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildTreatmentInput,
  createEmptyTreatmentForm,
  getTreatmentStatusLabel,
  type TreatmentFormState,
} from './tratamentos-form.ts';

function validForm(overrides: Partial<TreatmentFormState> = {}): TreatmentFormState {
  return {
    ...createEmptyTreatmentForm(),
    patientId: 'patient-1',
    type: ' Quimioterapia ',
    protocol: ' AC-T ',
    startDate: '2026-06-01',
    endDate: '2026-09-01',
    lastSession: '2026-06-07',
    plannedSessions: '12',
    completedSessions: '3',
    notes: ' Acompanhamento semanal. ',
    ...overrides,
  };
}

test('buildTreatmentInput normalizes a valid treatment form', () => {
  const result = buildTreatmentInput(validForm());

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(result.treatment, {
    patientId: 'patient-1',
    status: 'active',
    type: 'Quimioterapia',
    protocol: 'AC-T',
    startDate: '2026-06-01',
    endDate: '2026-09-01',
    progress: 25,
    sessions: { completed: 3, total: 12 },
    lastSession: '2026-06-07',
    nextSession: null,
    notes: 'Acompanhamento semanal.',
    adverseEffects: [],
  });
});

test('buildTreatmentInput accepts empty optional treatment fields', () => {
  const result = buildTreatmentInput(
    validForm({
      endDate: '',
      lastSession: '',
      plannedSessions: '',
      completedSessions: '',
      notes: '',
    })
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.treatment.endDate, null);
  assert.equal(result.treatment.lastSession, null);
  assert.equal(result.treatment.notes, null);
  assert.deepEqual(result.treatment.sessions, { completed: 0, total: 0 });
  assert.equal(result.treatment.progress, 0);
});

test('buildTreatmentInput validates required treatment fields', () => {
  assert.deepEqual(buildTreatmentInput(validForm({ patientId: '' })), {
    ok: false,
    error: 'Selecione a paciente.',
  });
  assert.deepEqual(buildTreatmentInput(validForm({ type: '' })), {
    ok: false,
    error: 'Informe o tipo de tratamento.',
  });
  assert.deepEqual(buildTreatmentInput(validForm({ protocol: '' })), {
    ok: false,
    error: 'Informe o protocolo.',
  });
  assert.deepEqual(buildTreatmentInput(validForm({ startDate: '' })), {
    ok: false,
    error: 'Informe a data de inicio.',
  });
});

test('buildTreatmentInput validates treatment session counts', () => {
  assert.deepEqual(buildTreatmentInput(validForm({ plannedSessions: '1.5' })), {
    ok: false,
    error: 'Informe sessoes com numeros inteiros positivos.',
  });
  assert.deepEqual(buildTreatmentInput(validForm({ plannedSessions: '2', completedSessions: '3' })), {
    ok: false,
    error: 'Sessoes realizadas nao pode ser maior que sessoes previstas.',
  });
});

test('getTreatmentStatusLabel returns pt-BR status labels', () => {
  assert.equal(getTreatmentStatusLabel('active'), 'Em andamento');
  assert.equal(getTreatmentStatusLabel('scheduled'), 'Agendado');
  assert.equal(getTreatmentStatusLabel('completed'), 'Concluido');
  assert.equal(getTreatmentStatusLabel('interrupted'), 'Interrompido');
  assert.equal(getTreatmentStatusLabel('unknown'), 'unknown');
});
