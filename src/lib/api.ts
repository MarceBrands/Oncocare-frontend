export type DiagnosisType = 'mama' | 'colo_utero';

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
  status: 'stable' | 'attention' | 'critical';
  risk_score: number | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  next_appointment: string | null;
  diagnosticos: DiagnosisType[];
};

export type CreatePatientInput = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  tipo_atendimento: string;
  diagnosticos: DiagnosisType[];
  observacoes: string | null;
};

export type Treatment = {
  id: string;
  patientId: string;
  patient: string;
  type: string;
  protocol: string;
  status: string;
  startDate: string;
  endDate: string | null;
  progress: number;
  sessions: {
    completed: number;
    total: number;
  };
  nextSession: string | null;
  adverseEffects: string[];
};

export type DashboardData = {
  statsCards: Array<{
    title: string;
    value: string;
    icon: string;
    color: string;
    bgColor: string;
    textColor: string;
    trend: string;
  }>;
  evolutionData: Array<{ month: string; normal: number; atencao: number; critico: number }>;
  treatmentData: Array<{ name: string; value: number; color: string }>;
  recentPatients: Array<{
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    status: 'stable' | 'attention' | 'critical';
    lastVisit: string;
    alert: string | null;
  }>;
  alerts: Array<{
    id: string;
    patientId: string;
    patient: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    recommendation: string | null;
    time: string | null;
    occurredAt: string;
  }>;
};

export type ExamResult = {
  id: string;
  patientId: string;
  categoryId: string;
  name: string;
  value: number;
  unit: string;
  reference: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  collectedAt: string;
};

export type ExamsOverview = {
  patients: Array<{ id: string; name: string }>;
  selectedPatientId: string | null;
  categories: Array<{ id: string; name: string; iconKey: string }>;
  examsData: Record<string, ExamResult[]>;
  hemoglobinaHistory: Array<{ month: string; value: number; min: number; max: number }>;
  lastCollection: string | null;
};

export type SymptomScore = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export type SymptomsOverview = {
  patients: Array<{ id: string; name: string }>;
  selectedPatientId: string | null;
  assessment: {
    id: string;
    patientId: string;
    assessedAt: string;
    qualityOfLifeScore: number;
    symptoms: SymptomScore[];
  } | null;
  evolutionData: Array<Record<string, number | string>>;
};

export type SymptomAssessmentInput = {
  patientId: string;
  assessedAt: string;
  qualityOfLifeScore: number;
  symptoms: SymptomScore[];
};

export type BioimpedanceOverview = {
  patients: Array<{ id: string; name: string }>;
  selectedPatientId: string | null;
  current: {
    id: string;
    patientId: string;
    assessedAt: string;
    massaMagra: number;
    gorduraCorporal: number;
    hidratacao: number;
    imc: number;
    pesoTotal: number;
  } | null;
  evolutionData: Array<{
    month: string;
    massaMagra: number;
    gordura: number;
    hidratacao: number;
    peso: number;
  }>;
  imcData: Array<{ month: string; imc: number }>;
};

export type PatientProfile = {
  patient: {
    id: string;
    name: string;
    age: number;
    cpf: string;
    diagnosis: string[];
    status: 'stable' | 'attention' | 'critical';
    riskScore: number | null;
    professional: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    nextAppointment: string | null;
  };
  symptomsEvolution: Array<Record<string, number | string>>;
  labEvolution: Array<Record<string, number | string>>;
  timeline: Array<{
    id: string;
    patientId: string;
    date: string;
    type: string;
    title: string;
    description: string;
    color: string;
  }>;
  treatments: Treatment[];
  alerts: DashboardData['alerts'];
};

export type AppSettings = {
  usuario: {
    id: string | null;
    nome: string;
    cpf: string;
    tipoUsuario: string;
    authId: string | null;
  };
  medico: {
    id: string | null;
    nomeProfissional: string;
    email: string;
    telefone: string | null;
    dataNascimento: string | null;
    cpf: string;
    matricula: string | null;
    cbo: string | null;
    especialidade: string | null;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (response.status === 204) {
    return null as T;
  }

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

function withPatient(path: string, patientId?: string | null) {
  return patientId ? `${path}?patientId=${encodeURIComponent(patientId)}` : path;
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

export function getDashboard() {
  return request<DashboardData>('/api/dashboard');
}

export function getPatientProfile(id: string) {
  return request<PatientProfile>(`/api/pacientes/${id}/perfil`);
}

export function listTreatments(patientId?: string | null) {
  return request<Treatment[]>(withPatient('/api/tratamentos', patientId));
}

export function getExamsOverview(patientId?: string | null) {
  return request<ExamsOverview>(withPatient('/api/exames', patientId));
}

export function getSymptomsOverview(patientId?: string | null) {
  return request<SymptomsOverview>(withPatient('/api/sintomas', patientId));
}

export function createSymptomAssessment(assessment: SymptomAssessmentInput) {
  return request<{ id: string }>('/api/sintomas/avaliacoes', {
    method: 'POST',
    body: JSON.stringify(assessment),
  });
}

export function getBioimpedanceOverview(patientId?: string | null) {
  return request<BioimpedanceOverview>(withPatient('/api/bioimpedancia', patientId));
}

export function getSettings() {
  return request<AppSettings>('/api/configuracoes');
}

export function updateSettings(settings: AppSettings) {
  return request<AppSettings>('/api/configuracoes', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
