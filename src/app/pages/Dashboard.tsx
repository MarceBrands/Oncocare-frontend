import { Outlet } from 'react-router';
import {
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  Heart,
  Calendar,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  LineChart,
  Line,
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
import { Link } from 'react-router';

const statsCards = [
  {
    title: 'Total de Pacientes',
    value: '127',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    trend: '+12% este mês',
  },
  {
    title: 'Pacientes Críticos',
    value: '8',
    icon: AlertTriangle,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    trend: 'Atenção imediata',
  },
  {
    title: 'Tratamentos Ativos',
    value: '64',
    icon: Activity,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    trend: 'Em andamento',
  },
  {
    title: 'Alertas Clínicos',
    value: '15',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    trend: '3 novos hoje',
  },
];

const evolutionData = [
  { month: 'Jan', normal: 45, atencao: 12, critico: 3 },
  { month: 'Fev', normal: 52, atencao: 10, critico: 5 },
  { month: 'Mar', normal: 48, atencao: 15, critico: 4 },
  { month: 'Abr', normal: 61, atencao: 11, critico: 2 },
  { month: 'Mai', normal: 55, atencao: 14, critico: 8 },
];

const treatmentData = [
  { name: 'Quimioterapia', value: 35, color: '#ec4899' },
  { name: 'Radioterapia', value: 28, color: '#a855f7' },
  { name: 'Braquiterapia', value: 18, color: '#3b82f6' },
  { name: 'Hormonioterapia', value: 12, color: '#8b5cf6' },
];

const recentPatients = [
  {
    id: 1,
    name: 'Maria Santos Silva',
    age: 48,
    diagnosis: 'Câncer de Mama',
    status: 'critical',
    lastVisit: '2026-05-30',
    alert: 'Hemoglobina baixa',
  },
  {
    id: 2,
    name: 'Ana Paula Oliveira',
    age: 55,
    diagnosis: 'Câncer de Colo do Útero',
    status: 'attention',
    lastVisit: '2026-05-29',
    alert: 'Neutropenia leve',
  },
  {
    id: 3,
    name: 'Juliana Costa',
    age: 42,
    diagnosis: 'Câncer de Mama',
    status: 'stable',
    lastVisit: '2026-05-28',
    alert: null,
  },
  {
    id: 4,
    name: 'Fernanda Lima',
    age: 51,
    diagnosis: 'Câncer de Colo do Útero',
    status: 'critical',
    lastVisit: '2026-05-30',
    alert: 'PCR elevado',
  },
  {
    id: 5,
    name: 'Carolina Mendes',
    age: 39,
    diagnosis: 'Câncer de Mama',
    status: 'stable',
    lastVisit: '2026-05-27',
    alert: null,
  },
];

const alerts = [
  {
    id: 1,
    patient: 'Maria Santos Silva',
    type: 'critical',
    message: 'Hemoglobina 7.2 g/dL - Risco de anemia grave',
    time: '2h atrás',
  },
  {
    id: 2,
    patient: 'Fernanda Lima',
    type: 'critical',
    message: 'PCR 85 mg/L - Possível processo inflamatório',
    time: '4h atrás',
  },
  {
    id: 3,
    patient: 'Ana Paula Oliveira',
    type: 'warning',
    message: 'Neutrófilos 1200/µL - Monitorar neutropenia',
    time: '6h atrás',
  },
];

export function Dashboard() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Profissional
        </h1>
        <p className="text-gray-500 mt-2">
          Visão geral do acompanhamento oncológico
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">{stat.trend}</p>
              </div>
              <div
                className={`size-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Evolution Chart */}
        <Card className="lg:col-span-2 p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-purple-600" />
            Evolução Clínica por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
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
              <Bar dataKey="normal" fill="#10b981" name="Normal" radius={[8, 8, 0, 0]} />
              <Bar
                dataKey="atencao"
                fill="#f59e0b"
                name="Atenção"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="critico"
                fill="#ef4444"
                name="Crítico"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Treatment Distribution */}
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="size-5 text-purple-600" />
            Distribuição por Tratamento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={treatmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {treatmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Patients and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <Card className="lg:col-span-2 p-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="size-5 text-purple-600" />
              Pacientes Recentes
            </h3>
            <Link
              to="/pacientes"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/pacientes/${patient.id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-all duration-200 border border-gray-100"
              >
                <div
                  className={`size-12 rounded-full flex items-center justify-center font-semibold text-white ${
                    patient.status === 'critical'
                      ? 'bg-gradient-to-br from-red-400 to-red-600'
                      : patient.status === 'attention'
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      : 'bg-gradient-to-br from-green-400 to-green-600'
                  }`}
                >
                  {patient.name.split(' ')[0][0]}
                  {patient.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {patient.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {patient.age} anos • {patient.diagnosis}
                  </p>
                  {patient.alert && (
                    <p className="text-xs text-red-600 mt-1">{patient.alert}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      patient.status === 'critical'
                        ? 'destructive'
                        : patient.status === 'attention'
                        ? 'outline'
                        : 'secondary'
                    }
                    className="mb-1"
                  >
                    {patient.status === 'critical'
                      ? 'Crítico'
                      : patient.status === 'attention'
                      ? 'Atenção'
                      : 'Estável'}
                  </Badge>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Calendar className="size-3" />
                    {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Clinical Alerts */}
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="size-5 text-purple-600" />
            Alertas Clínicos
          </h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border-l-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`size-5 mt-0.5 ${
                      alert.type === 'critical'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      {alert.patient}
                    </p>
                    <p className="text-xs text-gray-700 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
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
