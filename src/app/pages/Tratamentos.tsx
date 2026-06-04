import { Outlet } from 'react-router';
import { Activity, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const treatments = [
  {
    id: 1,
    patient: 'Maria Santos Silva',
    type: 'Quimioterapia',
    protocol: 'AC-T',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-07-15',
    progress: 70,
    sessions: { completed: 8, total: 12 },
    nextSession: '2026-06-05',
    adverseEffects: ['Fadiga intensa', 'Náusea', 'Queda de cabelo'],
  },
  {
    id: 2,
    patient: 'Ana Paula Oliveira',
    type: 'Radioterapia',
    protocol: 'IMRT Pélvica',
    status: 'active',
    startDate: '2026-04-15',
    endDate: '2026-06-30',
    progress: 55,
    sessions: { completed: 14, total: 25 },
    nextSession: '2026-06-02',
    adverseEffects: ['Fadiga leve', 'Irritação cutânea'],
  },
  {
    id: 3,
    patient: 'Juliana Costa',
    type: 'Hormonioterapia',
    protocol: 'Tamoxifeno',
    status: 'active',
    startDate: '2026-01-10',
    endDate: '2031-01-10',
    progress: 10,
    sessions: { completed: 4, total: 60 },
    nextSession: '2026-07-10',
    adverseEffects: ['Fogachos', 'Alterações de humor'],
  },
  {
    id: 4,
    patient: 'Fernanda Lima',
    type: 'Braquiterapia',
    protocol: 'HDR',
    status: 'scheduled',
    startDate: '2026-06-10',
    endDate: '2026-06-24',
    progress: 0,
    sessions: { completed: 0, total: 4 },
    nextSession: '2026-06-10',
    adverseEffects: [],
  },
];

const stats = [
  {
    label: 'Total de Tratamentos',
    value: 64,
    color: 'from-purple-500 to-purple-600',
  },
  { label: 'Em Andamento', value: 42, color: 'from-blue-500 to-blue-600' },
  { label: 'Concluídos este mês', value: 8, color: 'from-green-500 to-green-600' },
  { label: 'Agendados', value: 14, color: 'from-pink-500 to-pink-600' },
];

export function Tratamentos() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tratamentos</h1>
        <p className="text-gray-500 mt-2">
          Acompanhe os tratamentos oncológicos em andamento
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
          >
            <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <div
              className={`mt-3 h-2 bg-gradient-to-r ${stat.color} rounded-full`}
            />
          </Card>
        ))}
      </div>

      {/* Treatments List */}
      <div className="space-y-6">
        {treatments.map((treatment) => (
          <Card
            key={treatment.id}
            className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left side - Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {treatment.patient}
                    </h3>
                    <p className="text-gray-500">
                      {treatment.type} • {treatment.protocol}
                    </p>
                  </div>
                  <Badge
                    variant={
                      treatment.status === 'active'
                        ? 'default'
                        : treatment.status === 'scheduled'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      treatment.status === 'active'
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : ''
                    }
                  >
                    {treatment.status === 'active'
                      ? 'Em Andamento'
                      : treatment.status === 'scheduled'
                      ? 'Agendado'
                      : 'Concluído'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Período</p>
                      <p className="text-sm font-medium">
                        {new Date(treatment.startDate).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(treatment.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="size-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Próxima Sessão</p>
                      <p className="text-sm font-medium">
                        {new Date(treatment.nextSession).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {treatment.adverseEffects.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="size-4 text-amber-600" />
                      Efeitos Adversos:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {treatment.adverseEffects.map((effect, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Progress */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Progresso do Tratamento
                  </p>
                  <div className="text-center mb-3">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {treatment.progress}
                      </span>
                      <span className="text-xl text-gray-600">%</span>
                    </div>
                  </div>
                  <Progress value={treatment.progress} className="h-3 mb-3" />
                  <p className="text-sm text-center text-gray-600">
                    {treatment.sessions.completed} de {treatment.sessions.total}{' '}
                    sessões
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Outlet />
    </>
  );
}
