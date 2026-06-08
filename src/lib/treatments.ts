import type { PacienteTratamentoRow } from './supabase';

export type TreatmentFormValues = Pick<
  PacienteTratamentoRow,
  | 'paciente_id'
  | 'tipo_tratamento'
  | 'status'
  | 'data_inicio'
  | 'data_fim'
  | 'observacoes'
  | 'sessoes_previstas'
  | 'sessoes_realizadas'
  | 'ultima_sessao'
>;

export type TreatmentValidationResult = {
  valid: boolean;
  errors: string[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toLocalDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

export function formatDate(date: string | null) {
  return date ? toLocalDate(date).toLocaleDateString('pt-BR') : 'Nao informado';
}

export function getTreatmentCompletion(treatment: Pick<PacienteTratamentoRow, 'sessoes_previstas' | 'sessoes_realizadas'>) {
  const planned = treatment.sessoes_previstas ?? 0;
  const completed = treatment.sessoes_realizadas ?? 0;

  if (planned <= 0) {
    return null;
  }

  return Math.min(100, Math.round((completed / planned) * 100));
}

export function formatCompletion(treatment: Pick<PacienteTratamentoRow, 'sessoes_previstas' | 'sessoes_realizadas'>) {
  const completion = getTreatmentCompletion(treatment);
  return completion === null ? null : `${completion}% concluido`;
}

export function getDaysSinceLastSession(treatment: Pick<PacienteTratamentoRow, 'ultima_sessao'>) {
  if (!treatment.ultima_sessao) {
    return null;
  }

  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastSession = toLocalDate(treatment.ultima_sessao);
  return Math.max(0, Math.floor((currentDate.getTime() - lastSession.getTime()) / MS_PER_DAY));
}

export function formatTimeSinceLastSession(treatment: Pick<PacienteTratamentoRow, 'ultima_sessao'>) {
  const days = getDaysSinceLastSession(treatment);

  if (days === null) {
    return 'Ultima sessao nao informada';
  }

  if (days < 30) {
    return `${days} ${days === 1 ? 'dia' : 'dias'} desde a ultima sessao`;
  }

  if (days < 365) {
    const months = Math.max(1, Math.floor(days / 30));
    return `${months} ${months === 1 ? 'mes' : 'meses'} desde a ultima sessao`;
  }

  const years = Math.max(1, Math.floor(days / 365));
  return `${years} ${years === 1 ? 'ano' : 'anos'} desde a ultima sessao`;
}

export function validateTreatment(values: TreatmentFormValues): TreatmentValidationResult {
  const errors: string[] = [];
  const planned = values.sessoes_previstas ?? 0;
  const completed = values.sessoes_realizadas ?? 0;
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!values.paciente_id) {
    errors.push('Selecione uma paciente.');
  }

  if (!values.tipo_tratamento.trim()) {
    errors.push('Informe o tipo de tratamento.');
  }

  if (planned < 0) {
    errors.push('Sessoes previstas nao pode ser negativa.');
  }

  if (completed < 0) {
    errors.push('Sessoes realizadas nao pode ser negativa.');
  }

  if (values.sessoes_previstas !== null && planned > 0 && completed > planned) {
    errors.push('Sessoes realizadas nao pode ser maior que sessoes previstas.');
  }

  if (values.ultima_sessao && toLocalDate(values.ultima_sessao) > currentDate) {
    errors.push('Ultima sessao nao pode ser maior que a data atual.');
  }

  if (values.data_inicio && values.data_fim && toLocalDate(values.data_fim) < toLocalDate(values.data_inicio)) {
    errors.push('Data de termino nao pode ser anterior a data de inicio.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getTreatmentCriticalitySignals(treatment: PacienteTratamentoRow) {
  const completion = getTreatmentCompletion(treatment);
  const daysSinceLastSession = getDaysSinceLastSession(treatment);
  const normalizedStatus = treatment.status.toLowerCase();

  return {
    completion,
    daysSinceLastSession,
    completedRecently: normalizedStatus.includes('concl') && daysSinceLastSession !== null && daysSinceLastSession < 30,
    interrupted: normalizedStatus.includes('interromp'),
    lowAdherence: completion !== null && completion < 50 && normalizedStatus.includes('andamento'),
  };
}
