import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Activity,
  FileText,
  HeartPulse,
  User,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { supabase, type PacienteTratamentoRow } from '../../lib/supabase';
import {
  formatCompletion,
  formatDate,
  formatTimeSinceLastSession,
  getTreatmentCompletion,
} from '../../lib/treatments';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

const patientData = {
  id: 1,
  code: 'PAC-0001',
  name: 'Maria Santos Silva',
  age: 48,
  cpf: '123.456.789-00',
  diagnosis: ['CÃ¢ncer de Mama'],
  stage: 'Tratamento sistÃªmico em andamento',
  status: 'critical',
  riskScore: 8.5,
  professional: 'Dra. Ana Silva',
  unit: 'UBS Vila EsperanÃ§a',
  referenceUnit: 'AmbulatÃ³rio Regional de Oncologia',
  lastClinicalUpdate: '05/06/2026',
};

const symptomsEvolution = [
  { date: 'Jan', fadiga: 7, dor: 5, nausea: 3, ansiedade: 6 },
  { date: 'Fev', fadiga: 6, dor: 6, nausea: 4, ansiedade: 7 },
  { date: 'Mar', fadiga: 8, dor: 7, nausea: 6, ansiedade: 8 },
  { date: 'Abr', fadiga: 7, dor: 6, nausea: 5, ansiedade: 6 },
  { date: 'Mai', fadiga: 9, dor: 8, nausea: 7, ansiedade: 9 },
];

const labEvolution = [
  { date: 'Jan', hemoglobina: 12.5 },
  { date: 'Fev', hemoglobina: 11.8 },
  { date: 'Mar', hemoglobina: 10.2 },
  { date: 'Abr', hemoglobina: 9.5 },
  { date: 'Mai', hemoglobina: 7.2 },
];

const timeline = [
  {
    id: 1,
    date: '2026-05-30',
    type: 'alert',
    title: 'Exame laboratorial crÃ­tico',
    description: 'Hemoglobina 7.2 g/dL. Caso sinalizado para avaliaÃ§Ã£o da equipe responsÃ¡vel.',
    icon: AlertTriangle,
    color: 'red',
  },
  {
    id: 2,
    date: '2026-05-28',
    type: 'exam',
    title: 'Coleta de exames',
    description: 'Hemograma e funÃ§Ã£o renal registrados na plataforma.',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 3,
    date: '2026-05-25',
    type: 'treatment',
    title: 'Quimioterapia - 8Âª sessÃ£o',
    description: 'SessÃ£o realizada. Sintomas reportados no acompanhamento pÃ³s-atendimento.',
    icon: Activity,
    color: 'teal',
  },
  {
    id: 4,
    date: '2026-05-20',
    type: 'consultation',
    title: 'Consulta especializada',
    description: 'AvaliaÃ§Ã£o clÃ­nica e atualizaÃ§Ã£o do plano de acompanhamento.',
    icon: HeartPulse,
    color: 'slate',
  },
];

const fallbackTreatments: PacienteTratamentoRow[] = [
  {
    id: 'demo-1',
    paciente_id: '1',
    tipo_tratamento: 'Quimioterapia',
    status: 'em_andamento',
    data_inicio: '2026-03-01',
    data_fim: '2026-07-15',
    observacoes: 'Fadiga intensa, nausea e queda de cabelo reportadas nos questionarios de seguimento.',
    sessoes_previstas: 12,
    sessoes_realizadas: 8,
    ultima_sessao: '2026-05-25',
    created_at: null,
    updated_at: null,
  },
  {
    id: 'demo-2',
    paciente_id: '1',
    tipo_tratamento: 'Radioterapia',
    status: 'aguardando_inicio',
    data_inicio: '2026-07-20',
    data_fim: null,
    observacoes: 'Tratamento planejado no historico terapeutico, sem sessoes realizadas.',
    sessoes_previstas: 25,
    sessoes_realizadas: 0,
    ultima_sessao: null,
    created_at: null,
    updated_at: null,
  },
];

