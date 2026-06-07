import { useState } from 'react';
import { useNavigate } from 'react-router';
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
  diagnosis: ['Câncer de Mama'],
  stage: 'Tratamento sistêmico em andamento',
  status: 'critical',
  riskScore: 8.5,
  professional: 'Dra. Ana Silva',
  unit: 'UBS Vila Esperança',
  referenceUnit: 'Ambulatório Regional de Oncologia',
  nextAppointment: '05/06/2026',
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
    title: 'Exame laboratorial crítico',
    description: 'Hemoglobina 7.2 g/dL. Caso sinalizado para avaliação da equipe responsável.',
    icon: AlertTriangle,
    color: 'red',
  },
  {
    id: 2,
    date: '2026-05-28',
    type: 'exam',
    title: 'Coleta de exames',
    description: 'Hemograma e função renal registrados na plataforma.',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 3,
    date: '2026-05-25',
    type: 'treatment',
    title: 'Quimioterapia - 8ª sessão',
    description: 'Sessão realizada. Sintomas reportados no acompanhamento pós-atendimento.',
    icon: Activity,
    color: 'teal',
  },
  {
    id: 4,
    date: '2026-05-20',
    type: 'consultation',
    title: 'Consulta especializada',
    description: 'Avaliação clínica e atualização do plano de acompanhamento.',
    icon: HeartPulse,
    color: 'slate',
  },
];

const treatments = [
  {
    id: 1,
    type: 'Quimioterapia',
    status: 'Em andamento',
    startDate: '2026-03-01',
    endDate: '2026-07-15',
    progress: 70,
    sessions: { completed: 8, total: 12 },
    adverseEffects: ['Fadiga intensa', 'Náusea', 'Queda de cabelo'],
  },
  {
    id: 2,
    type: 'Radioterapia',
    status: 'Aguardando',
    startDate: '2026-07-20',
    endDate: null,
    progress: 0,
    sessions: { completed: 0, total: 25 },
    adverseEffects: [],
  },
];

const careTasks = [
  { label: 'Avaliar hemoglobina alterada', priority: 'Crítica', due: 'Hoje' },
  { label: 'Confirmar retorno especializado', priority: 'Alta', due: '05/06' },
  { label: 'Registrar contato da busca ativa', priority: 'Média', due: 'Esta semana' },
];

const maskCpf = (cpf: string) => cpf.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, '$1.***.***-$2');

export function PerfilPaciente() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visao-geral');

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="mb-4 text-teal-700 hover:text-teal-800 hover:bg-teal-50"
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
                  {patientData.age} anos • CPF protegido: {maskCpf(patientData.cpf)}
                </p>
              </div>
              <Badge variant="destructive" className="text-base px-4 py-2">
                Prioridade crítica
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-teal-700" />
                <div>
                  <p className="text-xs text-slate-500">Profissional</p>
                  <p className="text-sm font-medium">{patientData.professional}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="size-5 text-teal-700" />
                <div>
                  <p className="text-xs text-slate-500">Diagnóstico</p>
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
                  <p className="text-xs text-slate-500">Próximo retorno</p>
                  <p className="text-sm font-medium">{patientData.nextAppointment}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-slate-500" /> Origem: {patientData.unit}
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700" /> Unidade referência: {patientData.referenceUnit}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 rounded-lg p-1 mb-6 flex-wrap h-auto">
          <TabsTrigger value="visao-geral" className="rounded-md">Visão geral</TabsTrigger>
          <TabsTrigger value="tratamentos" className="rounded-md">Tratamentos</TabsTrigger>
          <TabsTrigger value="exames" className="rounded-md">Exames</TabsTrigger>
          <TabsTrigger value="sintomas" className="rounded-md">Sintomas</TabsTrigger>
          <TabsTrigger value="historico" className="rounded-md">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <Clock className="size-5 text-teal-700" /> Linha do cuidado
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
                            ? 'bg-teal-100 text-teal-700'
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
                <AlertTriangle className="size-5 text-red-700" /> Pendências priorizadas
              </h3>
              <div className="space-y-3">
                {careTasks.map((task) => (
                  <div key={task.label} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-950">{task.label}</p>
                      <Badge
                        variant={task.priority === 'Crítica' ? 'destructive' : 'outline'}
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
                A plataforma apoia a priorização operacional; decisões clínicas permanecem com a equipe responsável.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <Activity className="size-5 text-teal-700" /> Evolução de sintomas
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={symptomsEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="fadiga" stroke="#0f766e" strokeWidth={2} name="Fadiga" />
                  <Line type="monotone" dataKey="dor" stroke="#dc2626" strokeWidth={2} name="Dor" />
                  <Line type="monotone" dataKey="nausea" stroke="#d97706" strokeWidth={2} name="Náusea" />
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
          {treatments.map((treatment) => (
            <Card key={treatment.id} className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{treatment.type}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Início: {new Date(treatment.startDate).toLocaleDateString('pt-BR')}
                    {treatment.endDate && ` • Término previsto: ${new Date(treatment.endDate).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <Badge variant={treatment.status === 'Em andamento' ? 'default' : 'secondary'}>
                  {treatment.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">
                      Progresso: {treatment.sessions.completed}/{treatment.sessions.total} sessões
                    </p>
                    <p className="text-sm font-bold text-teal-700">{treatment.progress}%</p>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-700 rounded-full transition-all duration-500" style={{ width: `${treatment.progress}%` }} />
                  </div>
                </div>

                {treatment.adverseEffects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Sintomas e efeitos reportados</p>
                    <div className="flex flex-wrap gap-2">
                      {treatment.adverseEffects.map((effect) => (
                        <Badge key={effect} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="exames">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
            <p className="text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-teal-700" /> Veja a tela dedicada de exames no menu lateral.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="sintomas">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
            <p className="text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-teal-700" /> Veja a tela dedicada de avaliações no menu lateral.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="historico">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
            <p className="text-slate-600">Histórico completo em desenvolvimento.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
