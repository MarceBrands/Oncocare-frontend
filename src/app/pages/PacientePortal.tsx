import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Droplet,
  FileText,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { PatientAvatar } from '../components/PatientAvatar';
import { supabase, type PacienteRow, type PacienteTratamentoRow } from '../../lib/supabase';

type SymptomAssessmentRow = {
  id: string;
  paciente_id: string;
  pontuacao_total: number | null;
  classificacao_risco: string | null;
  observacao: string | null;
  data_resposta: string | null;
};

type BioimpedanciaRow = {
  id: string;
  paciente_id: string;
  data_avaliacao: string;
  peso: number | null;
  altura: number | null;
  massa_magra: number | null;
  massa_gorda: number | null;
  agua_corporal: number | null;
  angulo_fase: number | null;
};

type PatientPortalState = {
  patients: PacienteRow[];
  treatments: PacienteTratamentoRow[];
  assessments: SymptomAssessmentRow[];
  bioimpedancia: BioimpedanciaRow[];
};

function formatDate(date: string | null) {
  if (!date) return 'Data não informada';

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return 'Data não informada';
  }

  return parsed.toLocaleDateString('pt-BR');
}

function getValidDateValue(date: string | null) {
  if (!date) return null;

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
}

function hasValidDate(date: string | null) {
  return getValidDateValue(date) !== null;
}

function formatNumber(value: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }

  return Number(value).toFixed(digits).replace('.', ',');
}

function getDaysSince(date: string | null) {
  if (!date) return null;

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const parsedStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

  return Math.max(0, Math.floor((todayStart.getTime() - parsedStart.getTime()) / 86_400_000));
}

