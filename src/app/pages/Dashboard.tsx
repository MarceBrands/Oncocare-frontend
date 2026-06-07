import { useEffect, useState } from 'react';
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
import { getDashboard, type DashboardData } from '../../lib/api';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setData(await getDashboard());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro inesperado.');
      }
    }

    loadDashboard();
  }, []);

  const dashboardData = data ?? {
    statsCards: [],
    evolutionData: [],
    treatmentData: [],
    recentPatients: [],
    alerts: [],
  };
  const iconMap = {
    users: Users,
    alert: AlertTriangle,
    activity: Activity,
    heart: Heart,
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Profissional
        </h1>
        <p className="text-gray-500 mt-2">
          Visão geral do acompanhamento oncológico
        </p>
        {!data && !error && <p className="mt-2 text-sm text-gray-500">Carregando dados...</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardData.statsCards.map((stat) => {
          const StatIcon =
            typeof stat.icon === 'string'
              ? iconMap[stat.icon as keyof typeof iconMap] ?? Activity
              : stat.icon;

          return (
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
                <StatIcon className="size-6 text-white" />
              </div>
            </div>
          </Card>
          );
        })}
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
            <BarChart data={dashboardData.evolutionData}>
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
                data={dashboardData.treatmentData}
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
                {dashboardData.treatmentData.map((entry, index) => (
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
            {dashboardData.recentPatients.map((patient) => (
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
            {dashboardData.alerts.map((alert) => (
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
