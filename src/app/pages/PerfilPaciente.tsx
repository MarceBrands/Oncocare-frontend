import { useEffect, useState } from 'react';
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
import { getPatientProfile, type PatientProfile } from '../../lib/api';

function getTreatmentStatusLabel(status: string) {
  if (status === 'active') return 'Em andamento';
  if (status === 'scheduled') return 'Agendado';
  if (status === 'completed') return 'Concluido';
  return status;
}

export function PerfilPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;

      try {
        setProfile(await getPatientProfile(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro inesperado.');
      }
    }

    loadProfile();
  }, [id]);

  if (!profile) {
    return (
      <div className="max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <ArrowLeft className="size-5 mr-2" />
          Voltar para Pacientes
        </Button>
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <p className={error ? 'text-sm text-red-600' : 'text-sm text-gray-500'}>
            {error ?? 'Carregando perfil da paciente...'}
          </p>
        </Card>
      </div>
    );
  }

  const currentPatient = profile.patient;
  const currentSymptomsEvolution = profile.symptomsEvolution;
  const currentLabEvolution = profile.labEvolution;
  const currentTimeline = profile.timeline;
  const currentTreatments = profile.treatments;
  const currentAlerts = profile.alerts;
  const initials = currentPatient.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
  const timelineIconMap = {
    alert: AlertTriangle,
    exam: FileText,
    treatment: Activity,
    consultation: Heart,
  };

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
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Patient Header */}
      <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentPatient.name}
                </h1>
                <p className="text-gray-500">
                  {currentPatient.age} anos • CPF: {currentPatient.cpf}
                </p>
              </div>
              <Badge
                variant={currentPatient.status === 'critical' ? 'destructive' : 'secondary'}
                className="text-lg px-4 py-2"
              >
                {currentPatient.status === 'critical'
                  ? 'Crítico'
                  : currentPatient.status === 'attention'
                  ? 'Atenção'
                  : 'Estável'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Profissional</p>
                  <p className="text-sm font-medium">{currentPatient.professional}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-pink-600" />
                <div>
                  <p className="text-xs text-gray-500">Diagnóstico</p>
                  <p className="text-sm font-medium">{currentPatient.diagnosis[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Score de Risco</p>
                  <p className="text-sm font-bold text-red-600">
                    {currentPatient.riskScore}/10
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Próxima consulta</p>
                  <p className="text-sm font-medium">
                    {currentPatient.nextAppointment
                      ? new Date(`${currentPatient.nextAppointment}T00:00:00`).toLocaleDateString('pt-BR')
                      : 'Nao agendada'}
                  </p>
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
              {currentAlerts.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum alerta registrado.</p>
              )}
              {currentAlerts.map((alert) => (
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
                <LineChart data={currentSymptomsEvolution}>
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
                <AreaChart data={currentLabEvolution}>
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
                  Serie historica carregada a partir dos exames registrados.
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
              {currentTimeline.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum evento registrado.</p>
              )}
              {currentTimeline.map((event, idx) => {
                const EventIcon = timelineIconMap[event.type as keyof typeof timelineIconMap] ?? Heart;

                return (
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
                      <EventIcon className="size-5 text-white" />
                    </div>
                    {idx < currentTimeline.length - 1 && (
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
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tratamentos */}
        <TabsContent value="tratamentos" className="space-y-6">
          {currentTreatments.length === 0 && (
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <p className="text-sm text-gray-500">Nenhum tratamento registrado.</p>
            </Card>
          )}
          {currentTreatments.map((treatment) => (
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
                    treatment.status === 'active' ? 'default' : 'secondary'
                  }
                  className="text-sm"
                >
                  {getTreatmentStatusLabel(treatment.status)}
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