function getAge(birthDate: string | null) {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();

  if (Number.isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function getTreatmentLabel(status: string) {
  const labels: Record<string, string> = {
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    interrompido: 'Interrompido',
    suspenso: 'Suspenso',
    aguardando_inicio: 'Aguardando início',
    aguardando_início: 'Aguardando início',
  };

  return labels[status] ?? status;
}

function getTreatmentProgress(treatment: PacienteTratamentoRow) {
  if (!treatment.sessoes_previstas || treatment.sessoes_previstas <= 0) {
    return null;
  }

  const completed = treatment.sessoes_realizadas ?? 0;
  return Math.min(100, Math.round((completed / treatment.sessoes_previstas) * 100));
}

export function PacientePortal() {
  const [data, setData] = useState<PatientPortalState>({
    patients: [],
    treatments: [],
    assessments: [],
    bioimpedancia: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientPortal() {
      setLoading(true);
      setError(null);

      const [patientsResult, treatmentsResult, assessmentsResult, bioResult] = await Promise.all([
        supabase
          .from('pacientes')
          .select('*, paciente_diagnosticos(tipo_cancer)')
          .order('created_at', { ascending: false }),
        supabase
          .from('paciente_tratamentos')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('respostas_questionario_paciente')
          .select('id,paciente_id,pontuacao_total,classificacao_risco,observacao,data_resposta')
          .order('data_resposta', { ascending: false, nullsFirst: false })
          .limit(20),
        supabase
          .from('paciente_bioimpedancia')
          .select('id,paciente_id,data_avaliacao,peso,altura,massa_magra,massa_gorda,agua_corporal,angulo_fase')
          .order('data_avaliacao', { ascending: false }),
      ]);

      const loadError = patientsResult.error ?? treatmentsResult.error ?? assessmentsResult.error;

      if (loadError) {
        setError(loadError.message);
        setData({ patients: [], treatments: [], assessments: [], bioimpedancia: [] });
      } else {
        setData({
          patients: (patientsResult.data ?? []) as PacienteRow[],
          treatments: (treatmentsResult.data ?? []) as PacienteTratamentoRow[],
          assessments: (assessmentsResult.data ?? []) as SymptomAssessmentRow[],
          bioimpedancia: bioResult.error ? [] : ((bioResult.data ?? []) as BioimpedanciaRow[]),
        });
      }

      setLoading(false);
    }

    loadPatientPortal();
  }, []);

  const patient = data.patients[0] ?? null;
  const patientTreatments = useMemo(
    () => data.treatments.filter((treatment) => treatment.paciente_id === patient?.id).slice(0, 3),
    [data.treatments, patient?.id]
  );
  const patientAssessments = useMemo(
    () =>
      data.assessments
        .filter((assessment) => assessment.paciente_id === patient?.id)
        .sort((first, second) => {
          const firstDate = getValidDateValue(first.data_resposta);
          const secondDate = getValidDateValue(second.data_resposta);

          if (firstDate !== null && secondDate !== null) {
            return secondDate - firstDate;
          }

          if (firstDate !== null) return -1;
          if (secondDate !== null) return 1;
          return 0;
        }),
    [data.assessments, patient?.id]
  );
  const latestAssessment = patientAssessments[0] ?? null;
  const latestBioimpedancia = data.bioimpedancia.find((row) => row.paciente_id === patient?.id) ?? null;
  const hasClinicalAlert = latestAssessment?.classificacao_risco === 'alerta_clinico';
  const latestAssessmentHasDate = hasValidDate(latestAssessment?.data_resposta ?? null);
  const daysSinceLastCheckin = latestAssessmentHasDate ? getDaysSince(latestAssessment?.data_resposta ?? null) : null;
  const checkinIsLate = daysSinceLastCheckin !== null && daysSinceLastCheckin > 7;
  const age = getAge(patient?.data_nascimento ?? null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/apresentacao" className="flex items-center gap-3">
            <PatientAvatar name={patient?.nome} className="size-11" />
            <div>
              <p className="font-bold leading-tight">OncoCare</p>
              <p className="text-xs text-slate-500">Acesso da paciente</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/paciente/exames" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">
              Meus exames
            </Link>
            <Link to="/paciente/dados" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">
              Meus dados
            </Link>
            <Link to="/apresentacao" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">
              Trocar acesso
            </Link>
            <Link to="/paciente/checkin">
              <Button className="bg-rose-700 hover:bg-rose-800">
                Check-in semanal
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/paciente/dados" aria-label="Abrir meus dados">
              <PatientAvatar name={patient?.nome} className="size-10" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {loading && (
          <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-600">Carregando acesso da paciente...</p>
          </Card>
        )}

        {!loading && error && (
          <Card className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-semibold text-red-900">Não consegui carregar o acesso da paciente.</p>
            <p className="mt-2 text-sm text-red-800">{error}</p>
          </Card>
        )}

        {!loading && !error && !patient && (
          <Card className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="font-semibold text-amber-950">Nenhuma paciente cadastrada.</p>
            <p className="mt-2 text-sm text-slate-700">Cadastre uma paciente para visualizar esta jornada.</p>
          </Card>
        )}

        {!loading && !error && patient && (
          <>
            <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-800">
                      <ShieldCheck className="size-4" />
                      Monitoramento pós-tratamento ativo
                    </div>
                    <h1 className="text-3xl font-bold text-slate-950">Olá, {patient.nome}</h1>
                    <p className="mt-2 max-w-2xl text-slate-600">
                      Este é seu espaço de acompanhamento. Registre sintomas, veja seus cuidados recentes e acompanhe indicadores importantes da sua recuperação.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {age !== null && <Badge variant="secondary">{age} anos</Badge>}
                      <Badge variant="secondary">{patient.tipo_atendimento || 'Atendimento não informado'}</Badge>
                      <Badge className={hasClinicalAlert ? 'bg-red-100 text-red-800' : 'bg-cyan-100 text-cyan-800'}>
                        {hasClinicalAlert ? 'Equipe deve revisar' : 'Sem alerta crítico recente'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to="/paciente/checkin">
                      <Button size="lg" className="w-full bg-rose-700 hover:bg-rose-800 sm:w-auto">
                        Responder check-in
                        <ClipboardCheck className="ml-2 size-5" />
                      </Button>
                    </Link>
                    <Link to="/paciente/exames">
                      <Button size="lg" variant="outline" className="w-full rounded-lg sm:w-auto">
                        Meus exames
                        <FileText className="ml-2 size-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <Card className={`rounded-lg border p-6 shadow-sm ${checkinIsLate ? 'border-amber-200 bg-amber-50' : 'border-rose-200 bg-rose-50'}`}>
                <div className="flex items-start gap-3">
                  {checkinIsLate ? (
                    <AlertTriangle className="mt-1 size-5 text-amber-700" />
                  ) : (
                    <Sparkles className="mt-1 size-5 text-rose-700" />
                  )}
                  <div>
                    <h2 className={`font-semibold ${checkinIsLate ? 'text-amber-950' : 'text-rose-950'}`}>Próxima ação recomendada</h2>
                    <p className={`mt-2 text-sm leading-6 ${checkinIsLate ? 'text-amber-900' : 'text-rose-900'}`}>
                      {checkinIsLate
                        ? 'Seu check-in semanal está atrasado. Responda para manter a equipe atualizada sobre sintomas, fadiga, dor, sono e sinais de atenção.'
                        : 'Faça seu check-in semanal. Suas respostas ajudam a equipe a identificar sintomas, fadiga, dor, sono e sinais que precisam de atenção.'}
                    </p>
                    <p className={`mt-4 flex flex-wrap items-center gap-2 text-xs font-medium ${checkinIsLate ? 'text-amber-800' : 'text-rose-800'}`}>
                      <span>
                        {latestAssessment
                          ? latestAssessmentHasDate
                            ? `Último check-in: ${formatDate(latestAssessment.data_resposta)}${daysSinceLastCheckin !== null ? ` (${daysSinceLastCheckin} dias atrás)` : ''}`
                            : 'Check-in respondido, sem data registrada'
                          : 'Nenhum check-in registrado ainda'}
                      </span>
                      {checkinIsLate && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                          <AlertTriangle className="size-3" />
                          Atrasado
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <PatientMetric icon={ClipboardCheck} label="Check-ins respondidos" value={String(patientAssessments.length)} detail="Registros de sintomas" tone="rose" />
              <PatientMetric icon={Activity} label="Tratamentos no histórico" value={String(patientTreatments.length)} detail="Ativos ou concluídos" tone="cyan" />
              <PatientMetric icon={Scale} label="Peso atual" value={`${formatNumber(latestBioimpedancia?.peso ?? null)} kg`} detail="Última bioimpedância" tone="slate" />
              <PatientMetric icon={Droplet} label="Água corporal" value={`${formatNumber(latestBioimpedancia?.agua_corporal ?? null)}%`} detail="Composição corporal" tone="blue" />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-6">
                <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-lg font-semibold text-slate-950">Tratamentos e acompanhamento</h2>
                  {patientTreatments.length === 0 ? (
                    <p className="text-sm text-slate-600">Nenhum tratamento registrado para esta paciente.</p>
                  ) : (
                    <div className="space-y-4">
                      {patientTreatments.map((treatment) => {
                        const progress = getTreatmentProgress(treatment);

                        return (
                          <div key={treatment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-semibold text-slate-950">{treatment.tipo_tratamento}</p>
                                <p className="mt-1 text-sm text-slate-600">
                                  Início: {formatDate(treatment.data_inicio)} · Última sessão: {formatDate(treatment.ultima_sessao)}
                                </p>
                              </div>
                              <Badge variant="secondary">{getTreatmentLabel(treatment.status)}</Badge>
                            </div>
                            {progress !== null && (
                              <div className="mt-4">
                                <div className="mb-2 flex justify-between text-xs text-slate-500">
                                  <span>Sessões realizadas</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              <aside className="space-y-6">
                <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className={`size-5 ${hasClinicalAlert ? 'text-red-700' : 'text-cyan-700'}`} />
                    <h2 className="font-semibold text-slate-950">Status do último check-in</h2>
                  </div>
                  <p className={`text-2xl font-bold ${hasClinicalAlert ? 'text-red-800' : 'text-cyan-800'}`}>
                    {hasClinicalAlert ? 'Atenção necessária' : 'Sem alerta recente'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {latestAssessment?.observacao || 'Nenhuma observação clínica recente registrada.'}
                  </p>
                </Card>

                <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-semibold text-slate-950">Últimos indicadores corporais</h2>
                  {!latestBioimpedancia ? (
                    <p className="text-sm text-slate-600">Sem bioimpedância registrada.</p>
                  ) : (
                    <div className="space-y-3">
                      <InfoRow label="Data" value={formatDate(latestBioimpedancia.data_avaliacao)} />
                      <InfoRow label="Massa magra" value={`${formatNumber(latestBioimpedancia.massa_magra)} kg`} />
                      <InfoRow label="Massa gorda" value={`${formatNumber(latestBioimpedancia.massa_gorda)}%`} />
                      <InfoRow label="Ângulo de fase" value={`${formatNumber(latestBioimpedancia.angulo_fase)} graus`} />
                    </div>
                  )}
                </Card>

                <Card className="rounded-lg border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
                  <h2 className="font-semibold text-cyan-950">Quando procurar ajuda</h2>
                  <p className="mt-2 text-sm leading-6 text-cyan-900">
                    Dor intensa, falta de ar, febre, sangramento, piora súbita ou qualquer sintoma que assuste deve ser comunicado à equipe de saúde.
                  </p>
                </Card>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function PatientMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof ClipboardCheck;
  label: string;
  value: string;
  detail: string;
  tone: 'rose' | 'cyan' | 'slate' | 'blue';
}) {
  const tones = {
    rose: 'bg-rose-50 text-rose-700',
    cyan: 'bg-cyan-50 text-cyan-700',
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <Card className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
