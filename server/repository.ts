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
} from './api-types';

export type ApiRepository = {
  listPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | null>;
  createPatient(patient: PatientInput): Promise<{ id: string }>;
  updatePatient(id: string, patient: PatientInput): Promise<Patient | null>;
  deletePatient(id: string): Promise<boolean>;

  listTreatments(patientId?: string | null): Promise<Treatment[]>;
  createTreatment(treatment: TreatmentInput): Promise<{ id: string }>;
  updateTreatment(id: string, treatment: TreatmentInput): Promise<Treatment | null>;
  deleteTreatment(id: string): Promise<boolean>;

  getExamsOverview(patientId?: string | null): Promise<ExamsOverview>;
  createExamResult(exam: ExamInput): Promise<{ id: string }>;
  updateExamResult(id: string, exam: ExamInput): Promise<ExamResult | null>;
  deleteExamResult(id: string): Promise<boolean>;

  getSymptomsOverview(patientId?: string | null): Promise<SymptomsOverview>;
  createSymptomAssessment(assessment: SymptomAssessmentInput): Promise<{ id: string }>;
  updateSymptomAssessment(
    id: string,
    assessment: SymptomAssessmentInput
  ): Promise<SymptomAssessment | null>;
  deleteSymptomAssessment(id: string): Promise<boolean>;

  getBioimpedanceOverview(patientId?: string | null): Promise<BioimpedanceOverview>;
  createBioimpedanceAssessment(assessment: BioimpedanceInput): Promise<{ id: string }>;
  updateBioimpedanceAssessment(
    id: string,
    assessment: BioimpedanceInput
  ): Promise<BioimpedanceAssessment | null>;
  deleteBioimpedanceAssessment(id: string): Promise<boolean>;

  listAlerts(patientId?: string | null): Promise<ClinicalAlert[]>;
  createAlert(alert: ClinicalAlertInput): Promise<{ id: string }>;
  updateAlert(id: string, alert: ClinicalAlertInput): Promise<ClinicalAlert | null>;
  deleteAlert(id: string): Promise<boolean>;

  listTimeline(patientId?: string | null): Promise<TimelineEvent[]>;
  createTimelineEvent(event: TimelineEventInput): Promise<{ id: string }>;
  updateTimelineEvent(id: string, event: TimelineEventInput): Promise<TimelineEvent | null>;
  deleteTimelineEvent(id: string): Promise<boolean>;

  getDashboard(): Promise<DashboardData>;
  getPatientProfile(id: string): Promise<PatientProfile | null>;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: AppSettings): Promise<AppSettings>;
};
