export type PacienteRow = {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string;
  medico_id: string | null;
  created_at: string | null;
  usuario_perfil_id: string | null;
  cadastrado_por_medico_id: string | null;
  updated_at: string | null;
  tipo_atendimento: string;
  tipo_atendimento_id: number | null;
};

export type CreatePatientInput = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  tipo_atendimento: string;
  diagnosticos: Array<'mama' | 'colo_utero'>;
  observacoes: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body.error === 'string'
        ? body.error
        : 'Nao foi possivel concluir a requisicao.';
    throw new Error(message);
  }

  return body as T;
}

export function listPatients() {
  return request<PacienteRow[]>('/api/pacientes');
}

export function createPatient(patient: CreatePatientInput) {
  return request<{ id: string }>('/api/pacientes', {
    method: 'POST',
    body: JSON.stringify(patient),
  });
}

