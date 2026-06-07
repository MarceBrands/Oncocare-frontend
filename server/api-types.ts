export type DiagnosisType = 'mama' | 'colo_utero';

export type PatientStatus = 'stable' | 'attention' | 'critical';

export type Patient = {
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
  status: PatientStatus;
  risk_score: number | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  next_appointment: string | null;
  diagnosticos: DiagnosisType[];
};

export type PatientInput = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  tipo_atendimento: string;
  diagnosticos?: DiagnosisType[];
  observacoes?: string | null;
  status?: PatientStatus;
  risk_score?: number | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  next_appointment?: string | null;
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

export type TreatmentInput = Omit<Treatment, 'id' | 'patient' | 'sessions'> & {
  sessions: {
    completed: number;
    total: number;
  };
};

export type ExamCategory = {
  id: string;
  name: string;
  iconKey: string;
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

export type ExamInput = Omit<ExamResult, 'id'>;

export type ExamsOverview = {
  patients: Array<{ id: string; name: string }>;
  selectedPatientId: string | null;
  categories: ExamCategory[];
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

export type SymptomAssessment = {
  id: string;
  patientId: string;
  assessedAt: string;
  qualityOfLifeScore: number;
  symptoms: SymptomScore[];
};

export type SymptomAssessmentInput = Omit<SymptomAssessment, 'id'>;

export type SymptomsOverview = {
  patients: Array<{ id: string; name: string }>;
  selectedPatientId: string | null;
  assessment: SymptomAssessment | null;
  evolutionData: Array<Record<string, number | string>>;
};

export type BioimpedanceAssessment = {
  id: string;
  patientId: string;
  assessedAt: string;
  massaMagra: number;
  gorduraCorporal: number;
  hidratacao: number;
  imc: number;
  pesoTotal: number;
};

export type BioimpedanceInput = Omit<BioimpedanceAssessment, 'id'>;

export type BioimpedanceOverview = {
  patients: Array<{ id: string; name: string }>;
  selectedPatientId: string | null;
  current: BioimpedanceAssessment | null;
  evolutionData: Array<{
    month: string;
    massaMagra: number;
    gordura: number;
    hidratacao: number;
    peso: number;
  }>;
  imcData: Array<{ month: string; imc: number }>;
};

export type ClinicalAlert = {
  id: string;
  patientId: string;
  patient: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string | null;
  time: string | null;
  occurredAt: string;
};

export type ClinicalAlertInput = Omit<ClinicalAlert, 'id' | 'patient'>;

export type TimelineEvent = {
  id: string;
  patientId: string;
  date: string;
  type: string;
  title: string;
  description: string;
  color: string;
};

export type TimelineEventInput = Omit<TimelineEvent, 'id'>;

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
    status: PatientStatus;
    lastVisit: string;
    alert: string | null;
  }>;
  alerts: ClinicalAlert[];
};

export type PatientProfile = {
  patient: {
    id: string;
    name: string;
    age: number;
    cpf: string;
    diagnosis: string[];
    status: PatientStatus;
    riskScore: number | null;
    professional: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    nextAppointment: string | null;
  };
  symptomsEvolution: Array<Record<string, number | string>>;
  labEvolution: Array<Record<string, number | string>>;
  timeline: TimelineEvent[];
  treatments: Treatment[];
  alerts: ClinicalAlert[];
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
