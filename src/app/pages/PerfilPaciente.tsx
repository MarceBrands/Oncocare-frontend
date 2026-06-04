import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  FileText,
  Heart,
  User,
  Clock,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  name: 'Maria Santos Silva',
  age: 48,
  cpf: '123.456.789-00',
  diagnosis: ['Câncer de Mama'],
  status: 'critical',
  riskScore: 8.5,
  professional: 'Dra. Ana Silva',
  phone: '(11) 98765-4321',
  email: 'maria.santos@email.com',
  address: 'Rua das Flores, 123 - São Paulo, SP',
};

const symptomsEvolution = [
  { date: 'Jan', fadiga: 7, dor: 5, nausea: 3, ansiedade: 6 },
  { date: 'Fev', fadiga: 6, dor: 6, nausea: 4, ansiedade: 7 },
  { date: 'Mar', fadiga: 8, dor: 7, nausea: 6, ansiedade: 8 },
  { date: 'Abr', fadiga: 7, dor: 6, nausea: 5, ansiedade: 6 },
  { date: 'Mai', fadiga: 9, dor: 8, nausea: 7, ansiedade: 9 },
];

const labEvolution = [
  { date: 'Jan', hemoglobina: 12.5, leucocitos: 7200, plaquetas: 280 },
  { date: 'Fev', hemoglobina: 11.8, leucocitos: 6800, plaquetas: 260 },
  { date: 'Mar', hemoglobina: 10.2, leucocitos: 5500, plaquetas: 220 },
  { date: 'Abr', hemoglobina: 9.5, leucocitos: 4800, plaquetas: 200 },
  { date: 'Mai', hemoglobina: 7.2, leucocitos: 4200, plaquetas: 180 },
];

const timeline = [
  {
    id: 1,
    date: '2026-05-30',
    type: 'alert',
    title: 'Hemoglobina Crítica',
    description: 'Hemoglobina em 7.2 g/dL - Necessário transfusão',
    icon: AlertTriangle,
    color: 'red',
  },
  {
    id: 2,
    date: '2026-05-28',
    type: 'exam',
    title: 'Exames Laboratoriais',
    description: 'Coleta realizada - Aguardando resultados',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 3,
    date: '2026-05-25',
    type: 'treatment',
    title: 'Sessão de Quimioterapia',
    description: '8ª sessão realizada com sucesso',
    icon: Activity,
    color: 'purple',
  },
  {
    id: 4,
    date: '2026-05-20',
    type: 'consultation',
    title: 'Consulta Médica',
    description: 'Avaliação de sintomas e ajuste de medicação',
    icon: Heart,
    color: 'pink',
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

const alerts = [
  {
    id: 1,
    type: 'critical',
    message: 'Hemoglobina 7.2 g/dL - Risco de anemia grave',
    recommendation: 'Considerar transfusão sanguínea urgente',
  },
  {
    id: 2,
    type: 'warning',
    message: 'Leucócitos 4200/µL - Abaixo do ideal',
    recommendation: 'Monitorar risco de infecções',
  },
  {
    id: 3,
    type: 'warning',
    message: 'Score de fadiga aumentou 28% no último mês',
    recommendation: 'Avaliar ajuste no tratamento',
  },
];

export function PerfilPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('visao-geral');

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <ArrowLeft className="size-5 mr-2" />
          Voltar para Pacientes
        </Button>
      </div>

      {/* Patient Header */}
      <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            MS
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patientData.name}
                </h1>
                <p className="text-gray-500">
                  {patientData.age} anos • CPF: {patientData.cpf}
                </p>
              </div>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Crítico
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Profissional</p>
                  <p className="text-sm font-medium">{patientData.professional}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-pink-600" />
                <div>
                  <p className="text-xs text-gray-500">Diagnóstico</p>
                  <p className="text-sm font-medium">{patientData.diagnosis[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Score de Risco</p>
                  <p className="text-sm font-bold text-red-600">
                    {patientData.riskScore}/10
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Próxima consulta</p>
                  <p className="text-sm font-medium">05/06/2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 mb-6 flex-wrap h-auto">
          <TabsTrigger value="visao-geral" className="rounded-lg">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="tratamentos" className="rounded-lg">
            Tratamentos
          </TabsTrigger>
          <TabsTrigger value="exames" className="rounded-lg">
            Exames
          </TabsTrigger>
          <TabsTrigger value="sintomas" className="rounded-lg">
            Sintomas
          </TabsTrigger>
          <TabsTrigger value="historico" className="rounded-lg">
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          {/* Alerts */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-600" />
              Alertas Automáticos
            </h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    alert.type === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <p className="font-semibold text-gray-900 mb-1">
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray-600">
                    Recomendação: {alert.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="size-5 text-purple-600" />
                Evolução de Sintomas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={symptomsEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fadiga"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name="Fadiga"
                  />
                  <Line
                    type="monotone"
                    dataKey="dor"
                    stroke="#a855f7"
                    strokeWidth={2}
                    name="Dor"
                  />
                  <Line
                    type="monotone"
                    dataKey="nausea"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Náusea"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="size-5 text-blue-600" />
                Evolução Laboratorial (Hemoglobina)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={labEvolution}>
                  <defs>
                    <linearGradient id="colorHemo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" domain={[0, 15]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hemoglobina"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHemo)"
                    name="Hemoglobina (g/dL)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-700">
                  <TrendingDown className="size-4 inline mr-1" />
                  Queda de 42% nos últimos 5 meses
                </p>
              </div>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="size-5 text-purple-600" />
              Timeline Clínica
            </h3>
            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-10 rounded-full bg-gradient-to-br ${
                        event.color === 'red'
                          ? 'from-red-400 to-red-600'
                          : event.color === 'blue'
                          ? 'from-blue-400 to-blue-600'
                          : event.color === 'purple'
                          ? 'from-purple-400 to-purple-600'
                          : 'from-pink-400 to-pink-600'
                      } flex items-center justify-center`}
                    >
                      <event.icon className="size-5 text-white" />
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tratamentos */}
        <TabsContent value="tratamentos" className="space-y-6">
          {treatments.map((treatment) => (
            <Card
              key={treatment.id}
              className="p-6 bg-white border-0 shadow-lg rounded-2xl"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {treatment.type}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Início: {new Date(treatment.startDate).toLocaleDateString('pt-BR')}
                    {treatment.endDate &&
                      ` • Término previsto: ${new Date(
                        treatment.endDate
                      ).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <Badge
                  variant={
                    treatment.status === 'Em andamento' ? 'default' : 'secondary'
                  }
                  className="text-sm"
                >
                  {treatment.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Progresso: {treatment.sessions.completed}/{treatment.sessions.total}{' '}
                      sessões
                    </p>
                    <p className="text-sm font-bold text-purple-600">
                      {treatment.progress}%
                    </p>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${treatment.progress}%` }}
                    />
                  </div>
                </div>

                {treatment.adverseEffects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Efeitos Adversos:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {treatment.adverseEffects.map((effect, idx) => (
                        <Badge key={idx} variant="outline" className="bg-red-50">
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

        {/* Other tabs placeholder */}
        <TabsContent value="exames">
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <p className="text-gray-500">
              Veja a tela dedicada de Exames no menu lateral.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="sintomas">
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <p className="text-gray-500">
              Veja a tela dedicada de Avaliações no menu lateral.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="historico">
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <p className="text-gray-500">Histórico completo em desenvolvimento.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
