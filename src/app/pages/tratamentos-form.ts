import type { TreatmentInput } from '../../lib/api';

export type TreatmentStatus = 'active' | 'scheduled' | 'completed' | 'interrupted';

export type TreatmentFormState = {
  patientId: string;
  status: TreatmentStatus;
  type: string;
  protocol: string;
  startDate: string;
  endDate: string;
  lastSession: string;
  plannedSessions: string;
  completedSessions: string;
  notes: string;
};

export type TreatmentFormResult =
  | { ok: true; treatment: TreatmentInput }
  | { ok: false; error: string };

export const treatmentStatusOptions: Array<{ value: TreatmentStatus; label: string }> = [
  { value: 'active', label: 'Em andamento' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'completed', label: 'Concluido' },
  { value: 'interrupted', label: 'Interrompido' },
];

export function createEmptyTreatmentForm(): TreatmentFormState {
  return {
    patientId: '',
    status: 'active',
    type: '',
    protocol: '',
    startDate: '',
    endDate: '',
    lastSession: '',
    plannedSessions: '',
    completedSessions: '',
    notes: '',
  };
}

export function getTreatmentStatusLabel(status: string) {
  return treatmentStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function buildTreatmentInput(form: TreatmentFormState): TreatmentFormResult {
  const patientId = form.patientId.trim();
  const type = form.type.trim();
  const protocol = form.protocol.trim();
  const startDate = form.startDate.trim();
  const plannedSessions = parseSessionCount(form.plannedSessions);
  const completedSessions = parseSessionCount(form.completedSessions);

  if (!patientId) {
    return { ok: false, error: 'Selecione a paciente.' };
  }

  if (!type) {
    return { ok: false, error: 'Informe o tipo de tratamento.' };
  }

  if (!protocol) {
    return { ok: false, error: 'Informe o protocolo.' };
  }

  if (!startDate) {
    return { ok: false, error: 'Informe a data de inicio.' };
  }

  if (plannedSessions === null || completedSessions === null) {
    return { ok: false, error: 'Informe sessoes com numeros inteiros positivos.' };
  }

  if (completedSessions > plannedSessions) {
    return { ok: false, error: 'Sessoes realizadas nao pode ser maior que sessoes previstas.' };
  }

  return {
    ok: true,
    treatment: {
      patientId,
      status: form.status,
      type,
      protocol,
      startDate,
      endDate: emptyToNull(form.endDate),
      progress: calculateProgress(completedSessions, plannedSessions),
      sessions: {
        completed: completedSessions,
        total: plannedSessions,
      },
      lastSession: emptyToNull(form.lastSession),
      nextSession: null,
      notes: emptyToNull(form.notes.trim()),
      adverseEffects: [],
    },
  };
}

function parseSessionCount(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  return Number(normalized);
}

function calculateProgress(completed: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function emptyToNull(value: string) {
  const normalized = value.trim();
  return normalized ? normalized : null;
}