const careTasks = [
  { label: 'Avaliar hemoglobina alterada', priority: 'CrÃ­tica', due: 'Hoje' },
  { label: 'Confirmar retorno especializado', priority: 'Alta', due: '05/06' },
  { label: 'Registrar contato da busca ativa', priority: 'MÃ©dia', due: 'Esta semana' },
];

const maskCpf = (cpf: string) => cpf.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, '$1.***.***-$2');

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    em_andamento: 'Em andamento',
    concluido: 'Concluido',
    interrompido: 'Interrompido',
    suspenso: 'Suspenso',
    aguardando_inicio: 'Aguardando inicio',
  };

  return labels[status] ?? status;
}

export function PerfilPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [patientTreatments, setPatientTreatments] = useState<PacienteTratamentoRow[]>(fallbackTreatments);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);
  const [treatmentsError, setTreatmentsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientTreatments() {
      if (!id || !isUuid(id)) {
        return;
      }

      setTreatmentsLoading(true);
      setTreatmentsError(null);

      const { data, error } = await supabase
        .from('paciente_tratamentos')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        setTreatmentsError(error.message);
      } else {
        setPatientTreatments((data ?? []) as PacienteTratamentoRow[]);
      }

      setTreatmentsLoading(false);
    }

    loadPatientTreatments();
  }, [id]);

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="mb-4 text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
        >
          <ArrowLeft className="size-5 mr-2" />
          Voltar para pacientes
        </Button>
      </div>

      <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg mb-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="size-20 rounded-lg bg-red-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            MS
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-950">{patientData.name}</h1>
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {patientData.code}
                  </Badge>
                </div>
                <p className="text-slate-500 mt-1">
                  {patientData.age} anos â€¢ CPF protegido: {maskCpf(patientData.cpf)}
                </p>
              </div>
              <Badge variant="destructive" className="text-base px-4 py-2">
                Prioridade crÃ­tica
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-cyan-700" />
                <div>
                  <p className="text-xs text-slate-500">Profissional</p>
                  <p className="text-sm font-medium">{patientData.professional}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="size-5 text-cyan-700" />
                <div>
                  <p className="text-xs text-slate-500">DiagnÃ³stico</p>
                  <p className="text-sm font-medium">{patientData.diagnosis[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-700" />
                <div>
                  <p className="text-xs text-slate-500">Score de risco</p>
                  <p className="text-sm font-bold text-red-700">{patientData.riskScore}/10</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-700" />
                <div>
                  <p className="text-xs text-slate-500">Atualizacao clinica</p>
                  <p className="text-sm font-medium">{patientData.lastClinicalUpdate}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-slate-500" /> Origem: {patientData.unit}
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700" /> Unidade referÃªncia: {patientData.referenceUnit}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 rounded-lg p-1 mb-6 flex-wrap h-auto">
          <TabsTrigger value="visao-geral" className="rounded-md">VisÃ£o geral</TabsTrigger>
          <TabsTrigger value="tratamentos" className="rounded-md">Tratamentos</TabsTrigger>
          <TabsTrigger value="exames" className="rounded-md">Exames</TabsTrigger>
          <TabsTrigger value="sintomas" className="rounded-md">Sintomas</TabsTrigger>
          <TabsTrigger value="historico" className="rounded-md">HistÃ³rico</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <Clock className="size-5 text-cyan-700" /> Linha do cuidado
              </h3>
              <div className="space-y-4">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center ${
                          event.color === 'red'
                            ? 'bg-red-100 text-red-700'
                            : event.color === 'blue'
                            ? 'bg-blue-100 text-blue-700'
                            : event.color === 'teal'
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <event.icon className="size-5" />
                      </div>
                      {idx < timeline.length - 1 && <div className="w-0.5 h-12 bg-slate-200 my-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-semibold text-slate-950">{event.title}</p>
                        <p className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-700" /> PendÃªncias priorizadas
              </h3>
              <div className="space-y-3">
                {careTasks.map((task) => (
                  <div key={task.label} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-950">{task.label}</p>
                      <Badge
                        variant={task.priority === 'CrÃ­tica' ? 'destructive' : 'outline'}
                        className={task.priority === 'Alta' ? 'border-amber-300 bg-amber-50 text-amber-800' : ''}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Prazo: {task.due}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                A plataforma apoia a priorizaÃ§Ã£o operacional; decisÃµes clÃ­nicas permanecem com a equipe responsÃ¡vel.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <Activity className="size-5 text-cyan-700" /> EvoluÃ§Ã£o de sintomas
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={symptomsEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="fadiga" stroke="#0e7490" strokeWidth={2} name="Fadiga" />
                  <Line type="monotone" dataKey="dor" stroke="#dc2626" strokeWidth={2} name="Dor" />
                  <Line type="monotone" dataKey="nausea" stroke="#d97706" strokeWidth={2} name="NÃ¡usea" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <FileText className="size-5 text-blue-700" /> Hemoglobina
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={labEvolution}>
                  <defs>
                    <linearGradient id="colorHemo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 15]} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="hemoglobina" stroke="#dc2626" strokeWidth={3} fill="url(#colorHemo)" name="Hemoglobina (g/dL)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tratamentos" className="space-y-6">
          {treatmentsLoading && (
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <p className="text-slate-600">Carregando historico terapeutico...</p>
            </Card>
          )}

          {treatmentsError && (
            <Card className="p-6 bg-red-50 border border-red-200 shadow-sm rounded-lg">
              <p className="font-semibold text-red-900">Nao consegui carregar tratamentos.</p>
              <p className="mt-2 text-sm text-red-800">{treatmentsError}</p>
            </Card>
          )}

          {!treatmentsLoading && !treatmentsError && patientTreatments.length === 0 && (
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <p className="font-semibold text-slate-950">Nenhum tratamento cadastrado.</p>
              <p className="mt-2 text-sm text-slate-600">
                O historico terapeutico sera usado para contextualizar sintomas, exames e questionarios.
              </p>
            </Card>
          )}

          {!treatmentsLoading && !treatmentsError && patientTreatments.map((treatment) => {
            const completion = getTreatmentCompletion(treatment);
            const completionLabel = formatCompletion(treatment);

            return (
              <Card key={treatment.id} className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{treatment.tipo_tratamento}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Inicio: {formatDate(treatment.data_inicio)} | Termino: {formatDate(treatment.data_fim)}
                    </p>
                  </div>
                  <Badge variant={treatment.status === 'em_andamento' ? 'default' : 'secondary'}>
                    {getStatusLabel(treatment.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoBlock label="Sessoes previstas" value={String(treatment.sessoes_previstas ?? 'Nao informado')} />
                  <InfoBlock label="Sessoes realizadas" value={String(treatment.sessoes_realizadas ?? 'Nao informado')} />
                  <InfoBlock label="Ultima sessao" value={formatDate(treatment.ultima_sessao)} />
                  <InfoBlock label="Tempo desde ultima sessao" value={formatTimeSinceLastSession(treatment)} />
                  <InfoBlock label="Conclusao" value={completionLabel ?? 'Sem percentual'} />
                  <InfoBlock label="Status" value={getStatusLabel(treatment.status)} />
                </div>

                {completion !== null && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">Indicador de conclusao</p>
                      <p className="text-sm font-bold text-cyan-700">{completionLabel}</p>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-cyan-700 transition-all duration-500" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Observacoes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    {treatment.observacoes || 'Sem observacoes registradas.'}
                  </p>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="exames">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
            <p className="text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-cyan-700" /> Veja a tela dedicada de exames no menu lateral.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="sintomas">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
            <p className="text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-cyan-700" /> Veja a tela dedicada de avaliaÃ§Ãµes no menu lateral.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="historico">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
            <p className="text-slate-600">HistÃ³rico completo em desenvolvimento.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
