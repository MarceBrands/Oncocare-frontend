import { Outlet, Link } from 'react-router';
import {
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const statsCards = [
  {
    title: 'Pacientes em acompanhamento',
    value: '127',
    icon: Users,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    trend: 'APS + atenção especializada',
  },
  {
    title: 'Alertas críticos',
    value: '8',
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    trend: 'Priorização imediata',
  },
  {
    title: 'Atrasos na linha do cuidado',
    value: '14',
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    trend: 'Exames, consultas ou retornos',
  },
  {
    title: 'Tratamentos ativos',
    value: '64',
    icon: Activity,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    trend: 'Monitoramento longitudinal',
  },
];

const continuityData = [
  { month: 'Jan', emDia: 54, atraso: 9, perda: 3 },
  { month: 'Fev', emDia: 58, atraso: 8, perda: 4 },
  { month: 'Mar', emDia: 61, atraso: 11, perda: 5 },
  { month: 'Abr', emDia: 67, atraso: 7, perda: 3 },
  { month: 'Mai', emDia: 72, atraso: 14, perda: 6 },
];

const cancerTypeData = [
  { name: 'Mama', value: 68, color: '#0f766e' },
  { name: 'Colo do útero', value: 46, color: '#2563eb' },
  { name: 'Ambos / alto risco', value: 13, color: '#dc2626' },
];

const priorityPatients = [
  {
    id: 1,
    code: 'PAC-0001',
    name: 'Maria Santos Silva',
    age: 48,
    diagnosis: 'Câncer de Mama',
    status: 'critical',
    unit: 'UBS Vila Esperança',
    nextStep: 'Avaliar anemia e reagendar retorno',
    due: 'Hoje',
  },
  {
    id: 4,
    code: 'PAC-0004',
    name: 'Fernanda Lima',
    age: 51,
    diagnosis: 'Câncer de Colo do Útero',
    status: 'critical',
    unit: 'Ambulatório Regional',
    nextStep: 'Resultado alterado aguardando conduta',
    due: 'Hoje',
  },
  {
    id: 2,
    code: 'PAC-0002',
    name: 'Ana Paula Oliveira',
    age: 55,
    diagnosis: 'Câncer de Colo do Útero',
    status: 'attention',
    unit: 'UBS Jardim Norte',
    nextStep: 'Consulta especializada pendente',
    due: '2 dias',
  },
  {
    id: 6,
    code: 'PAC-0006',
    name: 'Patricia Rodrigues',
    age: 46,
    diagnosis: 'Mama + Colo do Útero',
    status: 'attention',
    unit: 'UBS Central',
    nextStep: 'Busca ativa por ausência no retorno',
    due: '4 dias',
  },
];

const alerts = [
  {
    id: 1,
    patient: 'PAC-0001',
    type: 'critical',
    message: 'Hemoglobina 7.2 g/dL registrada no último exame',
    time: '2h atrás',
  },
  {
    id: 2,
    patient: 'PAC-0004',
    type: 'critical',
    message: 'PCR elevado e retorno sem confirmação',
    time: '4h atrás',
  },
  {
    id: 3,
    patient: 'PAC-0002',
    type: 'warning',
    message: 'Neutropenia leve: acompanhar evolução laboratorial',
    time: '6h atrás',
  },
];

export function Dashboard() {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Painel de Acompanhamento Clínico
          </h1>
          <p className="text-slate-600 mt-2 max-w-3xl">
            Monitoramento longitudinal de pacientes em tratamento para câncer de mama e câncer do colo do útero na rede SUS.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <ShieldCheck className="size-4" />
          Dados mínimos e trilha de auditoria
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="p-5 bg-white border border-slate-200 shadow-sm rounded-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-950 mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-600">{stat.trend}</p>
              </div>
              <div className={`size-11 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`size-5 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
          <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-teal-700" />
            Continuidade do cuidado por mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={continuityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                }}
              />
              <Legend />
              <Bar dataKey="emDia" fill="#0f766e" name="Em dia" radius={[6, 6, 0, 0]} />
              <Bar dataKey="atraso" fill="#d97706" name="Com atraso" radius={[6, 6, 0, 0]} />
              <Bar dataKey="perda" fill="#dc2626" name="Risco de perda" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
          <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
            <Activity className="size-5 text-teal-700" />
            Perfil da coorte
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cancerTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={82}
                fill="#8884d8"
                dataKey="value"
              >
                {cancerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
              <Users className="size-5 text-teal-700" />
              Fila priorizada
            </h3>
            <Link to="/pacientes" className="text-sm text-teal-700 hover:text-teal-800 font-medium">
              Ver pacientes
            </Link>
          </div>
          <div className="space-y-3">
            {priorityPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/pacientes/${patient.id}`}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 md:flex-row md:items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950 truncate">{patient.name}</p>
                    <span className="text-xs text-slate-500">{patient.code}</span>
                    <Badge
                      variant={patient.status === 'critical' ? 'destructive' : 'outline'}
                      className={patient.status === 'attention' ? 'border-amber-300 bg-amber-50 text-amber-800' : ''}
                    >
                      {patient.status === 'critical' ? 'Crítico' : 'Atenção'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {patient.age} anos • {patient.diagnosis}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="size-3" /> {patient.unit}
                  </p>
                </div>
                <div className="md:w-64">
                  <p className="text-xs text-slate-500">Próxima ação</p>
                  <p className="text-sm font-medium text-slate-900">{patient.nextStep}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 md:w-20 md:justify-end">
                  <Calendar className="size-4" />
                  {patient.due}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
          <h3 className="text-lg font-semibold text-slate-950 mb-6 flex items-center gap-2">
            <AlertTriangle className="size-5 text-teal-700" />
            Alertas recentes
          </h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border-red-600'
                    : 'bg-amber-50 border-amber-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`size-5 mt-0.5 ${
                      alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-950 mb-1">{alert.patient}</p>
                    <p className="text-xs text-slate-700 mb-2">{alert.message}</p>
                    <p className="text-xs text-slate-500">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Outlet />
    </>
  );
}
